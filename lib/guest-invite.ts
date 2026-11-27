import { randomBytes, timingSafeEqual } from "crypto"
import { createSupabaseAdmin } from "@/lib/supabase-server"

// Guests register through a private link the admin hands out: /guest/<code>. It works like the
// team leader link (see lib/tl-invite), with its own code, so replacing one leaves the other alone.

const CODE_KEY = "guest_invite_code"
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789" // no 0/O or 1/l/I, which are easy to mix up
const newCode = () => Array.from(randomBytes(8), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")

async function readCode(): Promise<string | null> {
  const { data, error } = await createSupabaseAdmin().from("app_settings").select("value").eq("key", CODE_KEY).maybeSingle()
  if (error) throw error
  return data?.value || null
}

/** The short code in the link the admin shares. Created the first time it is asked for. */
export async function getGuestInviteCode(): Promise<string> {
  const existing = await readCode()
  if (existing) return existing
  // If two requests race, keep whichever was stored first.
  const { error } = await createSupabaseAdmin()
    .from("app_settings")
    .upsert({ key: CODE_KEY, value: newCode() }, { onConflict: "key", ignoreDuplicates: true })
  if (error) throw error
  const stored = await readCode()
  if (!stored) throw new Error("The guest invite code could not be created")
  return stored
}

/** Replaces the code, so every guest link and QR code handed out before stops working. */
export async function regenerateGuestInviteCode(): Promise<string> {
  const value = newCode()
  const { error } = await createSupabaseAdmin()
    .from("app_settings")
    .upsert({ key: CODE_KEY, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
  return value
}

/** True for the current code, without regard to capitals. */
export async function isValidGuestInvite(candidate: unknown): Promise<boolean> {
  if (typeof candidate !== "string" || !candidate) return false
  const expected = Buffer.from((await getGuestInviteCode()).toLowerCase())
  const given = Buffer.from(candidate.toLowerCase())
  return expected.length === given.length && timingSafeEqual(expected, given)
}

// ---- A team leader's own guest link ----------------------------------------------------

/** Who a guest link belongs to: nobody (the admin's general link), one team leader, or one registered agent. */
export type GuestInvite = {
  leader: { id: number; name: string; team: string } | null
  /** `id` is the agent's registration. */
  agent: { id: number; name: string; team: string } | null
}

/**
 * Checks the code in a guest link. It is the admin's general code, one team leader's own code,
 * or one registered agent's own code; null when it is none of these.
 */
export async function resolveGuestInvite(candidate: unknown): Promise<GuestInvite | null> {
  if (typeof candidate !== "string" || !candidate) return null
  if (await isValidGuestInvite(candidate)) return { leader: null, agent: null }
  const code = candidate.trim().toLowerCase()
  if (!/^[a-z0-9]{6,20}$/.test(code)) return null
  const { data, error } = await createSupabaseAdmin().from("team_leaders").select("id,name,team").eq("guest_code", code).maybeSingle()
  if (error) throw error
  if (data) return { leader: { id: data.id, name: data.name, team: data.team }, agent: null }
  const { data: agent, error: agentError } = await createSupabaseAdmin().from("registrations").select("id,name,team").eq("guest_code", code).maybeSingle()
  if (agentError) throw agentError
  return agent ? { leader: null, agent: { id: agent.id, name: agent.name, team: agent.team } } : null
}

/** A registered agent's guest code, made the first time, or replaced when asked. Null when the registration does not exist. */
export async function createAgentGuestCode(registrationId: number, replace: boolean): Promise<string | null> {
  const supabase = createSupabaseAdmin()
  const { data: row, error } = await supabase.from("registrations").select("id,guest_code").eq("id", registrationId).maybeSingle()
  if (error) throw error
  if (!row) return null
  if (row.guest_code && !replace) return row.guest_code
  const code = newCode()
  const { error: saveError } = await supabase.from("registrations").update({ guest_code: code }).eq("id", registrationId)
  if (saveError) throw saveError
  return code
}

/** The team leader's guest code, made the first time, or replaced when asked. Null when the leader does not exist. */
export async function createLeaderGuestCode(leaderId: number, replace: boolean): Promise<string | null> {
  const supabase = createSupabaseAdmin()
  const { data: leader, error } = await supabase.from("team_leaders").select("id,guest_code").eq("id", leaderId).maybeSingle()
  if (error) throw error
  if (!leader) return null
  if (leader.guest_code && !replace) return leader.guest_code
  const code = newCode()
  const { error: saveError } = await supabase.from("team_leaders").update({ guest_code: code }).eq("id", leaderId)
  if (saveError) throw saveError
  return code
}
