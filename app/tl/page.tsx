import type { Metadata } from "next"
import { redirect } from "next/navigation"
import PortalDashboard from "@/components/portal-dashboard"
import { getTeamLeader, getTeamLeaderAccount } from "@/lib/auth"
import { dashboardMembers } from "@/lib/co-leaders"
import { loadDashboardData } from "@/lib/payments"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getTlPaymentDetails } from "@/lib/tl-payment"

export const metadata: Metadata = { title: "Team leader - My agents", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function TeamLeaderPage() {
  // `account` is the person signed in; `leader` is whose dashboard they work on. They differ only
  // in a team with several team leaders, who all share one dashboard.
  const account = await getTeamLeaderAccount()
  const leader = account ? await getTeamLeader() : null
  if (!account || !leader) redirect("/tl/login")
  const members = await dashboardMembers(account).catch((error) => {
    console.error("TL page could not load the team's leaders:", error)
    return [account]
  })

  const data = await loadDashboardData(leader.id).catch((error) => {
    console.error("TL page could not load registrations:", error)
    return null
  })

  const paymentDetails = await getTlPaymentDetails(leader.id).catch((error) => {
    console.error("TL page could not load payment details:", error)
    return null
  })

  const adminAccounts = await getTlPaymentDetails("admin").catch((error) => {
    console.error("TL page could not load the admin's payment accounts:", error)
    return []
  })

  // Set when they registered as "I can't attend": shown as a note on their dashboard.
  const { data: decline, error: declineError } = await createSupabaseAdmin()
    .from("team_leader_declines")
    .select("reason")
    .eq("email", account.email)
    .maybeSingle()
  if (declineError) console.error("TL page could not load the decline reason:", declineError)

  return (
    <PortalDashboard
      role="tl"
      userLabel={`${account.name} · ${account.team}`}
      ownEmail={account.email}
      ownName={account.name}
      initialFacebookUrl={leader.facebook_url}
      initialContactNumber={leader.agent_contact_number || leader.contact_number}
      sharedWith={members.length > 1 ? members.map((member) => member.name) : null}
      ownDeclineReason={decline?.reason ?? null}
      initialRegistrations={data?.registrations ?? []}
      initialRemittances={data?.remittances ?? []}
      initialFee={data?.fee ?? null}
      initialFeeChangedAt={data?.feeChangedAt ?? null}
      initialPaymentDetails={paymentDetails}
      initialAdminAccounts={adminAccounts}
      loadFailed={!data}
    />
  )
}
