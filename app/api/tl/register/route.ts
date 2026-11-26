import { NextResponse } from "next/server"
import { EMAIL_PATTERN } from "@/lib/agent-registration"
import { findTeamLeaderByEmail, setSession } from "@/lib/auth"
import { TEAM_LEADER_COLUMNS, type TeamLeader } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { photosIn, photosProblem, removePhotos, storePhotos } from "@/lib/photo-store"
import { isValidTlInvite } from "@/lib/tl-invite"
import { checkOwnTicket, saveOwnTicket } from "@/lib/tl-ticket"
import { TL_VERIFY_MESSAGES, verifyTeamLeader } from "@/lib/tl-verify"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")
const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/**
 * Team leader sign-up. Needs the invite token from the admin's link or QR code, and the
 * email must belong to a team leader in the LR records. Name and team come from that record.
 * A team leader who attends also saves their own registration here (see lib/tl-ticket).
 * One who cannot attend (`not_attending`) still gets an account, so their agents have a team
 * leader to confirm them: they give a reason instead, kept in `team_leader_declines`.
 * Sent as a form, because it carries a formal photo of each person joining (used for their poster).
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return fail("Invalid request.")
  const body: Record<string, unknown> = {}
  for (const key of ["invite", "email", "contact_number", "password", "birth_date", "whatsapp_number", "polo_shirt_size", "polo_shirt_size_2", "attending", "not_attending", "reason"]) {
    const value = form.get(key)
    if (typeof value === "string") body[key] = value
  }
  const photos = photosIn(form)

  try {
    if (!(await isValidTlInvite(body.invite))) {
      return fail("This registration link is no longer valid. Please ask the admin for a new one.", 403)
    }

    const email = text(body.email).toLowerCase()
    const contactNumber = text(body.contact_number)
    const password = typeof body.password === "string" ? body.password : ""
    const notAttending = body.not_attending === "1"
    const reason = text(body.reason)

    const errors: string[] = []
    if (notAttending && !reason) errors.push("Please tell us why you can't attend.")
    if (notAttending && reason.length > 1000) errors.push("Please keep your reason under 1000 characters.")
    if (!EMAIL_PATTERN.test(email) || email.length > 320) errors.push("Please enter a valid email address.")
    if (contactNumber.length < 5 || contactNumber.length > 40) errors.push("Please enter your contact number.")
    if (password.length < 8 || password.length > 72) errors.push("Your password must be 8 to 72 characters.")
    if (errors.length) return fail(errors.join(" "))

    if (await findTeamLeaderByEmail(email)) {
      return fail("This email is already registered as a team leader. Please sign in instead.", 409)
    }

    // Checked again here, so skipping the first step in the browser gets nobody in.
    const verification = await verifyTeamLeader(email)
    if (verification.status !== "verified") {
      return fail(TL_VERIFY_MESSAGES[verification.status], verification.status === "unavailable" ? 503 : 403)
    }
    const name = verification.leader.name.slice(0, 200)
    const team = verification.leader.team.slice(0, 200)

    // Their own ticket is checked before the account is made, so a rejected field leaves nothing behind.
    const ticket = notAttending ? null : await checkOwnTicket(name, body)
    if (ticket && !ticket.ok) {
      return NextResponse.json({ success: false, field: ticket.field, message: ticket.message }, { status: ticket.status })
    }
    if (ticket?.ok) {
      const photoProblem = photosProblem(photos, ticket.ticket.attendee_count)
      if (photoProblem) return NextResponse.json({ success: false, field: "photo", message: photoProblem }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })
    if (createError || !created?.user) {
      // Never reset the password of an account that already exists.
      if (createError?.code === "email_exists" || createError?.status === 422) {
        return fail("An account with this email already exists. Please contact the admin.", 409)
      }
      throw createError ?? new Error("User was not created")
    }

    const { data: leader, error: insertError } = await supabase
      .from("team_leaders")
      .insert({ user_id: created.user.id, name, email, contact_number: contactNumber, team })
      .select(TEAM_LEADER_COLUMNS)
      .single()
    if (insertError || !leader) {
      await supabase.auth.admin.deleteUser(created.user.id) // undo the half-made account
      if (insertError?.code === "23505") {
        return fail("This email is already registered as a team leader. Please sign in instead.", 409)
      }
      throw insertError ?? new Error("Team leader was not created")
    }

    let photoPaths: string[] = []
    try {
      if (ticket?.ok) {
        photoPaths = await storePhotos(photos)
        await saveOwnTicket(leader as TeamLeader, ticket.ticket, photoPaths)
        // They are attending: drop any earlier "can't attend" answer.
        await supabase.from("team_leader_declines").delete().eq("email", email)
      } else {
        // Not attending: keep the reason. Answering again just updates the earlier one.
        const { error: declineError } = await supabase
          .from("team_leader_declines")
          .upsert({ name, email, team, reason, declined_at: new Date().toISOString() }, { onConflict: "email" })
        if (declineError) throw declineError
      }
    } catch (saveError) {
      await removePhotos(photoPaths)
      // Undo the account, so they can simply try again.
      await supabase.from("team_leaders").delete().eq("id", (leader as TeamLeader).id)
      await supabase.auth.admin.deleteUser(created.user.id)
      throw saveError
    }

    setSession(email, "tl")
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Team leader registration failed:", error)
    return fail("We could not complete your registration. Please try again.", 500)
  }
}
