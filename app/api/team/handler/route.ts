import { NextResponse } from "next/server"
import { saveAdminTeamHandler } from "@/lib/admin-team"
import { getTeamAccount } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** The Team Tycoons account sets the name, number and Facebook link its agents are shown. */
export async function PUT(request: Request) {
  const account = await getTeamAccount()
  if (!account) return fail("Not signed in.", 401)
  try {
    const result = await saveAdminTeamHandler(account.team, await request.json().catch(() => null))
    if (!result.ok) return fail(result.message)
    return NextResponse.json({ success: true, handler: result.handler })
  } catch (error) {
    console.error("Team handler save failed:", error)
    return fail("We could not save this. Please try again.", 500)
  }
}
