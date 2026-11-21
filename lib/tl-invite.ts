import { randomBytes, timingSafeEqual } from "crypto"
import { createSupabaseAdmin } from "@/lib/supabase-server"

// The team leader registration page only opens with this token in the link.
// Admins see the link (and its QR code) in the admin dashboard and can replace it.

const KEY = "tl_invite_token"
const newToken = () => randomBytes(24).toString("base64url")

export async function getTlInviteToken(): Promise<string> {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.from("app_settings").select("value").eq("key", KEY).maybeSingle()
  if (error) throw error
  if (data?.value) return data.value
  // First use: create one. If two requests race, keep whichever was stored first.
  await supabase.from("app_settings").upsert({ key: KEY, value: newToken() }, { onConflict: "key", ignoreDuplicates: true })
  const { data: stored, error: readError } = await supabase.from("app_settings").select("value").eq("key", KEY).single()
  if (readError) throw readError
  return stored.value
}

/** Replaces the token, so every link and QR code handed out before stops working. */
export async function regenerateTlInviteToken(): Promise<string> {
  const value = newToken()
  const { error } = await createSupabaseAdmin()
    .from("app_settings")
    .upsert({ key: KEY, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
  return value
}

export async function isValidTlInvite(candidate: unknown): Promise<boolean> {
  if (typeof candidate !== "string" || !candidate) return false
  const expected = Buffer.from(await getTlInviteToken())
  const given = Buffer.from(candidate)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
