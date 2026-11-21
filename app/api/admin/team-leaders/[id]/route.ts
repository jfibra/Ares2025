import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Removes a team leader and their login. Refused while agents are still registered under them. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  if (id === null) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })

  try {
    const supabase = createSupabaseAdmin()
    const { count, error: countError } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("team_leader_id", id)
    if (countError) throw countError
    if (count) {
      return NextResponse.json(
        {
          success: false,
          message: `This team leader has ${count} registered agent${count === 1 ? "" : "s"}. Delete those registrations first.`,
        },
        { status: 409 },
      )
    }

    const { data, error } = await supabase.from("team_leaders").delete().eq("id", id).select("user_id").maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ success: false, message: "Team leader not found." }, { status: 404 })
    if (data.user_id) {
      const { error: authError } = await supabase.auth.admin.deleteUser(data.user_id)
      if (authError) console.error("Team leader removed, but their login could not be deleted:", authError)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin TL delete failed:", error)
    return NextResponse.json({ success: false, message: "Could not delete the team leader." }, { status: 500 })
  }
}
