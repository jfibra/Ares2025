import type { Metadata } from "next"
import { redirect } from "next/navigation"
import PortalDashboard from "@/components/portal-dashboard"
import { getAdmin } from "@/lib/auth"
import { loadDashboardData } from "@/lib/payments"
import { TEAM_LEADER_COLUMNS, TL_DECLINE_COLUMNS, type TeamLeader, type TlDecline } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getGuestInviteCode } from "@/lib/guest-invite"
import { getTlInviteCode } from "@/lib/tl-invite"
import { getTlPaymentDetails } from "@/lib/tl-payment"
import { getAdminTeamHandler } from "@/lib/admin-team"

export const metadata: Metadata = { title: "Admin - Registrations", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const admin = await getAdmin()
  if (!admin) redirect("/admin/login")

  const [data, teamLeaders, inviteToken, declines, adminAccounts, guestInviteToken, teamAccounts, teamHandler] = await Promise.all([
    loadDashboardData().catch((error) => {
      console.error("Admin page could not load registrations:", error)
      return null
    }),
    createSupabaseAdmin().from("team_leaders").select(TEAM_LEADER_COLUMNS).order("created_at", { ascending: false }),
    getTlInviteCode().catch((error) => {
      console.error("Admin page could not load the TL invite:", error)
      return null
    }),
    createSupabaseAdmin().from("team_leader_declines").select(TL_DECLINE_COLUMNS).order("declined_at", { ascending: false }),
    getTlPaymentDetails("admin").catch((error) => {
      console.error("Admin page could not load the payment accounts:", error)
      return null
    }),
    getGuestInviteCode().catch((error) => {
      console.error("Admin page could not load the guest invite:", error)
      return null
    }),
    getTlPaymentDetails("admin-team").catch((error) => {
      console.error("Admin page could not load the team's payment accounts:", error)
      return []
    }),
    getAdminTeamHandler().catch((error) => {
      console.error("Admin page could not load the team's handler:", error)
      return null
    }),
  ])
  if (declines.error) console.error("Admin page could not load TL declines:", declines.error)
  if (teamLeaders.error) console.error("Admin page could not load team leaders:", teamLeaders.error)

  return (
    <PortalDashboard
      role="admin"
      userLabel={admin}
      initialRegistrations={data?.registrations ?? []}
      initialRemittances={data?.remittances ?? []}
      initialFee={data?.fee ?? null}
      initialFeeChangedAt={data?.feeChangedAt ?? null}
      initialSlotLimit={data?.slotLimit}
      initialTeamLeaders={(teamLeaders.data ?? []) as TeamLeader[]}
      initialInviteToken={inviteToken}
      initialGuestInviteToken={guestInviteToken}
      initialDeclines={(declines.data ?? []) as TlDecline[]}
      initialAdminAccounts={adminAccounts ?? []}
      initialTeamAccounts={teamAccounts}
      initialTeamHandler={teamHandler}
      loadFailed={!data || !adminAccounts || Boolean(teamLeaders.error) || Boolean(declines.error)}
    />
  )
}
