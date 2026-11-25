export type PaymentStatus = "unpaid" | "paid_to_tl" | "remitted" | "verified"

export type Registration = {
  id: number
  name: string
  email: string
  contact_number: string | null
  birth_date: string | null
  whatsapp_number: string | null
  polo_shirt_size: string | null
  /** 1, or 2 when both people on a couple's record are joining. Each person pays the fee. */
  attendee_count: number
  /** For a couple's record: who is joining. Null for a single agent. */
  attendees: string | null
  team: string
  team_leader_id: number | null
  team_leader_name: string | null
  confirmed_by_tl: boolean
  confirmed_at: string | null
  payment_status: PaymentStatus
  amount: number | null
  remittance_id: number | null
  /** When the agent uploaded proof of payment; null if they have not. */
  agent_receipt_at: string | null
  agent_receipt_note: string | null
  /** How many formal photos (for the posters) are on file: one per person joining, 0 for older registrations. */
  photo_count: number
  registration_date: string
}

export const REGISTRATION_COLUMNS =
  "id,name,email,contact_number,birth_date,whatsapp_number,polo_shirt_size,attendee_count,attendees,team,team_leader_id,team_leader_name,confirmed_by_tl,confirmed_at,payment_status,amount,remittance_id,agent_receipt_at,agent_receipt_note,photo_count,registration_date"

export type TeamLeader = {
  id: number
  name: string
  email: string
  contact_number: string
  team: string
  created_at: string
}

/** One place a team leader's agents can pay. `qr_url` is a link that expires. */
export type TlPaymentAccount = {
  id: number
  bank: string
  account_name: string | null
  account_number: string | null
  qr_url: string | null
}
/** Everything a team leader listed; agents pay into any one of them. */
export type TlPaymentDetails = TlPaymentAccount[]
export const MAX_PAYMENT_ACCOUNTS = 10

export const hasPaymentDetails = (details: TlPaymentDetails | null | undefined) => Boolean(details && details.length > 0)

export const TEAM_LEADER_COLUMNS = "id,name,email,contact_number,team,created_at"

/** A team leader who said they are not joining ARES 2027. */
export type TlDecline = {
  id: number
  name: string
  email: string
  team: string
  reason: string
  declined_at: string
}

export const TL_DECLINE_COLUMNS = "id,name,email,team,reason,declined_at"

export type Remittance = {
  id: number
  team_leader_id: number
  team_leader_name: string
  agent_count: number
  amount: number
  method: string
  reference_no: string
  has_receipt: boolean
  status: "submitted" | "verified" | "rejected"
  admin_note: string | null
  submitted_at: string
  reviewed_at: string | null
}

export const REMITTANCE_COLUMNS =
  "id,team_leader_id,team_leader_name,agent_count,amount,method,reference_no,receipt_path,status,admin_note,submitted_at,reviewed_at"

/** Database row to what the browser gets: the storage path stays on the server. */
export function toRemittance(row: Record<string, unknown>): Remittance {
  const { receipt_path, ...rest } = row
  return { ...(rest as Omit<Remittance, "has_receipt">), amount: Number(rest.amount), has_receipt: Boolean(receipt_path) }
}

export const PAYMENT_METHODS = ["GCash", "Bank transfer", "Cash", "Other"] as const
export const CURRENCY = "PHP"

export const POLO_SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const

export type AgentDetails = { birth_date: string; whatsapp_number: string; polo_shirt_size: string }

/** Checks what the agent typed in at registration. Used by the form and, again, by the API. */
export function validateAgentDetails(
  input: Partial<Record<keyof AgentDetails, unknown>> | null | undefined,
): { ok: true; details: AgentDetails } | { ok: false; field: keyof AgentDetails; message: string } {
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")

  const birthDate = text(input?.birth_date)
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(birthDate) ? new Date(`${birthDate}T00:00:00Z`) : null
  const realDate = parsed && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === birthDate
  if (!realDate) return { ok: false, field: "birth_date", message: "Please enter your birth date." }
  if (birthDate < "1900-01-01" || parsed.getTime() > Date.now()) {
    return { ok: false, field: "birth_date", message: "Please enter a valid birth date." }
  }

  // Keep a leading +, drop spaces, dashes and brackets: "+63 917-123 4567" -> "+639171234567".
  const whatsapp = text(input?.whatsapp_number).replace(/[\s\-().]/g, "")
  if (!/^\+?\d{7,15}$/.test(whatsapp)) {
    return { ok: false, field: "whatsapp_number", message: "Please enter a valid WhatsApp number, e.g. +63 917 123 4567." }
  }

  const size = text(input?.polo_shirt_size).toUpperCase()
  if (!(POLO_SHIRT_SIZES as readonly string[]).includes(size)) {
    return { ok: false, field: "polo_shirt_size", message: "Please choose your polo shirt size." }
  }

  return { ok: true, details: { birth_date: birthDate, whatsapp_number: whatsapp, polo_shirt_size: size } }
}

export const ATTENDING_CHOICES = ["first", "second", "both"] as const
export type Attending = (typeof ATTENDING_CHOICES)[number]

/** "Elddie John And Marjulie Benigay" -> ["Elddie John", "Marjulie Benigay"]. Null when the record is one person. */
export function splitCouple(name: string): [string, string] | null {
  const parts = name.trim().replace(/\s+/g, " ").split(/\s+(?:and|&)\s+/i)
  return parts.length === 2 && parts[0] && parts[1] ? [parts[0], parts[1]] : null
}

/** Who is joining and how many people pay. A single agent is always one; a couple must choose. */
export function resolveAttendance(
  name: string,
  attending: unknown,
): { ok: true; attendee_count: number; attendees: string | null } | { ok: false; message: string } {
  const couple = splitCouple(name)
  if (!couple) return { ok: true, attendee_count: 1, attendees: null }
  if (attending === "first") return { ok: true, attendee_count: 1, attendees: couple[0] }
  if (attending === "second") return { ok: true, attendee_count: 1, attendees: couple[1] }
  if (attending === "both") return { ok: true, attendee_count: 2, attendees: `${couple[0]} and ${couple[1]}` }
  return { ok: false, message: "Please tell us who is joining." }
}
