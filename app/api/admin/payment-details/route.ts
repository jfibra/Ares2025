import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { addPaymentAccount, getTlPaymentDetails } from "@/lib/tl-payment"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** The organizer's accounts, where team leaders send what they collected. */
export async function GET() {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  try {
    return NextResponse.json({ success: true, accounts: await getTlPaymentDetails("admin") })
  } catch (error) {
    console.error("Payment accounts load failed:", error)
    return fail("Could not load the payment details.", 500)
  }
}

/** An admin adds one more place team leaders can pay: an account, a QR code, or both. */
export async function POST(request: Request) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  const form = await request.formData().catch(() => null)
  if (!form) return fail("Invalid request.")
  try {
    const result = await addPaymentAccount("admin", form)
    if (!result.ok) return fail(result.message, result.status)
    return NextResponse.json({ success: true, accounts: await getTlPaymentDetails("admin") }, { status: 201 })
  } catch (error) {
    console.error("Payment account add failed:", error)
    return fail("We could not save this account. Please try again.", 500)
  }
}
