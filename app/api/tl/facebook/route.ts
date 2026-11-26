import { NextResponse } from "next/server"
import { getTeamLeader } from "@/lib/auth"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { normalizeFacebookUrl } from "@/lib/tl-contact"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** A team leader saves the Facebook link their agents use to contact them. */
export async function PUT(request: Request) {
  const leader = await getTeamLeader()
  if (!leader) return fail("Not signed in.", 401)
  const body = await request.json().catch(() => null)
  const facebookUrl = normalizeFacebookUrl(typeof body?.facebook_url === "string" ? body.facebook_url : "")
  if (!facebookUrl) return fail("Please paste the link to your Facebook profile, for example https://www.facebook.com/juan.delacruz")

  const { error } = await createSupabaseAdmin().from("team_leaders").update({ facebook_url: facebookUrl }).eq("id", leader.id)
  if (error) {
    console.error("Facebook link save failed:", error)
    return fail("We could not save your Facebook link. Please try again.", 500)
  }
  return NextResponse.json({ success: true, facebook_url: facebookUrl })
}
