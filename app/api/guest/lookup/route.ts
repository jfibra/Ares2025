import { NextResponse } from "next/server"
import { EMAIL_PATTERN } from "@/lib/agent-registration"
import { isValidGuestInvite } from "@/lib/guest-invite"
import { resolveGuest } from "@/lib/guest-registration"
import { getRegistrationFee, getSlotsLeft } from "@/lib/payments"
import { getTlPaymentDetails } from "@/lib/tl-payment"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** Step 1 of guest registration: check the email against the LR records and our registrations. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  if (!EMAIL_PATTERN.test(email) || email.length > 320) return fail("Please enter a valid email address.")

  try {
    if (!(await isValidGuestInvite(body?.invite))) {
      return fail("This registration link is no longer valid. Please ask the ARES admin for a new one.", 403)
    }
    const result = await resolveGuest(email)
    if (result.status === "unavailable") return fail("We could not check your email right now. Please try again in a moment.", 503)
    if (result.status === "already_registered") {
      // A guest still waiting to pay sees again where to send the fee.
      const waiting = result.guest && !result.confirmed
      const [payment, fee] = waiting
        ? await Promise.all([getTlPaymentDetails("admin").catch(() => null), getRegistrationFee().catch(() => null)])
        : [null, null]
      return NextResponse.json({
        success: true,
        status: "already_registered",
        guest: result.guest,
        confirmed: result.confirmed,
        payment,
        fee: fee === null ? null : fee * result.attendeeCount,
        attendee_count: result.attendeeCount,
        receipt_sent_at: waiting ? result.receiptAt : null,
      })
    }
    if ((await getSlotsLeft()) <= 0) return NextResponse.json({ success: true, status: "full" })
    return NextResponse.json({
      success: true,
      status: "new",
      // Per person, so a couple on one LR record can see what one or both of them joining costs.
      fee: await getRegistrationFee().catch(() => null),
      // Their LR record, when the email is in the LR records; the name on it is the one we register.
      agent: result.agent ? { name: result.agent.name, team: result.agent.team } : null,
    })
  } catch (error) {
    console.error("Guest lookup failed:", error)
    return fail("We could not check your details. Please try again.", 500)
  }
}
