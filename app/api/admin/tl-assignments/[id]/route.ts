import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Admin: undo a choice of team leader. If that person has already registered as a team leader,
 * their account stays; delete it from the Team leaders list.
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  if (id === null) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })

  const { data, error } = await createSupabaseAdmin().from("team_leader_assignments").delete().eq("id", id).select("id").maybeSingle()
  if (error) {
    console.error("Admin TL assignment delete failed:", error)
    return NextResponse.json({ success: false, message: "Could not remove this team leader." }, { status: 500 })
  }
  if (!data) return NextResponse.json({ success: false, message: "This entry no longer exists. Refresh the list." }, { status: 404 })
  return NextResponse.json({ success: true })
}
