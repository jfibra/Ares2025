import { NextResponse } from "next/server"
import { isAdminTeamRow } from "@/lib/admin-team"
import { getTeamAccount } from "@/lib/auth"
import { adminTeamOf } from "@/lib/direct-teams"
import { setPaymentReceived } from "@/lib/payments"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** The Team Tycoons account records that one of its team's agents has paid (or undoes it). Only for that team. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const account = await getTeamAccount()
  if (!account) return fail("Not signed in.", 401)
  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  const body = await request.json().catch(() => null)
  if (id === null || typeof body?.confirmed_by_tl !== "boolean") return fail("Invalid request.")
  try {
    const { data: row, error } = await createSupabaseAdmin().from("registrations").select("team,team_leader_id,guest_type").eq("id", id).maybeSingle()
    if (error) throw error
    if (!row || !isAdminTeamRow(row) || adminTeamOf(row.team) !== account.team) return fail("Registration not found.", 404)
    const result = await setPaymentReceived(id, body.confirmed_by_tl)
    if (!result.ok) return fail(result.message, result.status)
    return NextResponse.json({ success: true, registration: result.registration })
  } catch (error) {
    console.error("Team payment update failed:", error)
    return fail("Could not update the registration.", 500)
  }
}
