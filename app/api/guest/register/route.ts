import { NextResponse } from "next/server"
import { EMAIL_PATTERN } from "@/lib/agent-registration"
import { resolveGuestInvite } from "@/lib/guest-invite"
import { GUEST_TEAM, resolveGuest } from "@/lib/guest-registration"
import { getRegistrationFee, getSlotsLeft } from "@/lib/payments"
import { photosIn, photosProblem, removePhotos, storePhotos } from "@/lib/photo-store"
import { resolveAttendance, resolvePartnerBirthDate, resolvePartnerPoloSize, validateAgentDetails } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getTlPaymentDetails } from "@/lib/tl-payment"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")
const fail = (message: string, status = 400, field?: string) => NextResponse.json({ success: false, field, message }, { status })

/**
 * Special registration for a guest, through the admin's private link. Whether the guest is an
 * LR agent is checked here again, never taken from the browser. A guest pays the admin.
 * Sent as a form, because it carries a formal photo of each person joining.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return fail("Invalid request.")
  const field = (name: string) => {
    const value = form.get(name)
    return typeof value === "string" ? value : undefined
  }
  const photos = photosIn(form)
  const email = text(field("email")).toLowerCase()
  if (!EMAIL_PATTERN.test(email) || email.length > 320) return fail("Please enter a valid email address.", 400, "email")

  const details = validateAgentDetails({
    birth_date: field("birth_date"),
    whatsapp_number: field("whatsapp_number"),
    polo_shirt_size: field("polo_shirt_size"),
  })
  if (!details.ok) return fail(details.message, 400, details.field)

  try {
    const invite = await resolveGuestInvite(field("invite"))
    if (!invite) {
      return fail("This registration link is no longer valid. Please ask the ARES admin for a new one.", 403)
    }
    const guest = await resolveGuest(email)
    if (guest.status === "unavailable") return fail("We could not check your email right now. Please try again in a moment.", 503)
    if (guest.status === "already_registered") return fail("This email is already registered for ARES 2027.", 409)

    // An LR agent is registered under the name on their LR record; anyone else types their own.
    const agent = guest.agent
    const name = agent ? agent.name.slice(0, 200) : text(field("name")).replace(/\s+/g, " ")
    if (name.length < 2 || name.length > 200) return fail("Please enter your full name.", 400, "name")
    const contactNumber = text(field("contact_number")) || agent?.contact_number || ""
    if (contactNumber.length < 5 || contactNumber.length > 40) return fail("Please enter your contact number.", 400, "contact_number")

    // Only an LR record can be for a couple; a guest who typed their name is one person.
    const attendance = agent ? resolveAttendance(agent.name, field("attending")) : { ok: true as const, attendee_count: 1, attendees: null }
    if (!attendance.ok) return fail(attendance.message, 400, "attending")
    const partnerSize = resolvePartnerPoloSize(attendance.attendee_count, field("polo_shirt_size_2"))
    if (!partnerSize.ok) return fail(partnerSize.message, 400, "polo_shirt_size_2")
    const partnerBirth = resolvePartnerBirthDate(attendance.attendee_count, field("birth_date_2"))
    if (!partnerBirth.ok) return fail(partnerBirth.message, 400, "birth_date_2")
    const photoProblem = photosProblem(photos, attendance.attendee_count)
    if (photoProblem) return fail(photoProblem, 400, "photo")

    const slotsLeft = await getSlotsLeft()
    if (slotsLeft <= 0) return NextResponse.json({ success: false, status: "full", message: "All slots for ARES 2027 have been taken." }, { status: 409 })
    if (attendance.attendee_count > slotsLeft) {
      return fail("Only 1 slot is left, so only one of you can register. Please choose who is joining.", 400, "attending")
    }

    const photoPaths = await storePhotos(photos)
    const { error } = await createSupabaseAdmin().from("registrations").insert({
      name,
      email,
      contact_number: contactNumber,
      ...details.details,
      polo_shirt_size_2: partnerSize.polo_shirt_size_2,
      birth_date_2: partnerBirth.birth_date_2,
      attendee_count: attendance.attendee_count,
      attendees: attendance.attendees,
      photo_paths: photoPaths,
      team: agent ? agent.team : GUEST_TEAM,
      // A guest has no team leader: the admin takes the payment and confirms it.
      team_leader_id: null,
      team_leader_name: null,
      guest_type: agent ? "lr_agent" : "non_lr",
      // Whose guest they are, when they came through a team leader's own link.
      guest_of_team_leader_id: invite.leader?.id ?? null,
      guest_of_registration_id: invite.agent?.id ?? null,
    })
    if (error) {
      await removePhotos(photoPaths) // nothing was recorded, so drop the files
      if (error.code === "23505") return fail("This email is already registered for ARES 2027.", 409)
      throw error
    }

    const [fee, payment] = await Promise.all([getRegistrationFee().catch(() => null), getTlPaymentDetails("admin").catch(() => null)])
    return NextResponse.json(
      { success: true, name, fee: fee === null ? null : fee * attendance.attendee_count, attendee_count: attendance.attendee_count, payment },
      { status: 201 },
    )
  } catch (error) {
    console.error("Guest registration failed:", error)
    return fail("We could not save your registration. Please try again.", 500)
  }
}
