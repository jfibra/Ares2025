import { NextResponse } from "next/server"
import { getTeamLeader } from "@/lib/auth"
import { loadDashboardData } from "@/lib/payments"
import { getTlPaymentDetails } from "@/lib/tl-payment"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** The signed-in team leader's own agents and remittances, plus where to send the money. */
export async function GET() {
  const leader = await getTeamLeader()
  if (!leader) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  try {
    const [data, adminAccounts] = await Promise.all([
      loadDashboardData(leader.id),
      getTlPaymentDetails("admin").catch((error) => {
        console.error("TL list could not load the admin's payment accounts:", error)
        return undefined // keep what the page already shows
      }),
    ])
    return NextResponse.json({ success: true, ...data, adminAccounts })
  } catch (error) {
    console.error("TL list failed:", error)
    return NextResponse.json({ success: false, message: "Could not load your agents." }, { status: 500 })
  }
}
