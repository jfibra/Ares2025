import { NextResponse } from "next/server"
import { EMAIL_PATTERN, maskContactNumber, resolveAgent } from "@/lib/agent-registration"
import { getRegistrationFee } from "@/lib/payments"
import { getTlPaymentDetails } from "@/lib/tl-payment"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Step 1 of agent registration: find the agent so they can confirm "yes, this is me". */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 })
  }

  try {
    const result = await resolveAgent(email)
    if (result.status === "already_registered") {
      const { teamLeaderId, attendeeCount, receiptAt, ...rest } = result
      // Still waiting to pay: show again where to send the fee.
      const waiting = !result.confirmed && teamLeaderId !== null
      const [payment, fee] = waiting
        ? await Promise.all([getTlPaymentDetails(teamLeaderId).catch(() => null), getRegistrationFee().catch(() => null)])
        : [null, null]
      // `fee` is the total this registration owes: double when both people on a couple's record are joining.
      return NextResponse.json({
        success: true,
        ...rest,
        payment,
        fee: fee === null ? null : fee * attendeeCount,
        attendee_count: attendeeCount,
        receipt_sent_at: waiting ? receiptAt : null,
      })
    }
    if (result.status !== "found") return NextResponse.json({ success: true, ...result })
    return NextResponse.json({
      success: true,
      status: "found",
      // Per person, so a couple can see what one or both of them joining costs.
      fee: await getRegistrationFee().catch(() => null),
      agent: {
        name: result.agent.name,
        email: result.agent.email,
        contact_number: maskContactNumber(result.agent.contact_number),
        team: result.agent.team,
        team_leader: result.teamLeader.name,
      },
    })
  } catch (error) {
    console.error("Agent lookup failed:", error)
    return NextResponse.json({ success: false, message: "We could not check your details. Please try again." }, { status: 500 })
  }
}
