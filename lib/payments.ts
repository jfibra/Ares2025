import {
  REGISTRATION_COLUMNS,
  REMITTANCE_COLUMNS,
  toRemittance,
  type Registration,
  type Remittance,
} from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"

// Server only.

export const RECEIPT_BUCKET = "remittance-receipts"
const FEE_KEY = "registration_fee"

/** The registration fee per agent, or null until an admin sets it. */
export async function getRegistrationFee(): Promise<number | null> {
  const { data, error } = await createSupabaseAdmin().from("app_settings").select("value").eq("key", FEE_KEY).maybeSingle()
  if (error) throw error
  const fee = data ? Number(data.value) : NaN
  return Number.isFinite(fee) && fee >= 0 ? fee : null
}

export async function setRegistrationFee(fee: number) {
  const { error } = await createSupabaseAdmin()
    .from("app_settings")
    .upsert({ key: FEE_KEY, value: fee.toFixed(2), updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
}

/** Everything a dashboard shows. `teamLeaderId` limits it to one team leader's own records. */
export async function loadDashboardData(teamLeaderId?: number): Promise<{
  registrations: Registration[]
  remittances: Remittance[]
  fee: number | null
}> {
  const supabase = createSupabaseAdmin()
  let registrations = supabase.from("registrations").select(REGISTRATION_COLUMNS).order("registration_date", { ascending: false })
  let remittances = supabase.from("remittances").select(REMITTANCE_COLUMNS).order("submitted_at", { ascending: false })
  if (teamLeaderId !== undefined) {
    registrations = registrations.eq("team_leader_id", teamLeaderId)
    remittances = remittances.eq("team_leader_id", teamLeaderId)
  }
  const [regs, rems, fee] = await Promise.all([registrations, remittances, getRegistrationFee()])
  if (regs.error) throw regs.error
  if (rems.error) throw rems.error
  return {
    registrations: (regs.data ?? []).map((r) => ({ ...r, amount: r.amount === null ? null : Number(r.amount) })) as Registration[],
    remittances: (rems.data ?? []).map((r) => toRemittance(r as Record<string, unknown>)),
    fee,
  }
}

export type ConfirmResult =
  | { ok: true; registration: Registration }
  | { ok: false; status: number; message: string }

/**
 * "I received this agent's payment" (or undo it). `teamLeaderId` restricts a team
 * leader to their own agents; admins pass undefined.
 */
export async function setPaymentReceived(id: number, received: boolean, teamLeaderId?: number): Promise<ConfirmResult> {
  const supabase = createSupabaseAdmin()
  let fee: number | null = null
  if (received) {
    fee = await getRegistrationFee()
    if (fee === null) {
      return { ok: false, status: 409, message: "The registration fee has not been set yet. Ask the admin to set it first." }
    }
  }

  // Each person pays the fee, so a couple who are both joining owes double.
  let people = 1
  if (received) {
    let lookup = supabase.from("registrations").select("attendee_count").eq("id", id)
    if (teamLeaderId !== undefined) lookup = lookup.eq("team_leader_id", teamLeaderId)
    const { data: row, error: lookupError } = await lookup.maybeSingle()
    if (lookupError) throw lookupError
    people = row?.attendee_count ?? 1
  }

  let query = supabase
    .from("registrations")
    .update(
      received
        ? {
            confirmed_by_tl: true,
            confirmed_at: new Date().toISOString(),
            payment_status: "paid_to_tl",
            amount: (fee ?? 0) * people,
          }
        : { confirmed_by_tl: false, confirmed_at: null, payment_status: "unpaid", amount: null },
    )
    .eq("id", id)
    // Only these moves are allowed; anything already sent to the admin is locked.
    .eq("payment_status", received ? "unpaid" : "paid_to_tl")
  if (teamLeaderId !== undefined) query = query.eq("team_leader_id", teamLeaderId)

  const { data, error } = await query.select(REGISTRATION_COLUMNS).maybeSingle()
  if (error) throw error
  if (!data) {
    return {
      ok: false,
      status: 409,
      message: received
        ? "This registration is no longer pending. Refresh to see its current status."
        : "This payment has already been sent to the admin, so it can no longer be undone.",
    }
  }
  return { ok: true, registration: { ...data, amount: data.amount === null ? null : Number(data.amount) } as Registration }
}

