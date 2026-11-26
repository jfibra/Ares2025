import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { regenerateGuestInviteCode } from "@/lib/guest-invite"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Replace the guest registration link. Every link and QR code shared before stops working. */
export async function POST() {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  try {
    return NextResponse.json({ success: true, token: await regenerateGuestInviteCode() })
  } catch (error) {
    console.error("Guest invite regeneration failed:", error)
    return NextResponse.json({ success: false, message: "Could not create a new link." }, { status: 500 })
  }
}
