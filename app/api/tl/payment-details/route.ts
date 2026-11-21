import { NextResponse } from "next/server"
import { getTeamLeader } from "@/lib/auth"
import { addPaymentAccount, getTlPaymentDetails } from "@/lib/tl-payment"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** The signed-in team leader's own payment accounts. */
export async function GET() {
  const leader = await getTeamLeader()
  if (!leader) return fail("Not signed in.", 401)
  try {
    return NextResponse.json({ success: true, accounts: await getTlPaymentDetails(leader.id) })
  } catch (error) {
    console.error("Payment accounts load failed:", error)
    return fail("Could not load your payment details.", 500)
  }
}

/** A team leader adds one more place their agents can pay: an account, a QR code, or both. */
export async function POST(request: Request) {
  const leader = await getTeamLeader()
  if (!leader) return fail("Not signed in.", 401)
  const form = await request.formData().catch(() => null)
  if (!form) return fail("Invalid request.")
  try {
    const result = await addPaymentAccount(leader.id, form)
    if (!result.ok) return fail(result.message, result.status)
    return NextResponse.json({ success: true, accounts: await getTlPaymentDetails(leader.id) }, { status: 201 })
  } catch (error) {
    console.error("Payment account add failed:", error)
    return fail("We could not save this account. Please try again.", 500)
  }
}
