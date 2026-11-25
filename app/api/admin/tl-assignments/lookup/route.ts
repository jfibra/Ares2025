import { NextResponse } from "next/server"
import { EMAIL_PATTERN } from "@/lib/agent-registration"
import { getAdmin } from "@/lib/auth"
import { checkCandidate } from "@/lib/tl-assign"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Admin: find an agent by their LR email, to see whether they can be made their team's leader. */
export async function POST(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 })
  }
  try {
    const team = typeof body?.team === "string" ? body.team.trim().slice(0, 200) : ""
    const result = await checkCandidate(email, team || undefined)
    if (!result.found) return NextResponse.json({ success: false, message: result.message }, { status: result.status })
    return NextResponse.json({ success: true, agent: result.agent, blocked: result.blocked })
  } catch (error) {
    console.error("Admin TL candidate lookup failed:", error)
    return NextResponse.json({ success: false, message: "We could not look up this agent. Please try again." }, { status: 500 })
  }
}
