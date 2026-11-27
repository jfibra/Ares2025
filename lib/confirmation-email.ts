import { aresEmail, emailNotice, emailParagraph, escapeHtml } from "@/lib/email-layout"
import { sendEmail } from "@/lib/mailer"
import { createSupabaseAdmin } from "@/lib/supabase-server"

// Server only. Once a registrant's payment has reached the admin (payment status "verified"),
// they are emailed congratulations: they are officially registered. Sent once per registration;
// `confirmation_emailed_at` remembers it.

export function confirmationEmail(name: string, people: number) {
  const both = people > 1
  const subject = "Congratulations! You are registered for ARES 2027"
  const text = [
    `Hi ${name},`,
    "",
    `Congratulations! Your payment for ARES 2027 has been received by the ARES admin, and ${both ? `your ${people} slots are` : "your slot is"} now confirmed.`,
    "",
    "You are officially registered for ARES 2027. There is nothing more you need to do for now.",
    "We will send the next details about the summit to this email address.",
    "",
    "See you at ARES 2027!",
    "",
    "Thank you,",
    "ARES 2027 Team",
  ].join("\n")
  const strong = (value: string) => `<strong style="color:#2a1458;">${value}</strong>`
  const html = aresEmail({
    thai: "ยินดีด้วย",
    title: "You are registered",
    preview: "Your payment has been received. You are officially registered for ARES 2027.",
    body: [
      emailParagraph(`Hi ${strong(escapeHtml(name))},`),
      emailParagraph(
        `${strong("Congratulations!")} Your payment for ${strong("ARES 2027")} has been received by the ARES admin, and ${both ? `your ${people} slots are` : "your slot is"} now confirmed.`,
      ),
      emailNotice(`${strong("You are officially registered for ARES 2027.")} There is nothing more you need to do for now.`),
      emailParagraph("We will send the next details about the summit to this email address."),
      emailParagraph(`${strong("See you at ARES 2027!")}`),
    ].join(""),
  })
  return { subject, text, html }
}

/**
 * Emails everyone whose payment is verified and who has not been told yet. Never throws:
 * a mail problem must not undo or block the payment step that called this. Anyone missed is
 * picked up the next time this runs.
 */
export async function sendPendingConfirmationEmails(limit = 40) {
  let sent = 0
  let failed = 0
  try {
    const supabase = createSupabaseAdmin()
    const { data: due, error } = await supabase
      .from("registrations")
      .select("id")
      .eq("payment_status", "verified")
      .is("confirmation_emailed_at", null)
      .order("id")
      .limit(limit)
    if (error) throw error
    const ids = (due ?? []).map((row) => row.id as number)
    // A few at a time, so a large remittance does not keep the admin waiting.
    for (let i = 0; i < ids.length; i += 5) {
      await Promise.all(
        ids.slice(i, i + 5).map(async (id) => {
          // Claim it first, so the same person is never emailed twice.
          const { data: row, error: claimError } = await supabase
            .from("registrations")
            .update({ confirmation_emailed_at: new Date().toISOString() })
            .eq("id", id)
            .eq("payment_status", "verified")
            .is("confirmation_emailed_at", null)
            .select("id,name,email,attendee_count")
            .maybeSingle()
          if (claimError || !row) {
            if (claimError) console.error(`Could not mark registration ${id} for its confirmation email:`, claimError)
            return
          }
          try {
            await sendEmail({ to: row.email, ...confirmationEmail(row.name, row.attendee_count ?? 1) })
            sent++
          } catch (mailError) {
            console.error(`Could not send the confirmation email to ${row.email}:`, mailError)
            await supabase.from("registrations").update({ confirmation_emailed_at: null }).eq("id", id)
            failed++
          }
        }),
      )
    }
  } catch (error) {
    console.error("Sending confirmation emails failed:", error)
  }
  return { sent, failed }
}

/**
 * Sends the email to one registrant now, even if they already had it (the admin asked for it).
 * Only for a payment that has reached the admin. Throws when the email cannot be sent.
 */
export async function sendConfirmationEmailTo(id: number): Promise<{ at: string } | "not_found" | "not_paid"> {
  const supabase = createSupabaseAdmin()
  const { data: row, error } = await supabase.from("registrations").select("id,name,email,attendee_count,payment_status").eq("id", id).maybeSingle()
  if (error) throw error
  if (!row) return "not_found"
  if (row.payment_status !== "verified") return "not_paid"
  await sendEmail({ to: row.email, ...confirmationEmail(row.name, row.attendee_count ?? 1) })
  const at = new Date().toISOString()
  const { error: markError } = await supabase.from("registrations").update({ confirmation_emailed_at: at }).eq("id", id)
  if (markError) throw markError
  return { at }
}
