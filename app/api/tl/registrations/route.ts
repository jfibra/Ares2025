import { NextResponse } from "next/server"
import { getTeamLeader } from "@/lib/auth"
import { loadDashboardData } from "@/lib/payments"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** The signed-in team leader's own agents and remittances. */
export async function GET() {
  const leader = await getTeamLeader()
  if (!leader) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  try {
    return NextResponse.json({ success: true, ...(await loadDashboardData(leader.id)) })
  } catch (error) {
    console.error("TL list failed:", error)
    return NextResponse.json({ success: false, message: "Could not load your agents." }, { status: 500 })
  }
}
