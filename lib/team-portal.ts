import { getAdminTeamHandler, isAdminTeamRow, type AdminTeamHandler } from "@/lib/admin-team"
import { adminTeamOf, type AdminTeam } from "@/lib/direct-teams"
import { getRegistrationFee } from "@/lib/payments"
import { REGISTRATION_COLUMNS, type Registration, type TlPaymentAccount } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getTlPaymentDetails } from "@/lib/tl-payment"

// Server only. Everything the account of an admin-handled team sees: that team's registrations, the
// contact details its agents are shown, the fee, and the admin's payment accounts (read only).

export type TeamPortalData = {
  registrations: Registration[]
  handler: AdminTeamHandler | null
  fee: number | null
  accounts: TlPaymentAccount[]
}

export async function loadTeamRegistrations(team: AdminTeam): Promise<Registration[]> {
  const { data, error } = await createSupabaseAdmin()
    .from("registrations")
    .select(REGISTRATION_COLUMNS)
    .is("team_leader_id", null)
    .is("guest_type", null)
    .order("registration_date", { ascending: false })
  if (error) throw error
  return ((data ?? []) as Registration[]).filter((r) => isAdminTeamRow(r) && adminTeamOf(r.team) === team).map((r) => ({ ...r, amount: r.amount === null ? null : Number(r.amount) }))
}

export async function loadTeamPortal(team: AdminTeam): Promise<TeamPortalData> {
  const [registrations, handler, fee, accounts] = await Promise.all([
    loadTeamRegistrations(team),
    getAdminTeamHandler(team).catch(() => null),
    getRegistrationFee().catch(() => null),
    getTlPaymentDetails("admin").catch(() => []),
  ])
  return { registrations, handler, fee, accounts }
}
