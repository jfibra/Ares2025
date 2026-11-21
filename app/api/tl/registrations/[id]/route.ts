import { NextResponse } from "next/server"
import { getTeamLeader } from "@/lib/auth"
import { setPaymentReceived } from "@/lib/payments"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** A team leader confirms they received an agent's payment (or undoes it before sending it on). */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const leader = await getTeamLeader()
  if (!leader) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })

  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  const body = await request.json().catch(() => null)
  if (id === null || typeof body?.confirmed_by_tl !== "boolean") {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })
  }

  try {
    const result = await setPaymentReceived(id, body.confirmed_by_tl, leader.id)
    if (!result.ok) return NextResponse.json({ success: false, message: result.message }, { status: result.status })
    return NextResponse.json({ success: true, registration: result.registration })
  } catch (error) {
    console.error("TL update failed:", error)
    return NextResponse.json({ success: false, message: "Could not update the registration." }, { status: 500 })
  }
}
