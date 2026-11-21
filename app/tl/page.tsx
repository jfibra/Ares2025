import type { Metadata } from "next"
import { redirect } from "next/navigation"
import PortalDashboard from "@/components/portal-dashboard"
import { getTeamLeader } from "@/lib/auth"
import { loadDashboardData } from "@/lib/payments"
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

  return (
    <PortalDashboard
      role="tl"
      userLabel={`${leader.name} · ${leader.team}`}
      initialRegistrations={data?.registrations ?? []}
      initialRemittances={data?.remittances ?? []}
      initialFee={data?.fee ?? null}
      initialPaymentDetails={paymentDetails}
      loadFailed={!data}
    />
  )
}
