import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { saveAdminTeamHandler } from "@/lib/admin-team"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** An admin sets who looks after the team the admin handles: shown to that team's agents. */
export async function PUT(request: Request) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  try {
    const result = await saveAdminTeamHandler(await request.json().catch(() => null))
    if (!result.ok) return fail(result.message)
    return NextResponse.json({ success: true, handler: result.handler })
  } catch (error) {
    console.error("Team handler save failed:", error)
    return fail("We could not save this. Please try again.", 500)
  }
}
