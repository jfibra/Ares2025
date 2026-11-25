import { createSupabaseAdmin } from "@/lib/supabase-server"

// Server only. The people who attended ARES 2025, by LR email. They get to register first.

const TABLE = "ares_2025_attendees"
export const MAX_ATTENDEES_PER_REQUEST = 5000

/** True when this email is on the ARES 2025 attendee list. */
export async function isPastAttendee(email: string): Promise<boolean> {
  const { data, error } = await createSupabaseAdmin().from(TABLE).select("email").eq("email", email.trim().toLowerCase()).maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function listPastAttendees(): Promise<string[]> {
  const { data, error } = await createSupabaseAdmin().from(TABLE).select("email").order("email").limit(100_000)
  if (error) throw error
  return (data ?? []).map((row) => row.email as string)
}

/**
 * Picks the email addresses out of pasted text: one per line, a spreadsheet column, or
 * "Name <email>" all work. Lower-cased, with repeats removed.
 */
export function parseEmails(text: string): string[] {
  const found = text.toLowerCase().match(/[^\s,;<>()"']+@[^\s,;<>()"']+\.[^\s,;<>()"']+/g) ?? []
  return [...new Set(found.map((email) => email.replace(/[.:]+$/, "")).filter((email) => email.length <= 320))]
}

export async function addPastAttendees(emails: string[]) {
  if (!emails.length) return
  const { error } = await createSupabaseAdmin()
    .from(TABLE)
    .upsert(emails.map((email) => ({ email })), { onConflict: "email", ignoreDuplicates: true })
  if (error) throw error
}

export async function removePastAttendees(emails: string[]) {
  if (!emails.length) return
  const { error } = await createSupabaseAdmin().from(TABLE).delete().in("email", emails)
  if (error) throw error
}
