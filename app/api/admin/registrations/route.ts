import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { loadDashboardData } from "@/lib/payments"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  try {
    return NextResponse.json({ success: true, ...(await loadDashboardData()) })
  } catch (error) {
    console.error("Admin list failed:", error)
    return NextResponse.json({ success: false, message: "Could not load registrations." }, { status: 500 })
  }
}
