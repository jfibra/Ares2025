import { NextResponse } from "next/server"
import type { PaymentOwner } from "@/lib/tl-payment"
import { getAdmin } from "@/lib/auth"
import { deletePaymentAccount, getTlPaymentDetails, updatePaymentAccount } from "@/lib/tl-payment"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** `?scope=team` means the accounts shown to the agents of the team the admin handles. */
const ownerOf = (request: Request): PaymentOwner => (new URL(request.url).searchParams.get("scope") === "team" ? "admin-team" : "admin")

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })
const parseId = (value: string) => (/^\d+$/.test(value) ? Number(value) : null)

/** An admin changes one of the organizer's payment accounts. */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  const id = parseId(params.id)
  const form = await request.formData().catch(() => null)
  if (id === null || !form) return fail("Invalid request.")
  try {
    const result = await updatePaymentAccount(ownerOf(request), id, form)
    if (!result.ok) return fail(result.message, result.status)
    return NextResponse.json({ success: true, accounts: await getTlPaymentDetails(ownerOf(request)) })
  } catch (error) {
    console.error("Payment account update failed:", error)
    return fail("We could not save this account. Please try again.", 500)
  }
}

/** An admin removes one of the organizer's payment accounts. */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  const id = parseId(params.id)
  if (id === null) return fail("Invalid request.")
  try {
    await deletePaymentAccount(ownerOf(request), id)
    return NextResponse.json({ success: true, accounts: await getTlPaymentDetails(ownerOf(request)) })
  } catch (error) {
    console.error("Payment account delete failed:", error)
    return fail("We could not delete this account. Please try again.", 500)
  }
}
