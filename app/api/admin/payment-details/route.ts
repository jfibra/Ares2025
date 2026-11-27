import { NextResponse } from "next/server"
import type { PaymentOwner } from "@/lib/tl-payment"
import { getAdmin } from "@/lib/auth"
import { addPaymentAccount, getTlPaymentDetails } from "@/lib/tl-payment"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** `?scope=team` means the accounts shown to the agents of the team the admin handles. */
const ownerOf = (request: Request): PaymentOwner => (new URL(request.url).searchParams.get("scope") === "team" ? "admin-team" : "admin")

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** The organizer's accounts, where team leaders send what they collected. */
export async function GET(request: Request) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  try {
    return NextResponse.json({ success: true, accounts: await getTlPaymentDetails(ownerOf(request)) })
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
    const result = await addPaymentAccount(ownerOf(request), form)
    if (!result.ok) return fail(result.message, result.status)
    return NextResponse.json({ success: true, accounts: await getTlPaymentDetails(ownerOf(request)) }, { status: 201 })
  } catch (error) {
    console.error("Payment account add failed:", error)
    return fail("We could not save this account. Please try again.", 500)
  }
}
