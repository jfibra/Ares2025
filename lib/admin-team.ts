import { isAdminTeam } from "@/lib/direct-teams"
import { hasPaymentDetails, type TlPaymentAccount } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { normalizeFacebookUrl, type LeaderContact } from "@/lib/tl-contact"
import { getTlPaymentDetails } from "@/lib/tl-payment"

// Server only. The person who looks after a team the admin handles directly (Team Tycoons):
// their name, contact number and Facebook link, set by the admin. The team's agents see them,
// with the team's own payment accounts, after registering. The admin still confirms payments.

const KEY = "admin_team_handler"

export type AdminTeamHandler = { name: string; contact_number: string; facebook_url: string | null }

export async function getAdminTeamHandler(): Promise<AdminTeamHandler | null> {
  const { data, error } = await createSupabaseAdmin().from("app_settings").select("value").eq("key", KEY).maybeSingle()
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
export async function saveAdminTeamHandler(input: Record<string, unknown> | null): Promise<HandlerSave> {
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
    .upsert({ key: KEY, value: JSON.stringify(handler), updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
  return { ok: true, handler }
}

/**
 * What an agent with no team leader is shown after registering: where to pay and whom to ask.
 * For a team the admin handles, that is the team's own accounts and its handler, when the admin
 * has set them; otherwise (and for everyone else the admin looks after) the admin's general accounts.
 */
export async function getAdminPaymentFor(team: string): Promise<{
  payment: TlPaymentAccount[] | null
  /** Who to pay, by name; null means "the ARES admin". */
  payee: string | null
  contact: LeaderContact | null
}> {
  if (isAdminTeam(team)) {
    const [handler, teamAccounts] = await Promise.all([
      getAdminTeamHandler().catch(() => null),
      getTlPaymentDetails("admin-team").catch(() => null),
    ])
    const payment = hasPaymentDetails(teamAccounts) ? teamAccounts : await getTlPaymentDetails("admin").catch(() => null)
    return {
      payment,
      payee: handler?.name ?? null,
      contact: handler ? { facebook_url: handler.facebook_url, contact_number: handler.contact_number || null } : null,
    }
  }
  return { payment: await getTlPaymentDetails("admin").catch(() => null), payee: null, contact: null }
}
