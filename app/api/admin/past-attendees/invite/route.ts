import { NextResponse } from "next/server"
import { inviteEmail, inviteStatus, sendInviteBatch } from "@/lib/attendee-invite"
import { getAdmin } from "@/lib/auth"
import { sendEmail } from "@/lib/mailer"
import { getRegistrationFee } from "@/lib/payments"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** Admin: how many ARES 2025 attendees have been sent the invitation, and how many are left. */
export async function GET() {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  try {
    return NextResponse.json({ success: true, ...(await inviteStatus()) })
  } catch (error) {
    console.error("Invitation status failed:", error)
    return fail("Could not load the invitation status.", 500)
  }
}

/** Admin: send a test copy to the admin's own email, or send the invitation to the next few attendees. */
export async function POST(request: Request) {
  const admin = await getAdmin()
  if (!admin) return fail("Not signed in.", 401)
  const body = await request.json().catch(() => null)
  try {
    if (body?.action === "test") {
      await sendEmail({ to: admin, ...inviteEmail(await getRegistrationFee()) })
      return NextResponse.json({ success: true, sentTo: admin })
    }
    if (body?.action === "send") return NextResponse.json({ success: true, ...(await sendInviteBatch()) })
    return fail("Invalid request.")
  } catch (error) {
    console.error("Sending invitations failed:", error)
    return fail(error instanceof Error && /Email is not set up/.test(error.message) ? error.message : "Could not send the email. Please try again.", 500)
  }
}
