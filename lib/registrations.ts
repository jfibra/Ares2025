export type PaymentStatus = "unpaid" | "paid_to_tl" | "remitted" | "verified"

export type Registration = {
  id: number
  name: string
  email: string
  contact_number: string | null
  birth_date: string | null
  /** The second person's birth date, when both people on a couple's record are joining. */
  birth_date_2: string | null
  whatsapp_number: string | null
  polo_shirt_size: string | null
  /** The second person's size, when both people on a couple's record are joining. */
  polo_shirt_size_2: string | null
  /** 1, or 2 when both people on a couple's record are joining. Each person pays the fee. */
  attendee_count: number
  /** For a couple's record: who is joining. Null for a single agent. */
  attendees: string | null
  team: string
  team_leader_id: number | null
  team_leader_name: string | null
  /** Special registration through the admin's guest link: whether the guest is in the LR records. Null for everyone else. */
  guest_type: "lr_agent" | "non_lr" | null
  /** The team leader whose guest link this guest registered through; null for the admin's link. */
  guest_of_team_leader_id: number | null
  /** The registered agent whose guest link this guest registered through (that agent's registration id). */
  guest_of_registration_id: number | null
  /** The code of this person's own guest link (/guest/<code>), once the admin has made one. */
  guest_code: string | null
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
  "id,name,email,contact_number,birth_date,birth_date_2,whatsapp_number,polo_shirt_size,polo_shirt_size_2,attendee_count,attendees,team,team_leader_id,team_leader_name,guest_type,guest_of_team_leader_id,guest_of_registration_id,guest_code,confirmed_by_tl,confirmed_at,payment_status,amount,remittance_id,agent_receipt_at,agent_receipt_note,photo_count,registration_date"

export type TeamLeader = {
  id: number
  name: string
  email: string
  contact_number: string
  /** Where their agents can contact them. Null until they add it in the portal. */
  facebook_url: string | null
  /** The code of this leader's own guest link (/guest/<code>), once the admin has made one. */
  guest_code: string | null
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

export const TEAM_LEADER_COLUMNS = "id,name,email,contact_number,facebook_url,guest_code,team,created_at"

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

export const POLO_SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"] as const

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

/**
 * The second person's polo shirt size. Needed only when both people on a couple's record are
 * joining (two people, two shirts); otherwise nothing is kept.
 */
export function resolvePartnerPoloSize(
  attendeeCount: number,
  value: unknown,
): { ok: true; polo_shirt_size_2: string | null } | { ok: false; message: string } {
  if (attendeeCount !== 2) return { ok: true, polo_shirt_size_2: null }
  const size = typeof value === "string" ? value.trim().toUpperCase() : ""
  if (!(POLO_SHIRT_SIZES as readonly string[]).includes(size)) {
    return { ok: false, message: "Please choose a polo shirt size for each of you." }
  }
  return { ok: true, polo_shirt_size_2: size }
}

/**
 * The second person's birth date. Needed only when both people on a couple's record are joining;
 * otherwise nothing is kept.
 */
export function resolvePartnerBirthDate(
  attendeeCount: number,
  value: unknown,
): { ok: true; birth_date_2: string | null } | { ok: false; message: string } {
  if (attendeeCount !== 2) return { ok: true, birth_date_2: null }
  const birthDate = typeof value === "string" ? value.trim() : ""
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(birthDate) ? new Date(`${birthDate}T00:00:00Z`) : null
  const realDate = parsed && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === birthDate
  if (!realDate) return { ok: false, message: "Please enter a birth date for each of you." }
  if (birthDate < "1900-01-01" || parsed.getTime() > Date.now()) {
    return { ok: false, message: "Please enter a valid birth date for each of you." }
  }
  return { ok: true, birth_date_2: birthDate }
}

/** "M", or "M / L" when a couple are both joining. */
export const poloSizesLabel = (row: { polo_shirt_size?: unknown; polo_shirt_size_2?: unknown }) =>
  [row.polo_shirt_size, row.polo_shirt_size_2].filter((size) => typeof size === "string" && size).join(" / ")

/** How many polo shirts a registration orders: one for each person joining who gave a size. */
export const poloQuantity = (row: { polo_shirt_size?: unknown; polo_shirt_size_2?: unknown }) =>
  [row.polo_shirt_size, row.polo_shirt_size_2].filter((size) => typeof size === "string" && size).length

export const ATTENDING_CHOICES = ["first", "second", "both"] as const
export type Attending = (typeof ATTENDING_CHOICES)[number]

// Words that belong to the surname that follows them: "Dela Cruz", "De Los Santos".
const SURNAME_PARTICLES = new Set(["de", "del", "dela", "delos", "la", "las", "los", "da", "dos", "san", "santa", "sto", "sta", "van", "von"])

/** "Crislyn Dela Cruz" -> "Dela Cruz". Empty when the name is a single word. */
function surnameOf(fullName: string): string {
  const words = fullName.split(" ")
  if (words.length < 2) return ""
  let start = words.length - 1
  while (start > 1 && SURNAME_PARTICLES.has(words[start - 1].toLowerCase().replace(/\.$/, ""))) start--
  return words.slice(start).join(" ")
}

const NAME_SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "v"])

/**
 * The two people on a couple's record, each with a full name. Null when the record is one person.
 * LR writes one surname, after the second person. Whether it also belongs to the first person
 * has to be guessed from the first person's name:
 * - one or two words are given names, so the surname is shared (a married couple):
 *   "Elddie John And Marjulie Benigay" -> ["Elddie John Benigay", "Marjulie Benigay"].
 * - three or more words already end in that person's own surname (partners with different surnames):
 *   "Ralph Kane Dunlao and Ryan Galido Loriega" -> ["Ralph Kane Dunlao", "Ryan Galido Loriega"].
 * "Jr", "III" and the like are not counted as words. A first person who already carries the
 * surname is left alone, so splitting twice is safe.
 */
export function splitCouple(name: string): [string, string] | null {
  const parts = name.trim().replace(/\s+/g, " ").split(/\s+(?:and|&)\s+/i)
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  const [first, second] = parts
  const surname = surnameOf(second)
  const hasIt = ` ${first} `.toLowerCase().endsWith(` ${surname} `.toLowerCase())
  const ownWords = first.split(" ").filter((word) => !NAME_SUFFIXES.has(word.toLowerCase().replace(/\.$/, "")))
  const hasOwnSurname = ownWords.length >= 3
  return [surname && !hasIt && !hasOwnSurname ? `${first} ${surname}` : first, second]
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
