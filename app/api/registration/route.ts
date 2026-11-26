import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { EMAIL_PATTERN, resolveAgent } from "@/lib/agent-registration"
import { getRegistrationFee, getSlotsLeft } from "@/lib/payments"
import { MAX_PHOTO_BYTES, PHOTO_BUCKET, PHOTO_TYPES } from "@/lib/photo"
import { resolveAttendance, resolvePartnerBirthDate, resolvePartnerPoloSize, validateAgentDetails } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getTlPaymentDetails } from "@/lib/tl-payment"
import type { LeaderContact } from "@/lib/tl-contact"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const invalid = (field: string, message: string) =>
  NextResponse.json({ success: false, status: "invalid_details", field, message }, { status: 400 })

/**
 * Step 2: the agent said "yes, this is me". Details are looked up again here, never taken from the browser.
 * Sent as a form, because it carries a formal photo of each person joining (used for their poster).
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })
  const field = (name: string) => {
    const value = form.get(name)
    return typeof value === "string" ? value : undefined
  }
  const body = {
    birth_date: field("birth_date"),
    birth_date_2: field("birth_date_2"),
    whatsapp_number: field("whatsapp_number"),
    polo_shirt_size: field("polo_shirt_size"),
    polo_shirt_size_2: field("polo_shirt_size_2"),
    attending: field("attending"),
  }
  const photos = form.getAll("photo").filter((entry): entry is File => entry instanceof File && entry.size > 0)
  const email = (field("email") ?? "").trim()
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 })
  }

  const checked = validateAgentDetails(body)
  if (!checked.ok) {
    return NextResponse.json({ success: false, status: "invalid_details", field: checked.field, message: checked.message }, { status: 400 })
  }

  try {
    const result = await resolveAgent(email)
    if (result.status !== "found") {
      // Something changed since the lookup (or the request skipped it). Send the reason back.
      const {
        teamLeaderId: _teamLeaderId,
        attendeeCount: _attendeeCount,
        receiptAt: _receiptAt,
        ...rest
      } = { teamLeaderId: null, attendeeCount: 1, receiptAt: null, ...result }
      return NextResponse.json({ success: false, ...rest }, { status: 409 })
    }

    const { agent, teamLeader } = result
    // A couple's record must say who is joining; the name comes from our records, not the browser.
    const attendance = resolveAttendance(agent.name, body.attending)
    if (!attendance.ok) return invalid("attending", attendance.message)
    const partnerSize = resolvePartnerPoloSize(attendance.attendee_count, body.polo_shirt_size_2)
    if (!partnerSize.ok) return invalid("polo_shirt_size_2", partnerSize.message)
    const partnerBirth = resolvePartnerBirthDate(attendance.attendee_count, body.birth_date_2)
    if (!partnerBirth.ok) return invalid("birth_date_2", partnerBirth.message)

    // One clear, formal photo of each person joining.
    if (photos.length !== attendance.attendee_count) {
      return invalid(
        "photo",
        attendance.attendee_count === 2
          ? "Please upload a clear, formal photo of each of you."
          : "Please upload a clear, formal photo of yourself.",
      )
    }
    if (photos.some((photo) => !PHOTO_TYPES[photo.type])) return invalid("photo", "Your photo must be a JPG, PNG or WEBP image.")
    if (photos.some((photo) => photo.size > MAX_PHOTO_BYTES)) return invalid("photo", "Your photo is larger than 3 MB.")
    // Slots are limited; a couple who are both joining needs two.
    const slotsLeft = await getSlotsLeft()
    if (slotsLeft <= 0) return NextResponse.json({ success: false, status: "full" }, { status: 409 })
    if (attendance.attendee_count > slotsLeft) {
      return NextResponse.json(
        {
          success: false,
          status: "invalid_details",
          field: "attending",
          message: "Only 1 slot is left, so only one of you can register. Please choose who is joining.",
        },
        { status: 400 },
      )
    }
    const supabase = createSupabaseAdmin()
    const folder = randomUUID()
    const photoPaths: string[] = []
    const dropPhotos = () => (photoPaths.length ? supabase.storage.from(PHOTO_BUCKET).remove(photoPaths) : null)
    for (const [index, photo] of photos.entries()) {
      const path = `${folder}/${index + 1}.${PHOTO_TYPES[photo.type]}`
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type, upsert: false })
      if (uploadError) {
        await dropPhotos()
        throw uploadError
      }
      photoPaths.push(path)
    }

    const { error } = await supabase.from("registrations").insert({
      name: agent.name,
      email: agent.email,
      contact_number: agent.contact_number || null,
      ...checked.details,
      polo_shirt_size_2: partnerSize.polo_shirt_size_2,
      birth_date_2: partnerBirth.birth_date_2,
      attendee_count: attendance.attendee_count,
      attendees: attendance.attendees,
      photo_paths: photoPaths,
      team: agent.team,
      // No team leader id means theirs is not joining: the admin manages this registration.
      team_leader_id: teamLeader?.id ?? null,
      team_leader_name: teamLeader?.name ?? (agent.team_leader_name.slice(0, 200) || null),
    })
    if (error) {
      await dropPhotos() // nothing was recorded, so drop the files
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, status: "already_registered", confirmed: false, teamLeaderName: teamLeader?.name ?? null, admin_managed: !teamLeader },
          { status: 409 },
        )
      }
      throw error
    }
    const [fee, payment] = await Promise.all([
      getRegistrationFee().catch(() => null),
      getTlPaymentDetails(teamLeader?.id ?? "admin").catch(() => null),
    ])
    // `fee` is the total owed: double when both people on a couple's record are joining.
    return NextResponse.json(
      {
        success: true,
        team_leader: teamLeader?.name ?? null,
        admin_managed: !teamLeader,
        fee: fee === null ? null : fee * attendance.attendee_count,
        attendee_count: attendance.attendee_count,
        payment,
        // So the agent can reach their team leader about the payment.
        leader_contact: (teamLeader
          ? { facebook_url: teamLeader.facebook_url, contact_number: teamLeader.contact_number || null }
          : null) satisfies LeaderContact | null,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration insert failed:", error)
    return NextResponse.json(
      { success: false, message: "We could not save your registration. Please try again." },
      { status: 500 },
    )
  }
}
