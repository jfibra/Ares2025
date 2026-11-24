import { NextResponse } from "next/server"
import { EMAIL_PATTERN } from "@/lib/agent-registration"
import { findTeamLeaderByEmail } from "@/lib/auth"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { isValidTlInvite } from "@/lib/tl-invite"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")
const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** A team leader says they are not joining, and why. Needs the same invite token as registering. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return fail("Invalid request.")

  try {
    if (!(await isValidTlInvite(body.invite))) {
      return fail("This link is no longer valid. Please ask the admin for a new one.", 403)
    }

    const name = text(body.name)
    const email = text(body.email).toLowerCase()
    const team = text(body.team)
    const reason = text(body.reason)

    const errors: string[] = []
    if (!name || name.length > 200) errors.push("Please enter your name.")
    if (!EMAIL_PATTERN.test(email) || email.length > 320) errors.push("Please enter a valid email address.")
    if (!team || team.length > 200) errors.push("Please enter your team.")
    if (!reason) errors.push("Please tell us why you are not joining.")
    else if (reason.length > 1000) errors.push("Please keep your reason under 1000 characters.")
    if (errors.length) return fail(errors.join(" "))

    if (await findTeamLeaderByEmail(email)) {
      return fail("This email is already registered as a team leader. Please contact the admin if you can no longer join.", 409)
    }

    // Declining again just updates the earlier answer.
    const { error } = await createSupabaseAdmin()
      .from("team_leader_declines")
      .upsert({ name, email, team, reason, declined_at: new Date().toISOString() }, { onConflict: "email" })
    if (error) throw error
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Team leader decline failed:", error)
    return fail("We could not save your answer. Please try again.", 500)
  }
}
