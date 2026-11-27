import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { TEAM_LEADER_COLUMNS, type TeamLeader } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { adminTeamOf, type AdminTeam } from "@/lib/direct-teams"

// Server only. The session is a signed, http-only cookie holding the email and role.

// "team" is the account of the people who look after the team the admin handles (Team Tycoons).
export type Role = "admin" | "tl" | "team"

/** Where each kind of account lands after signing in. */
export const HOME_OF: Record<Role, string> = { admin: "/admin", tl: "/tl", team: "/team" }

export const SESSION_COOKIE = "ares_session"
const MAX_AGE_SECONDS = 60 * 60 * 8

function signingKey() {
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!secret) throw new Error("SUPABASE_SECRET_KEY must be set")
  // Derived, so the Supabase key itself is never used directly as the cookie key.
  return createHmac("sha256", secret).update("ares-session-v2").digest()
}

const sign = (payload: string) => createHmac("sha256", signingKey()).update(payload).digest("base64url")

export function setSession(email: string, role: Role) {
  const payload = Buffer.from(
    JSON.stringify({ email, role, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS }),
  ).toString("base64url")
  cookies().set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE)
}

function readSession(): { email: string; role: Role } | null {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null
  const [payload, signature] = token.split(".")
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const { email, role, exp } = JSON.parse(Buffer.from(payload, "base64url").toString())
    if (typeof email !== "string" || typeof exp !== "number" || exp < Date.now() / 1000) return null
    if (role !== "admin" && role !== "tl" && role !== "team") return null
    return { email, role }
  } catch {
    return null
  }
}

export async function isAllowedAdmin(email: string) {
  const { data, error } = await createSupabaseAdmin()
    .from("admin_users")
    .select("email")
    .eq("email", email.toLowerCase())
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function findTeamLeaderByEmail(email: string): Promise<TeamLeader | null> {
  const { data, error } = await createSupabaseAdmin()
    .from("team_leaders")
    .select(TEAM_LEADER_COLUMNS)
    .eq("email", email.toLowerCase())
    .maybeSingle()
  if (error) throw error
  return (data as TeamLeader | null) ?? null
}

/** The signed-in admin's email, or null. Re-checks the admin list, so removing someone takes effect at once. */
export async function getAdmin(): Promise<string | null> {
  const session = readSession()
  if (!session || session.role !== "admin") return null
  return (await isAllowedAdmin(session.email)) ? session.email : null
}

/** The signed-in team leader, or null. Re-checks that they still exist. */
export async function getTeamLeader(): Promise<TeamLeader | null> {
  const session = readSession()
  if (!session || session.role !== "tl") return null
  return findTeamLeaderByEmail(session.email)
}

export async function isTeamAccount(email: string) {
  const { data, error } = await createSupabaseAdmin().from("team_accounts").select("email").eq("email", email.toLowerCase()).maybeSingle()
  if (error) throw error
  return Boolean(data)
}

/** The signed-in account of an admin-handled team, with its team; or null. Re-checks the list, so removing an account takes effect at once. */
export async function getTeamAccount(): Promise<{ email: string; team: AdminTeam } | null> {
  const session = readSession()
  if (!session || session.role !== "team") return null
  const { data, error } = await createSupabaseAdmin().from("team_accounts").select("email,team").eq("email", session.email.toLowerCase()).maybeSingle()
  if (error) throw error
  const team = data ? adminTeamOf(data.team) : null
  return data && team ? { email: data.email, team } : null
}

/** Which portal a signed-in visitor belongs to, for redirects. */
export async function getSignedInRole(): Promise<Role | null> {
  if (await getAdmin()) return "admin"
  if (await getTeamLeader()) return "tl"
  if (await getTeamAccount()) return "team"
  return null
}
