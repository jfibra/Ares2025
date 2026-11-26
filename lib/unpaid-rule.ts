// The 48-hour payment rule, in one place for the server job and the countdowns in the portals.
// An agent has 48 hours from registering to pay. The clock stops once they upload a receipt or
// their team leader confirms the payment; otherwise the registration is removed.

export const UNPAID_HOURS = 48

// The rule counts from this moment for anyone who registered before it, so nobody is removed
// for time that passed before the rule existed.
export const UNPAID_RULE_STARTS_AT = "2026-11-30T08:00:00+08:00" // Nov 30, 2026, 8:00 AM Philippine time, when registration opens

/** When an unpaid registration made at `registrationDate` is removed, in milliseconds. */
export function paymentDeadlineMs(registrationDate: string): number {
  const start = Math.max(new Date(registrationDate).getTime(), new Date(UNPAID_RULE_STARTS_AT).getTime())
  return start + UNPAID_HOURS * 3_600_000
}

/** True while the 48-hour clock is running: not paid, not confirmed, no receipt uploaded. */
export function isOnPaymentClock(row: object): boolean {
  const { payment_status, confirmed_by_tl, agent_receipt_at } = row as Record<string, unknown>
  return payment_status === "unpaid" && !confirmed_by_tl && !agent_receipt_at
}
