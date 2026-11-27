import { NextResponse } from "next/server"
import { getTeamAccount } from "@/lib/auth"
import { loadTeamPortal } from "@/lib/team-portal"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** The Team Tycoons account reloads its page: the team's registrations and what its agents are shown. */
export async function GET() {
  const account = await getTeamAccount()
  if (!account) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  try {
    return NextResponse.json({ success: true, ...(await loadTeamPortal(account.team)) })
  } catch (error) {
    console.error("Team portal load failed:", error)
    return NextResponse.json({ success: false, message: "Could not load the registrations." }, { status: 500 })
  }
}
