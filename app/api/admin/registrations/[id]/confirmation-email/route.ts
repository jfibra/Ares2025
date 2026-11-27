import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { sendConfirmationEmailTo } from "@/lib/confirmation-email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** An admin sends (or sends again) the "you are registered" email to one registrant whose payment has reached the admin. */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  if (id === null) return fail("Invalid request.")
  try {
    const result = await sendConfirmationEmailTo(id)
    if (result === "not_found") return fail("That registration was not found. Please refresh and try again.", 404)
    if (result === "not_paid") return fail("This email can only be sent once the payment has reached the admin.", 409)
    return NextResponse.json({ success: true, confirmation_emailed_at: result.at })
  } catch (error) {
    console.error("Confirmation email failed:", error)
    return fail("We could not send the email. Please try again.", 500)
  }
}
