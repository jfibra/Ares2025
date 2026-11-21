import type { Metadata } from "next"
import { redirect } from "next/navigation"
import PortalDashboard from "@/components/portal-dashboard"
import { getAdmin } from "@/lib/auth"
import { loadDashboardData } from "@/lib/payments"
import { TEAM_LEADER_COLUMNS, type TeamLeader } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getTlInviteToken } from "@/lib/tl-invite"

export const metadata: Metadata = { title: "Admin - Registrations", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const admin = await getAdmin()
  if (!admin) redirect("/admin/login")

  const [data, teamLeaders, inviteToken] = await Promise.all([
    loadDashboardData().catch((error) => {
      console.error("Admin page could not load registrations:", error)
      return null
    }),
    createSupabaseAdmin().from("team_leaders").select(TEAM_LEADER_COLUMNS).order("created_at", { ascending: false }),
    getTlInviteToken().catch((error) => {
      console.error("Admin page could not load the TL invite:", error)
      return null
    }),
  ])
  if (teamLeaders.error) console.error("Admin page could not load team leaders:", teamLeaders.error)

  return (
    <PortalDashboard
      role="admin"
      userLabel={admin}
      initialRegistrations={data?.registrations ?? []}
      initialRemittances={data?.remittances ?? []}
      initialFee={data?.fee ?? null}
      initialTeamLeaders={(teamLeaders.data ?? []) as TeamLeader[]}
      initialInviteToken={inviteToken}
      loadFailed={!data || Boolean(teamLeaders.error)}
    />
  )
}
