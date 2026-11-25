import { randomBytes, timingSafeEqual } from "crypto"
import { createSupabaseAdmin } from "@/lib/supabase-server"

// The team leader registration page only opens with this token in the link.
// Admins see the link (and its QR code) in the admin dashboard and can replace it.

// The link is /join/<code>. The code is short so the link is easy to send and type: 8 letters and
// digits, leaving out the ones that are easy to mix up (0/O, 1/l/I). It only opens the page;
// registering still needs an email the LR records list as a team leader.
//
// Links handed out before the short code existed (/tl/register?invite=<long token>) keep working
// until the admin creates a new link.

const KEY = "tl_invite_token" // the earlier, long token
const CODE_KEY = "tl_invite_code"
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789" // 31 characters
const newCode = () => Array.from(randomBytes(8), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("")

async function readSetting(key: string): Promise<string | null> {
  const { data, error } = await createSupabaseAdmin().from("app_settings").select("value").eq("key", key).maybeSingle()
  if (error) throw error
  return data?.value || null
}

/** The short code in the link the admin shares. Created the first time it is asked for. */
export async function getTlInviteCode(): Promise<string> {
  const existing = await readSetting(CODE_KEY)
  if (existing) return existing
  // If two requests race, keep whichever was stored first.
  await createSupabaseAdmin().from("app_settings").upsert({ key: CODE_KEY, value: newCode() }, { onConflict: "key", ignoreDuplicates: true })
  const stored = await readSetting(CODE_KEY)
  if (!stored) throw new Error("The invite code could not be created")
  return stored
}

/** Replaces the code, so every link and QR code handed out before stops working, the earlier long links included. */
export async function regenerateTlInviteCode(): Promise<string> {
  const value = newCode()
  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from("app_settings").upsert({ key: CODE_KEY, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
  const { error: oldError } = await supabase.from("app_settings").delete().eq("key", KEY)
  if (oldError) throw oldError
  return value
}

const sameText = (expected: string, given: string) => {
  const a = Buffer.from(expected)
  const b = Buffer.from(given)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** True for the current short code, and for the earlier long token while it has not been replaced. */
export async function isValidTlInvite(candidate: unknown): Promise<boolean> {
  if (typeof candidate !== "string" || !candidate) return false
  const [code, oldToken] = await Promise.all([getTlInviteCode(), readSetting(KEY)])
  // Codes are lower case; accept one typed in capitals.
  return sameText(code, candidate.toLowerCase()) || Boolean(oldToken && sameText(oldToken, candidate))
}
