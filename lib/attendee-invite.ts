import { aresEmail, emailButton, emailNotice, emailParagraph, emailSteps } from "@/lib/email-layout"
import { sendEmail } from "@/lib/mailer"
import { getRegistrationFee } from "@/lib/payments"
import { GENERAL_REGISTRATION_OPENS_AT, REGISTRATION_OPENS_AT } from "@/lib/registration-opening"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { UNPAID_WINDOW } from "@/lib/unpaid-rule"

// Server only. The invitation the admin sends to everyone who attended ARES 2025: they register
// first. Each address is emailed once; `invited_at` on the attendee list remembers who got it.

const TABLE = "ares_2025_attendees"
const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://asianrealestatesummit.com").replace(/\/$/, "")
const REGISTRATION_URL = `${SITE_URL}/registration`

/** How many emails one request sends. Small, so a request always finishes in time. */
export const INVITE_BATCH = 10

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
    .format(new Date(iso))
    .replace(" at ", ", ")

export function inviteEmail(fee: number | null) {
  const opens = when(REGISTRATION_OPENS_AT)
  const general = when(GENERAL_REGISTRATION_OPENS_AT)
  const feeText = fee === null ? null : `₱${fee.toLocaleString("en-PH")}`
  const subject = "ARES 2027: you register first"
  const text = [
    "Hi,",
    "",
    "Thank you for joining us at ARES 2025. Because you were with us, you get to register for ARES 2027 before everyone else.",
    "",
    `Pre-registration for ARES 2025 attendees opens ${opens} (Philippine time).`,
    `General registration opens ${general}, first come, first served, so please register early to be sure of your slot.`,
    "",
    "Register here with your LR email:",
    REGISTRATION_URL,
    "",
    feeText ? `The registration fee is ${feeText} per person.` : null,
    `After registering, please pay and upload your receipt within ${UNPAID_WINDOW} to keep your slot.`,
    "",
    "Thank you,",
    "ARES 2027 Team",
  ]
    .filter((line) => line !== null)
    .join("\n")
  const strong = (value: string) => `<strong style="color:#2a1458;">${value}</strong>`
  const html = aresEmail({
    thai: "ยินดีต้อนรับ",
    title: "You register first",
    preview: `Pre-registration for ARES 2025 attendees opens ${opens}.`,
    body: [
      emailParagraph("Hi,"),
      emailParagraph(
        `Thank you for joining us at ${strong("ARES 2025")}. Because you were with us, you get to register for ${strong("ARES 2027")} before everyone else.`,
      ),
      emailNotice(
        `${strong("Pre-registration opens " + opens)} (Philippine time), for ARES 2025 attendees only.<br>General registration opens ${general}, first come, first served.`,
      ),
      emailButton("Register for ARES 2027", REGISTRATION_URL),
      `<p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:#2a1458;">How to register</p>`,
      emailSteps([
        `Open the registration page and enter your ${strong("LR email")}.`,
        feeText ? `Pay the registration fee of ${strong(feeText)} per person.` : "Pay the registration fee.",
        `Upload your receipt within ${strong(UNPAID_WINDOW)} of registering to keep your slot.`,
      ]),
    ].join(""),
  })
  return { subject, text, html }
}

type Pending = { pending: string[]; invited: number; registered: number; total: number }

/** Who is still to be invited. People who have already registered are left out. */
async function loadPending(): Promise<Pending> {
  const supabase = createSupabaseAdmin()
  const [attendees, registrations, leaders] = await Promise.all([
    supabase.from(TABLE).select("email,invited_at").order("email").limit(100_000),
    supabase.from("registrations").select("email").limit(100_000),
    supabase.from("team_leaders").select("email").limit(100_000),
  ])
  if (attendees.error) throw attendees.error
  if (registrations.error) throw registrations.error
  if (leaders.error) throw leaders.error
  const joined = new Set([...(registrations.data ?? []), ...(leaders.data ?? [])].map((row) => String(row.email).toLowerCase()))
  const rows = attendees.data ?? []
  const notInvited = rows.filter((row) => !row.invited_at)
  const pending = notInvited.filter((row) => !joined.has(row.email)).map((row) => row.email as string)
  return { pending, invited: rows.length - notInvited.length, registered: notInvited.length - pending.length, total: rows.length }
}

export async function inviteStatus() {
  const { pending, invited, registered, total } = await loadPending()
  return { total, invited, registered, remaining: pending.length }
}

/**
 * Sends the invitation to the next few people who have not had it. Stops early when the mail
 * account refuses (for example, its daily sending limit), so the rest can be sent later.
 */
export async function sendInviteBatch(limit = INVITE_BATCH) {
  const supabase = createSupabaseAdmin()
  const { pending } = await loadPending()
  const message = inviteEmail(await getRegistrationFee())
  let sent = 0
  let failed = 0
  let lastError: string | null = null
  for (const email of pending.slice(0, limit)) {
    // Claim the address first, so two presses of the button can never email one person twice.
    const { data, error } = await supabase
      .from(TABLE)
      .update({ invited_at: new Date().toISOString() })
      .eq("email", email)
      .is("invited_at", null)
      .select("email")
      .maybeSingle()
    if (error) throw error
    if (!data) continue
    try {
      await sendEmail({ to: email, ...message })
      sent++
    } catch (mailError) {
      console.error(`Could not send the ARES 2025 invitation to ${email}:`, mailError)
      await supabase.from(TABLE).update({ invited_at: null }).eq("email", email)
      failed++
      lastError = mailError instanceof Error ? mailError.message : String(mailError)
      if (failed >= 2) break
    }
  }
  return { sent, failed, lastError, ...(await inviteStatus()) }
}
