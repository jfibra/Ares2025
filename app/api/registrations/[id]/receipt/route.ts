import { NextResponse } from "next/server"
import { getAdmin, getTeamLeader } from "@/lib/auth"
import { RECEIPT_BUCKET } from "@/lib/payments"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Opens the receipt an agent uploaded, through a link that works for one minute. Admins, and the agent's own TL. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  if (id === null) return new NextResponse("Not found", { status: 404 })

  const isAdmin = Boolean(await getAdmin())
  const leader = isAdmin ? null : await getTeamLeader()
  if (!isAdmin && !leader) return new NextResponse("Not signed in", { status: 401 })

  const supabase = createSupabaseAdmin()
  let query = supabase.from("registrations").select("agent_receipt_path").eq("id", id)
  if (leader) query = query.eq("team_leader_id", leader.id)
  const { data, error } = await query.maybeSingle()
  if (error || !data?.agent_receipt_path) return new NextResponse("Not found", { status: 404 })

  const { data: signed, error: signError } = await supabase.storage.from(RECEIPT_BUCKET).createSignedUrl(data.agent_receipt_path, 60)
  if (signError || !signed?.signedUrl) {
    console.error("Agent receipt link failed:", signError)
    return new NextResponse("Could not open the receipt", { status: 500 })
  }
  return NextResponse.redirect(signed.signedUrl)
}
