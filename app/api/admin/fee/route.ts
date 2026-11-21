import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { setRegistrationFee } from "@/lib/payments"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Sets the registration fee per agent. Applies to payments confirmed from now on. */
export async function PUT(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const fee = typeof body?.fee === "number" ? body.fee : Number.NaN
  if (!Number.isFinite(fee) || fee < 0 || fee > 10_000_000) {
    return NextResponse.json({ success: false, message: "Enter a valid amount." }, { status: 400 })
  }
  try {
    const rounded = Math.round(fee * 100) / 100
    await setRegistrationFee(rounded)
    return NextResponse.json({ success: true, fee: rounded })
  } catch (error) {
    console.error("Fee update failed:", error)
    return NextResponse.json({ success: false, message: "Could not save the fee." }, { status: 500 })
  }
}
