import { NextResponse } from "next/server"
import { getTeamLeader } from "@/lib/auth"
import { checkOwnTicket, saveOwnTicket } from "@/lib/tl-ticket"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** A signed-in team leader who has no registration of their own yet adds it from their portal. */
export async function POST(request: Request) {
  const leader = await getTeamLeader()
  if (!leader) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })

  try {
    const checked = await checkOwnTicket(leader.name, body)
    if (!checked.ok) {
      return NextResponse.json({ success: false, field: checked.field, message: checked.message }, { status: checked.status })
    }
    if ((await saveOwnTicket(leader, checked.ticket)) === "exists") {
      return NextResponse.json({ success: false, message: "You are already registered. Refresh to see your registration." }, { status: 409 })
    }
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Team leader own registration failed:", error)
    return NextResponse.json({ success: false, message: "We could not save your registration. Please try again." }, { status: 500 })
  }
}
