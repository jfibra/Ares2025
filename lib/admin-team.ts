import { ADMIN_TEAMS, adminTeamOf, isAdminTeam, type AdminTeam } from "@/lib/direct-teams"
import type { TlPaymentAccount } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { normalizeFacebookUrl, type LeaderContact } from "@/lib/tl-contact"
import { getTlPaymentDetails } from "@/lib/tl-payment"

// Server only. The teams the admin handles directly (Team Tycoons, Leuterio Direct). Each has
// accounts for the people who look after it, and one set of contact details (a name, a number,
// a Facebook link) that those people fill in. The team's agents see that contact after
// registering, and pay into the admin's own accounts.

const keyOf = (team: AdminTeam) => `admin_team_handler:${team}`

export type AdminTeamHandler = { name: string; contact_number: string; facebook_url: string | null }

export async function getAdminTeamHandler(team: AdminTeam): Promise<AdminTeamHandler | null> {
  const { data, error } = await createSupabaseAdmin().from("app_settings").select("value").eq("key", keyOf(team)).maybeSingle()
  if (error) throw error
  if (!data?.value) return null
  try {
    const saved = JSON.parse(data.value)
    if (typeof saved?.name !== "string" || !saved.name) return null
    return {
      name: saved.name,
      contact_number: typeof saved.contact_number === "string" ? saved.contact_number : "",
      facebook_url: typeof saved.facebook_url === "string" && saved.facebook_url ? saved.facebook_url : null,
    }
  } catch {
    return null
  }
}

export type HandlerSave = { ok: true; handler: AdminTeamHandler } | { ok: false; message: string }

/** Checks and saves what the admin typed. The Facebook link is optional. */
export async function saveAdminTeamHandler(team: AdminTeam, input: Record<string, unknown> | null): Promise<HandlerSave> {
  const text = (value: unknown) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "")
  const name = text(input?.name)
  const contactNumber = text(input?.contact_number)
  const facebookRaw = text(input?.facebook_url)
  if (name.length < 2 || name.length > 200) return { ok: false, message: "Enter the name of the person handling this team." }
  if (contactNumber.length < 5 || contactNumber.length > 40) return { ok: false, message: "Enter their contact number." }
  const facebookUrl = facebookRaw ? normalizeFacebookUrl(facebookRaw) : null
  if (facebookRaw && !facebookUrl) {
    return { ok: false, message: "That does not look like a Facebook link. Example: https://www.facebook.com/juan.delacruz" }
  }
  const handler: AdminTeamHandler = { name, contact_number: contactNumber, facebook_url: facebookUrl }
  const { error } = await createSupabaseAdmin()
    .from("app_settings")
    .upsert({ key: keyOf(team), value: JSON.stringify(handler), updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
  return { ok: true, handler }
}

/**
 * What an agent with no team leader is shown after registering: where to pay and whom to ask.
 * Always the admin's accounts. For a team the admin handles, the person to pay and ask is the
 * team's handler, once that is set.
 */
export async function getAdminPaymentFor(team: string): Promise<{
  payment: TlPaymentAccount[] | null
  /** Who to pay, by name; null means "the ARES admin". */
  payee: string | null
  contact: LeaderContact | null
}> {
  const adminTeam = adminTeamOf(team)
  if (adminTeam) {
    // The team's agents pay into the admin's own accounts; only the contact person is theirs.
    const [handler, payment] = await Promise.all([getAdminTeamHandler(adminTeam).catch(() => null), getTlPaymentDetails("admin").catch(() => null)])
    return {
      payment,
      payee: handler?.name ?? null,
      contact: handler ? { facebook_url: handler.facebook_url, contact_number: handler.contact_number || null } : null,
    }
  }
  return { payment: await getTlPaymentDetails("admin").catch(() => null), payee: null, contact: null }
}

/** True for a registration of the team the admin handles: no team leader, not a guest, on that team. */
export const isAdminTeamRow = (row: { team: string; team_leader_id: number | null; guest_type?: string | null }) =>
  row.team_leader_id === null && !row.guest_type && isAdminTeam(row.team)

// ---- The team's own accounts (the secretaries) ----------------------------------------

export type TeamAccount = { email: string; team: string; created_at: string }

export async function listTeamAccounts(): Promise<TeamAccount[]> {
  const { data, error } = await createSupabaseAdmin().from("team_accounts").select("email,team,created_at").order("created_at")
  if (error) throw error
  return (data ?? []) as TeamAccount[]
}

export type AccountChange = { ok: true } | { ok: false; status: number; message: string }

/** The admin creates a sign-in for a secretary. Never changes the password of an account that already exists. */
export async function createTeamAccount(rawEmail: unknown, rawPassword: unknown, rawTeam: unknown): Promise<AccountChange> {
  const team = ADMIN_TEAMS.find((adminTeam) => adminTeam === rawTeam)
  if (!team) return { ok: false, status: 400, message: "Choose which team this account is for." }
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : ""
  const password = typeof rawPassword === "string" ? rawPassword : ""
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return { ok: false, status: 400, message: "Enter a valid email address." }
  if (password.length < 8 || password.length > 72) return { ok: false, status: 400, message: "The password must be 8 to 72 characters." }

  const supabase = createSupabaseAdmin()
  const { data: created, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (error || !created?.user) {
    if (error?.code === "email_exists" || error?.status === 422) {
      return { ok: false, status: 409, message: "This email already has an account (admin, team leader or another sign-in). Use a different email." }
    }
    throw error ?? new Error("Account was not created")
  }
  const { error: insertError } = await supabase.from("team_accounts").insert({ email, team, user_id: created.user.id })
  if (insertError) {
    await supabase.auth.admin.deleteUser(created.user.id) // undo the half-made account
    throw insertError
  }
  return { ok: true }
}

/** Removes the account: access ends at once, and its sign-in is deleted. */
export async function removeTeamAccount(rawEmail: string): Promise<AccountChange> {
  const email = rawEmail.trim().toLowerCase()
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.from("team_accounts").delete().eq("email", email).select("user_id").maybeSingle()
  if (error) throw error
  if (data?.user_id) await supabase.auth.admin.deleteUser(data.user_id)
  return { ok: true }
}
