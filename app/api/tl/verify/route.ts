import { NextResponse } from "next/server"
import { EMAIL_PATTERN } from "@/lib/agent-registration"
import { findTeamLeaderByEmail } from "@/lib/auth"
import { getRegistrationFee, getSlotsLeft } from "@/lib/payments"
import { isValidTlInvite } from "@/lib/tl-invite"
import { TL_VERIFY_MESSAGES, verifyTeamLeader } from "@/lib/tl-verify"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** Step 1 of team leader sign-up: check the LR records to see that this email is a team leader. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return fail("Invalid request.")

  try {
    if (!(await isValidTlInvite(body.invite))) {
      return fail("This registration link is no longer valid. Please ask the admin for a new one.", 403)
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    if (!EMAIL_PATTERN.test(email) || email.length > 320) return fail("Please enter a valid email address.")

    if (await findTeamLeaderByEmail(email)) {
      return fail("This email is already registered as a team leader. Please sign in instead.", 409)
    }

    const result = await verifyTeamLeader(email)
    if (result.status !== "verified") {
      return fail(TL_VERIFY_MESSAGES[result.status], result.status === "unavailable" ? 503 : 404)
    }
    const [fee, slotsLeft] = await Promise.all([getRegistrationFee().catch(() => null), getSlotsLeft().catch(() => null)])
    return NextResponse.json({
      success: true,
      leader: { name: result.leader.name, email: result.leader.email, team: result.leader.team },
      // Per person, so a couple can see what one or both of them joining costs.
      fee,
      slots_left: slotsLeft,
    })
  } catch (error) {
    console.error("Team leader verification failed:", error)
    return fail("We could not check your details. Please try again.", 500)
  }
}
