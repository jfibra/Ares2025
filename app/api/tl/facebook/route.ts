import { NextResponse } from "next/server"
import { getTeamLeader } from "@/lib/auth"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { normalizeFacebookUrl } from "@/lib/tl-contact"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/**
 * A team leader saves how their agents contact them: the Facebook link, or (`contact_number`)
 * the number shown to agents. In a team with several team leaders this is the one shared answer.
 */
export async function PUT(request: Request) {
  const leader = await getTeamLeader()
  if (!leader) return fail("Not signed in.", 401)
  const body = await request.json().catch(() => null)

  let change: { facebook_url: string } | { agent_contact_number: string }
  if (typeof body?.contact_number === "string") {
    const contactNumber = body.contact_number.trim()
    if (contactNumber.length < 5 || contactNumber.length > 40) return fail("Please enter the contact number your agents should use.")
    change = { agent_contact_number: contactNumber }
  } else {
    const facebookUrl = normalizeFacebookUrl(typeof body?.facebook_url === "string" ? body.facebook_url : "")
    if (!facebookUrl) return fail("Please paste the link to your Facebook profile, for example https://www.facebook.com/juan.delacruz")
    change = { facebook_url: facebookUrl }
  }

  const { error } = await createSupabaseAdmin().from("team_leaders").update(change).eq("id", leader.id)
  if (error) {
    console.error("Team leader contact save failed:", error)
    return fail("We could not save this. Please try again.", 500)
  }
  return NextResponse.json({ success: true, ...("facebook_url" in change ? { facebook_url: change.facebook_url } : { contact_number: change.agent_contact_number }) })
}
