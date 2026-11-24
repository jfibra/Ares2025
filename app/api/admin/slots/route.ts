import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { setSlotLimit } from "@/lib/payments"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Sets how many people can register in total. Registration closes by itself once they are taken. */
export async function PUT(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const slots = typeof body?.slots === "number" ? body.slots : Number.NaN
  if (!Number.isInteger(slots) || slots < 0 || slots > 100_000) {
    return NextResponse.json({ success: false, message: "Enter a whole number of slots." }, { status: 400 })
  }
  try {
    await setSlotLimit(slots)
    return NextResponse.json({ success: true, slots })
  } catch (error) {
    console.error("Slot limit update failed:", error)
    return NextResponse.json({ success: false, message: "Could not save the number of slots." }, { status: 500 })
  }
}
