import type { Metadata } from "next"
import { redirect } from "next/navigation"
import PortalDashboard from "@/components/portal-dashboard"
import { getTeamLeader } from "@/lib/auth"
import { loadDashboardData } from "@/lib/payments"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getTlPaymentDetails } from "@/lib/tl-payment"

export const metadata: Metadata = { title: "Team leader - My agents", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function TeamLeaderPage() {
  const leader = await getTeamLeader()
  if (!leader) redirect("/tl/login")

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
    .eq("email", leader.email)
    .maybeSingle()
  if (declineError) console.error("TL page could not load the decline reason:", declineError)

  return (
    <PortalDashboard
      role="tl"
      userLabel={`${leader.name} · ${leader.team}`}
      ownEmail={leader.email}
      ownName={leader.name}
      initialFacebookUrl={leader.facebook_url}
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
