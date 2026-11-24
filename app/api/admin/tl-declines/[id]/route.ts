import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Removes a decline from the list, e.g. one sent by mistake. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  if (id === null) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })
  const { error } = await createSupabaseAdmin().from("team_leader_declines").delete().eq("id", id)
  if (error) {
    console.error("Admin TL decline delete failed:", error)
    return NextResponse.json({ success: false, message: "Could not remove this entry." }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
