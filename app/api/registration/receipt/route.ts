import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { EMAIL_PATTERN } from "@/lib/agent-registration"
import { RECEIPT_BUCKET } from "@/lib/payments"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024
const RECEIPT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "application/pdf": "pdf",
}
const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** A registered agent sends proof that they paid their team leader. Only while the payment is still unconfirmed. */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return fail("Invalid request.")

  const email = String(form.get("email") ?? "").trim().toLowerCase()
  const note = String(form.get("note") ?? "").trim()
  const receipt = form.get("receipt")
  if (!EMAIL_PATTERN.test(email) || email.length > 320) return fail("Please enter a valid email address.")
  if (note.length > 500) return fail("The note is too long. Please keep it under 500 characters.")
  if (!(receipt instanceof File) || receipt.size === 0) return fail("Attach a photo or screenshot of your receipt.")
  if (receipt.size > MAX_RECEIPT_BYTES) return fail("The receipt file is larger than 5 MB.")
  const extension = RECEIPT_TYPES[receipt.type]
  if (!extension) return fail("The receipt must be a JPG, PNG, WEBP or HEIC image, or a PDF.")

  const supabase = createSupabaseAdmin()
  try {
    const { data: registration, error: findError } = await supabase
      .from("registrations")
      .select("id,payment_status,agent_receipt_path")
      .eq("email", email)
      .maybeSingle()
    if (findError) throw findError
    if (!registration) return fail("We could not find your registration. Please register first.", 404)
    if (registration.payment_status !== "unpaid") {
      return fail("Your team leader has already confirmed your payment, so a receipt is no longer needed.", 409)
    }

    const path = `agents/${registration.id}/${randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(path, Buffer.from(await receipt.arrayBuffer()), { contentType: receipt.type, upsert: false })
    if (uploadError) throw uploadError

    const sentAt = new Date().toISOString()
    const { data: saved, error: saveError } = await supabase
      .from("registrations")
      .update({ agent_receipt_path: path, agent_receipt_note: note || null, agent_receipt_at: sentAt })
      .eq("id", registration.id)
      .eq("payment_status", "unpaid")
      .select("id")
      .maybeSingle()
    if (saveError || !saved) {
      await supabase.storage.from(RECEIPT_BUCKET).remove([path]) // nothing was recorded, so drop the file
      if (saveError) throw saveError
      return fail("Your team leader has already confirmed your payment, so a receipt is no longer needed.", 409)
    }
    // A newer receipt replaces the earlier one.
    if (registration.agent_receipt_path) await supabase.storage.from(RECEIPT_BUCKET).remove([registration.agent_receipt_path])

    return NextResponse.json({ success: true, receipt_sent_at: sentAt }, { status: 201 })
  } catch (error) {
    console.error("Agent receipt upload failed:", error)
    return fail("We could not send your receipt. Please try again.", 500)
  }
}
