import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { TEAM_LEADER_COLUMNS } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })

  const { data, error } = await createSupabaseAdmin()
    .from("team_leaders")
    .select(TEAM_LEADER_COLUMNS)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Admin TL list failed:", error)
    return NextResponse.json({ success: false, message: "Could not load team leaders." }, { status: 500 })
  }
  return NextResponse.json({ success: true, teamLeaders: data })
}
