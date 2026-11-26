import { DirectoryUnavailableError, lookupAgent, type DirectoryAgent } from "@/lib/agent-directory"
import { createSupabaseAdmin } from "@/lib/supabase-server"

// Special registration for guests. The email is checked against the LR records first, only to
// note whether the guest is an LR agent: a guest may register either way.

export const GUEST_TEAM = "Guest"

export type GuestResolution =
  /** `agent` is their LR record, or null when the email is not in the LR records. */
  | { status: "new"; agent: DirectoryAgent | null }
  | { status: "already_registered"; guest: boolean; confirmed: boolean; attendeeCount: number; receiptAt: string | null }
  /** The LR records could not be reached, so we cannot tell whether they are an LR agent. */
  | { status: "unavailable" }

export async function resolveGuest(rawEmail: string): Promise<GuestResolution> {
  const email = rawEmail.trim().toLowerCase()
  const { data: existing, error } = await createSupabaseAdmin()
    .from("registrations")
    .select("guest_type,confirmed_by_tl,attendee_count,agent_receipt_at")
    .eq("email", email)
    .maybeSingle()
  if (error) throw error
  if (existing) {
    return {
      status: "already_registered",
      guest: existing.guest_type !== null,
      confirmed: existing.confirmed_by_tl,
      attendeeCount: existing.attendee_count ?? 1,
      receiptAt: existing.agent_receipt_at ?? null,
    }
  }
  try {
    return { status: "new", agent: await lookupAgent(email) }
  } catch (lookupError) {
    if (lookupError instanceof DirectoryUnavailableError) {
      console.error("Guest lookup: LR records unavailable:", lookupError.message)
      return { status: "unavailable" }
    }
    throw lookupError
  }
}
