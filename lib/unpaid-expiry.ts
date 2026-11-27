import { aresEmail, emailButton, emailNotice, emailParagraph, emailSteps, escapeHtml } from "@/lib/email-layout"
import { getGuestInviteCode } from "@/lib/guest-invite"
import { sendEmail } from "@/lib/mailer"
import { RECEIPT_BUCKET } from "@/lib/payments"
import { PHOTO_BUCKET } from "@/lib/photo"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { UNPAID_HOURS, UNPAID_RULE_STARTS_AT, UNPAID_WINDOW } from "@/lib/unpaid-rule"

// An agent has 3 days from registering to pay. One who has neither uploaded a receipt nor
// been confirmed by their team leader by then loses the registration (and the slot it held),
// and is emailed to say so; they may register again.

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://asianrealestatesummit.com").replace(/\/$/, "")
const REGISTRATION_URL = `${SITE_URL}/registration`

/** The email an agent gets when their unpaid registration is removed. */
/** `guestUrl` is the guest registration link, for a guest: they register there again and pay the admin. */
export function removalEmail(name: string, guestUrl?: string) {
  const registerUrl = guestUrl ?? REGISTRATION_URL
  const payee = guestUrl ? "the ARES admin" : "your team leader"
  const contact = guestUrl ? "the ARES admin" : "your team leader or the ARES admin"
  const subject = "Your ARES 2027 registration was removed"
  const text = [
    `Hi ${name},`,
    "",
    `Your registration for ARES 2027 has been removed because the payment was not completed within ${UNPAID_WINDOW} of registering.`,
    "",
    "If you still want to attend, please register again while slots are available:",
    registerUrl,
    "",
    `After registering, please pay ${payee} and upload your receipt within ${UNPAID_WINDOW} to keep your slot.`,
    "",
    `If you already paid, please contact ${contact}.`,
    "",
    "Thank you,",
    "ARES 2027 Team",
  ].join("\n")
  const html = aresEmail({
    thai: "สวัสดี",
    title: "Your registration was removed",
    preview: `Your payment was not completed within ${UNPAID_WINDOW}. You can register again while slots are available.`,
    body: [
      emailParagraph(`Hi <strong style="color:#2a1458;">${escapeHtml(name)}</strong>,`),
      emailParagraph(
        `Your registration for <strong style="color:#2a1458;">ARES 2027</strong> has been removed because the payment was not completed within <strong style="color:#2a1458;">${UNPAID_WINDOW}</strong> of registering.`,
      ),
      emailNotice(
        `<strong style="color:#2a1458;">Your slot has been released.</strong> If you still want to attend, please register again while slots are available.`,
      ),
      emailButton("Register again", registerUrl),
      `<p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:#2a1458;">To keep your slot next time</p>`,
      emailSteps([
        "Register again on the ARES 2027 website.",
        `Pay the registration fee to ${payee}.`,
        `Upload your receipt within <strong style="color:#2a1458;">${UNPAID_WINDOW}</strong> of registering.`,
      ]),
      emailParagraph(
        `<span style="font-size:14px;color:#7a6a4a;">Already paid? Please contact ${contact}.</span>`,
      ),
    ].join(""),
  })
  return { subject, text, html }
}

type Expired = { id: number; name: string; email: string; guest_type: string | null; agent_receipt_path: string | null; photo_paths: string[] | null }

/**
 * Removes every agent registration that is still unpaid, with no receipt uploaded, 3 days
 * after it was made, and emails each agent. A team leader's own registration is never removed.
 */
export async function removeUnpaidRegistrations(now = Date.now()) {
  // Nothing can be overdue until 3 days after the rule began.
  if (now < new Date(UNPAID_RULE_STARTS_AT).getTime() + UNPAID_HOURS * 3_600_000) return { removed: 0, emailed: 0, failedEmails: [] as string[] }
  const cutoff = new Date(now - UNPAID_HOURS * 3_600_000).toISOString()
  const supabase = createSupabaseAdmin()

  const { data: leaders, error: leaderError } = await supabase.from("team_leaders").select("email")
  if (leaderError) throw leaderError
  const leaderEmails = new Set((leaders ?? []).map((leader) => leader.email as string))

  const { data: overdue, error } = await supabase
    .from("registrations")
    .select("id,email")
    .eq("payment_status", "unpaid")
    .eq("confirmed_by_tl", false)
    .is("agent_receipt_at", null)
    .lt("registration_date", cutoff)
  if (error) throw error

  let removed = 0
  let emailed = 0
  const failedEmails: string[] = []
  for (const row of overdue ?? []) {
    if (leaderEmails.has(row.email)) continue
    // The conditions are repeated on the delete, so a payment or receipt that arrived a moment ago is safe.
    const { data, error: deleteError } = await supabase
      .from("registrations")
      .delete()
      .eq("id", row.id)
      .eq("payment_status", "unpaid")
      .eq("confirmed_by_tl", false)
      .is("agent_receipt_at", null)
      .select("id,name,email,guest_type,agent_receipt_path,photo_paths")
      .maybeSingle()
    if (deleteError) {
      console.error(`Could not remove unpaid registration ${row.id}:`, deleteError)
      continue
    }
    if (!data) continue
    const gone = data as Expired
    removed++
    if (gone.photo_paths?.length) await supabase.storage.from(PHOTO_BUCKET).remove(gone.photo_paths)
    if (gone.agent_receipt_path) await supabase.storage.from(RECEIPT_BUCKET).remove([gone.agent_receipt_path])
    try {
      // A guest registers again through the guest link, which the public registration page does not offer.
      const guestUrl = gone.guest_type ? `${SITE_URL}/guest/${await getGuestInviteCode()}` : undefined
      await sendEmail({ to: gone.email, ...removalEmail(gone.name, guestUrl) })
      emailed++
    } catch (mailError) {
      console.error(`Removed unpaid registration ${gone.id} but could not email ${gone.email}:`, mailError)
      failedEmails.push(gone.email)
    }
  }
  return { removed, emailed, failedEmails }
}
