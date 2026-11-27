import { timingSafeEqual } from "crypto"
import { NextResponse } from "next/server"
import { sendPendingConfirmationEmails } from "@/lib/confirmation-email"
import { removeUnpaidRegistrations } from "@/lib/unpaid-expiry"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Run on a schedule (about once an hour): removes registrations left unpaid for 3 days and
 * emails those agents. Needs "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const given = Buffer.from(request.headers.get("authorization") ?? "")
  const wanted = Buffer.from(`Bearer ${secret ?? ""}`)
  if (!secret || given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return NextResponse.json({ success: false, message: "Not allowed." }, { status: 401 })
  }
  try {
    const result = await removeUnpaidRegistrations()
    // Also retries any "you are registered" email that could not be sent earlier.
    const confirmations = await sendPendingConfirmationEmails()
    return NextResponse.json({ success: true, ...result, confirmations })
  } catch (error) {
    console.error("Removing unpaid registrations failed:", error)
    return NextResponse.json({ success: false, message: "Could not remove unpaid registrations." }, { status: 500 })
  }
}
