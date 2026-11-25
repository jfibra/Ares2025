import { NextResponse } from "next/server"
import { EMAIL_PATTERN } from "@/lib/agent-registration"
import { getAdmin } from "@/lib/auth"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { checkCandidate } from "@/lib/tl-assign"
import { TL_ASSIGNMENT_COLUMNS, listAssignments, normaliseTeam } from "@/lib/tl-assignments"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const unauthorized = () => NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })

/** Admin: every agent chosen to lead a team that has no team leader, newest first. */
export async function GET() {
  if (!(await getAdmin())) return unauthorized()
  try {
    return NextResponse.json({ success: true, assignments: await listAssignments() })
  } catch (error) {
    console.error("Admin TL assignment list failed:", error)
    return NextResponse.json({ success: false, message: "Could not load the assigned team leaders." }, { status: 500 })
  }
}

/** Admin: make this agent the leader of their own team. Their details come from the LR records, not the browser. */
export async function POST(request: Request) {
  if (!(await getAdmin())) return unauthorized()
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 })
  }
  try {
    const team = typeof body?.team === "string" ? body.team.trim().slice(0, 200) : ""
    const result = await checkCandidate(email, team || undefined)
    if (!result.found) return NextResponse.json({ success: false, message: result.message }, { status: result.status })
    if (result.blocked) return NextResponse.json({ success: false, message: result.blocked }, { status: 409 })

    const { agent } = result
    const { data, error } = await createSupabaseAdmin()
      .from("team_leader_assignments")
      .insert({ name: agent.name.slice(0, 200), email: agent.email, team: agent.team.slice(0, 200), team_key: normaliseTeam(agent.team) })
      .select(TL_ASSIGNMENT_COLUMNS)
      .single()
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: false, message: `${agent.team} already has a team leader assigned. Refresh to see who.` }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ success: true, assignment: data }, { status: 201 })
  } catch (error) {
    console.error("Admin TL assignment failed:", error)
    return NextResponse.json({ success: false, message: "We could not assign this team leader. Please try again." }, { status: 500 })
  }
}
