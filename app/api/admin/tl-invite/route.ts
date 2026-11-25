import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { regenerateTlInviteCode } from "@/lib/tl-invite"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Replace the team leader invite link. Every link and QR code shared before stops working. */
export async function POST() {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  try {
    return NextResponse.json({ success: true, token: await regenerateTlInviteCode() })
  } catch (error) {
    console.error("Invite regeneration failed:", error)
    return NextResponse.json({ success: false, message: "Could not create a new link." }, { status: 500 })
  }
}
