import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { TL_DECLINE_COLUMNS } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Team leaders who said they are not joining, newest first. */
export async function GET() {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  const { data, error } = await createSupabaseAdmin()
    .from("team_leader_declines")
    .select(TL_DECLINE_COLUMNS)
    .order("declined_at", { ascending: false })
  if (error) {
    console.error("Admin TL decline list failed:", error)
    return NextResponse.json({ success: false, message: "Could not load the team leaders who declined." }, { status: 500 })
  }
  return NextResponse.json({ success: true, declines: data })
}
