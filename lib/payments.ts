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

/** When the fee was last changed, or null if it was never set. Someone who registered before this and has not paid owes the new fee. */
export async function getFeeChangedAt(): Promise<string | null> {
  const { data, error } = await createSupabaseAdmin().from("app_settings").select("updated_at").eq("key", FEE_KEY).maybeSingle()
  if (error) throw error
  return data?.updated_at ?? null
}

export async function setRegistrationFee(fee: number) {
  // Saving the same fee again is not a change, so it must not move the "changed at" time.
  if ((await getRegistrationFee()) === fee) return
  const { error } = await createSupabaseAdmin()
    .from("app_settings")
    .upsert({ key: FEE_KEY, value: fee.toFixed(2), updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
}

const SLOTS_KEY = "registration_slots"
/** How many people can register until an admin changes it in Settings. */
export const DEFAULT_SLOT_LIMIT = 300

/** The most people who may register. A couple who are both joining takes two slots. */
export async function getSlotLimit(): Promise<number> {
  const { data, error } = await createSupabaseAdmin().from("app_settings").select("value").eq("key", SLOTS_KEY).maybeSingle()
  if (error) throw error
  const limit = data ? Number(data.value) : NaN
  return Number.isInteger(limit) && limit >= 0 ? limit : DEFAULT_SLOT_LIMIT
}

export async function setSlotLimit(limit: number) {
  const { error } = await createSupabaseAdmin()
    .from("app_settings")
    .upsert({ key: SLOTS_KEY, value: String(limit), updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) throw error
}

/** Slots still open: the limit minus every person already registered, paid or not. */
export async function getSlotsLeft(): Promise<number> {
  return (await getSlotStatus()).left
}

/** The total number of slots and how many are still open. */
export async function getSlotStatus(): Promise<{ limit: number; left: number }> {
  const supabase = createSupabaseAdmin()
  const [limit, taken] = await Promise.all([getSlotLimit(), supabase.from("registrations").select("attendee_count").limit(100_000)])
  if (taken.error) throw taken.error
  const people = (taken.data ?? []).reduce((total, row) => total + (row.attendee_count ?? 1), 0)
  return { limit, left: Math.max(0, limit - people) }
}

/** Everything a dashboard shows. `teamLeaderId` limits it to one team leader's own records. */
export async function loadDashboardData(teamLeaderId?: number): Promise<{
  registrations: Registration[]
  remittances: Remittance[]
  fee: number | null
  /** When the fee last changed: unpaid registrations made before this now owe the new fee. */
  feeChangedAt: string | null
  slotLimit: number
}> {
  const supabase = createSupabaseAdmin()
  let registrations = supabase.from("registrations").select(REGISTRATION_COLUMNS).order("registration_date", { ascending: false })
  let remittances = supabase.from("remittances").select(REMITTANCE_COLUMNS).order("submitted_at", { ascending: false })
  if (teamLeaderId !== undefined) {
    registrations = registrations.eq("team_leader_id", teamLeaderId)
    remittances = remittances.eq("team_leader_id", teamLeaderId)
  }
  const [regs, rems, fee, slotLimit, feeChangedAt] = await Promise.all([
    registrations,
    remittances,
    getRegistrationFee(),
    getSlotLimit(),
    getFeeChangedAt().catch(() => null),
  ])
  if (regs.error) throw regs.error
  if (rems.error) throw rems.error
  return {
    registrations: (regs.data ?? []).map((r) => ({ ...r, amount: r.amount === null ? null : Number(r.amount) })) as Registration[],
    remittances: (rems.data ?? []).map((r) => toRemittance(r as Record<string, unknown>)),
    fee,
    feeChangedAt,
    slotLimit,
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
  let lookup = supabase.from("registrations").select("attendee_count,team_leader_id").eq("id", id)
  if (teamLeaderId !== undefined) lookup = lookup.eq("team_leader_id", teamLeaderId)
  const { data: row, error: lookupError } = await lookup.maybeSingle()
  if (lookupError) throw lookupError
  const people = row?.attendee_count ?? 1
  // A registration with no team leader (theirs is not joining) is managed by the admin: the agent
  // pays the admin directly, so the admin's confirmation makes it fully paid, with no remittance.
  const adminManaged = teamLeaderId === undefined && Boolean(row) && row?.team_leader_id === null
  const paidStatus = adminManaged ? "verified" : "paid_to_tl"

  let query = supabase
    .from("registrations")
    .update(
      received
        ? {
            confirmed_by_tl: true,
            confirmed_at: new Date().toISOString(),
            payment_status: paidStatus,
            amount: (fee ?? 0) * people,
          }
        : { confirmed_by_tl: false, confirmed_at: null, payment_status: "unpaid", amount: null },
    )
    .eq("id", id)
    // Only these moves are allowed; anything already sent to the admin is locked.
    .eq("payment_status", received ? "unpaid" : paidStatus)
  // "verified" may only be undone here for an admin-managed registration, never one paid through a remittance.
  if (adminManaged) query = query.is("team_leader_id", null).is("remittance_id", null)
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

