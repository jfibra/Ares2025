import { getSlotsLeft } from "@/lib/payments"
import { resolveAttendance, resolvePartnerPoloSize, validateAgentDetails, type AgentDetails, type TeamLeader } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"

// A team leader also attends, so they hold a registration of their own. It is an ordinary
// row in `registrations`, filed under themselves as team leader, so it is listed, confirmed
// and sent to the admin exactly like an agent's.

export type OwnTicket = AgentDetails & { polo_shirt_size_2: string | null; attendee_count: number; attendees: string | null }

export type OwnTicketCheck =
  | { ok: true; ticket: OwnTicket }
  | { ok: false; status: number; field?: string; message: string }

/**
 * Checks what a team leader entered for their own ticket, before anything is saved.
 * `name` is the name on their LR record: a couple's record must say who is joining.
 */
export async function checkOwnTicket(name: string, input: Record<string, unknown>): Promise<OwnTicketCheck> {
  const details = validateAgentDetails(input)
  if (!details.ok) return { ok: false, status: 400, field: details.field, message: details.message }

  const attendance = resolveAttendance(name, input.attending)
  if (!attendance.ok) return { ok: false, status: 400, field: "attending", message: attendance.message }
  const partnerSize = resolvePartnerPoloSize(attendance.attendee_count, input.polo_shirt_size_2)
  if (!partnerSize.ok) return { ok: false, status: 400, field: "polo_shirt_size_2", message: partnerSize.message }

  // Slots are limited; a couple who are both joining needs two.
  const slotsLeft = await getSlotsLeft()
  if (slotsLeft <= 0) {
    return { ok: false, status: 409, message: "All slots for ARES 2027 have been taken, so we cannot register you. Please contact the ARES admin." }
  }
  if (attendance.attendee_count > slotsLeft) {
    return {
      ok: false,
      status: 400,
      field: "attending",
      message: "Only 1 slot is left, so only one of you can register. Please choose who is joining.",
    }
  }
  return { ok: true, ticket: { ...details.details, polo_shirt_size_2: partnerSize.polo_shirt_size_2, attendee_count: attendance.attendee_count, attendees: attendance.attendees } }
}

/** Saves the team leader's own registration. "exists" means they already have one, which is left as it is. */
/** `photoPaths` are the stored formal photos, one per person joining. */
export async function saveOwnTicket(leader: TeamLeader, ticket: OwnTicket, photoPaths: string[]): Promise<"saved" | "exists"> {
  const { error } = await createSupabaseAdmin().from("registrations").insert({
    name: leader.name,
    email: leader.email,
    contact_number: leader.contact_number,
    ...ticket,
    photo_paths: photoPaths,
    team: leader.team,
    team_leader_id: leader.id,
    team_leader_name: leader.name,
  })
  if (!error) return "saved"
  if (error.code === "23505") return "exists"
  throw error
}
