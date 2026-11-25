import { NextResponse } from "next/server"
import { EMAIL_PATTERN, maskContactNumber, resolveAgent } from "@/lib/agent-registration"
import { getRegistrationFee, getSlotsLeft } from "@/lib/payments"
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
      // Still waiting to pay: show again where to send the fee. With no team leader on the
      // registration (theirs is not joining), the agent pays the admin.
      const waiting = !result.confirmed
      const [payment, fee] = waiting
        ? await Promise.all([getTlPaymentDetails(teamLeaderId ?? "admin").catch(() => null), getRegistrationFee().catch(() => null)])
        : [null, null]
      // `fee` is the total this registration owes: double when both people on a couple's record are joining.
      return NextResponse.json({
        success: true,
        ...rest,
        admin_managed: teamLeaderId === null,
        payment,
        fee: fee === null ? null : fee * attendeeCount,
        attendee_count: attendeeCount,
        receipt_sent_at: waiting ? receiptAt : null,
      })
    }
    if (result.status !== "found") return NextResponse.json({ success: true, ...result })
    const slotsLeft = await getSlotsLeft()
    if (slotsLeft <= 0) return NextResponse.json({ success: true, status: "full" })
    return NextResponse.json({
      success: true,
      status: "found",
      past_attendee: result.pastAttendee,
      // Their team leader is not joining, so the admin handles their payment.
      admin_managed: !result.teamLeader,
      slots_left: slotsLeft,
      // Per person, so a couple can see what one or both of them joining costs.
      fee: await getRegistrationFee().catch(() => null),
      agent: {
        name: result.agent.name,
        email: result.agent.email,
        contact_number: maskContactNumber(result.agent.contact_number),
        team: result.agent.team,
        team_leader: result.teamLeader?.name ?? result.agent.team_leader_name,
      },
    })
  } catch (error) {
    console.error("Agent lookup failed:", error)
    return NextResponse.json({ success: false, message: "We could not check your details. Please try again." }, { status: 500 })
  }
}
