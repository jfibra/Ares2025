import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { REGISTRATION_COLUMNS, type Registration } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: { id: string } }

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/**
 * An admin puts a registered guest on a team, so that team's leader handles the registration
 * (takes the payment and confirms it), or takes the guest back (`team_leader_id: null`) so the
 * admin handles it again. Only while the guest has not paid, so no money changes hands twice.
 */
export async function PATCH(request: Request, { params }: Context) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  const body = await request.json().catch(() => null)
  const leaderId: unknown = body?.team_leader_id
  if (id === null || !(leaderId === null || (typeof leaderId === "number" && Number.isInteger(leaderId) && leaderId > 0))) {
    return fail("Invalid request.")
  }

  try {
    const supabase = createSupabaseAdmin()
    let change: { team_leader_id: number | null; team_leader_name: string | null; team?: string }
    if (leaderId === null) {
      change = { team_leader_id: null, team_leader_name: null }
    } else {
      const { data: leader, error } = await supabase.from("team_leaders").select("id,name,team").eq("id", leaderId).maybeSingle()
      if (error) throw error
      if (!leader) return fail("That team leader was not found. Please refresh and try again.", 404)
      change = { team_leader_id: leader.id, team_leader_name: leader.name, team: leader.team }
    }

    const { data, error } = await supabase
      .from("registrations")
      .update(change)
      .eq("id", id)
      .not("guest_type", "is", null)
      .eq("payment_status", "unpaid")
      .select(REGISTRATION_COLUMNS)
      .maybeSingle()
    if (error) throw error
    if (!data) {
      const { data: exists } = await supabase.from("registrations").select("guest_type").eq("id", id).maybeSingle()
      if (!exists) return fail("Registration not found.", 404)
      if (!exists.guest_type) return fail("Only a guest can be moved to a team here.", 409)
      return fail("This guest's payment was already recorded, so the team cannot be changed. Undo the payment first.", 409)
    }
    return NextResponse.json({ success: true, registration: { ...data, amount: data.amount === null ? null : Number(data.amount) } as Registration })
  } catch (error) {
    console.error("Guest team change failed:", error)
    return fail("Could not change the team. Please try again.", 500)
  }
}
