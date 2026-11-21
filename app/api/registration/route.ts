import { NextResponse } from "next/server"
import { EMAIL_PATTERN, resolveAgent } from "@/lib/agent-registration"
import { getRegistrationFee } from "@/lib/payments"
import { resolveAttendance, validateAgentDetails } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getTlPaymentDetails } from "@/lib/tl-payment"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Step 2: the agent said "yes, this is me". Details are looked up again here, never taken from the browser. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 })
  }

  const checked = validateAgentDetails(body)
  if (!checked.ok) {
    return NextResponse.json({ success: false, status: "invalid_details", field: checked.field, message: checked.message }, { status: 400 })
  }

  try {
    const result = await resolveAgent(email)
    if (result.status !== "found") {
      // Something changed since the lookup (or the request skipped it). Send the reason back.
      const {
        teamLeaderId: _teamLeaderId,
        attendeeCount: _attendeeCount,
        receiptAt: _receiptAt,
        ...rest
      } = { teamLeaderId: null, attendeeCount: 1, receiptAt: null, ...result }
      return NextResponse.json({ success: false, ...rest }, { status: 409 })
    }

    const { agent, teamLeader } = result
    // A couple's record must say who is joining; the name comes from our records, not the browser.
    const attendance = resolveAttendance(agent.name, body?.attending)
    if (!attendance.ok) {
      return NextResponse.json(
        { success: false, status: "invalid_details", field: "attending", message: attendance.message },
        { status: 400 },
      )
    }
    const { error } = await createSupabaseAdmin().from("registrations").insert({
      name: agent.name,
      email: agent.email,
      contact_number: agent.contact_number || null,
      ...checked.details,
      attendee_count: attendance.attendee_count,
      attendees: attendance.attendees,
      team: agent.team,
      team_leader_id: teamLeader.id,
      team_leader_name: teamLeader.name,
    })
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, status: "already_registered", confirmed: false, teamLeaderName: teamLeader.name },
          { status: 409 },
        )
      }
      throw error
    }
    const [fee, payment] = await Promise.all([
      getRegistrationFee().catch(() => null),
      getTlPaymentDetails(teamLeader.id).catch(() => null),
    ])
    // `fee` is the total owed: double when both people on a couple's record are joining.
    return NextResponse.json(
      {
        success: true,
        team_leader: teamLeader.name,
        fee: fee === null ? null : fee * attendance.attendee_count,
        attendee_count: attendance.attendee_count,
        payment,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration insert failed:", error)
    return NextResponse.json(
      { success: false, message: "We could not save your registration. Please try again." },
      { status: 500 },
    )
  }
}
