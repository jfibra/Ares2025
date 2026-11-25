import { NextResponse } from "next/server"
import { getAdmin, getTeamLeader } from "@/lib/auth"
import { PHOTO_BUCKET } from "@/lib/photo"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Opens the formal photo a person uploaded when registering, through a link that works for one minute.
 * `?n=2` is the second person on a couple's record. Admins, and the agent's own TL.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  if (id === null) return new NextResponse("Not found", { status: 404 })
  const index = new URL(request.url).searchParams.get("n") === "2" ? 1 : 0

  const isAdmin = Boolean(await getAdmin())
  const leader = isAdmin ? null : await getTeamLeader()
  if (!isAdmin && !leader) return new NextResponse("Not signed in", { status: 401 })

  const supabase = createSupabaseAdmin()
  let query = supabase.from("registrations").select("photo_paths").eq("id", id)
  if (leader) query = query.eq("team_leader_id", leader.id)
  const { data, error } = await query.maybeSingle()
  const path = (data?.photo_paths as string[] | null | undefined)?.[index]
  if (error || !path) return new NextResponse("Not found", { status: 404 })

  const { data: signed, error: signError } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 60)
  if (signError || !signed?.signedUrl) {
    console.error("Agent photo link failed:", signError)
    return new NextResponse("Could not open the photo", { status: 500 })
  }
  return NextResponse.redirect(signed.signedUrl)
}
