import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { getTeamLeader } from "@/lib/auth"
import { RECEIPT_BUCKET } from "@/lib/payments"
import { PAYMENT_METHODS, toRemittance } from "@/lib/registrations"
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

/** A team leader records sending collected payments to the organizer, for one or many of their agents. */
export async function POST(request: Request) {
  const leader = await getTeamLeader()
  if (!leader) return fail("Not signed in.", 401)

  const form = await request.formData().catch(() => null)
  if (!form) return fail("Invalid request.")

  let ids: number[] = []
  try {
    const parsed = JSON.parse(String(form.get("registration_ids") ?? "[]"))
    if (Array.isArray(parsed)) ids = [...new Set(parsed.filter((n) => Number.isInteger(n) && n > 0))]
  } catch {
    ids = []
  }
  const method = String(form.get("method") ?? "").trim()
  const referenceNo = String(form.get("reference_no") ?? "").trim()
  const receipt = form.get("receipt")

  if (ids.length === 0) return fail("Select at least one agent.")
  if (ids.length > 1000) return fail("Too many agents in one remittance.")
  if (!(PAYMENT_METHODS as readonly string[]).includes(method)) return fail("Choose how you sent the payment.")
  if (!referenceNo || referenceNo.length > 120) return fail("Enter the reference number of your payment.")
  if (!(receipt instanceof File) || receipt.size === 0) return fail("Attach a photo or screenshot of the receipt.")
  if (receipt.size > MAX_RECEIPT_BYTES) return fail("The receipt file is larger than 5 MB.")
  const extension = RECEIPT_TYPES[receipt.type]
  if (!extension) return fail("The receipt must be a JPG, PNG, WEBP or HEIC image, or a PDF.")

  const supabase = createSupabaseAdmin()
  const path = `${leader.id}/${randomUUID()}.${extension}`
  try {
    const { error: uploadError } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(path, Buffer.from(await receipt.arrayBuffer()), { contentType: receipt.type, upsert: false })
    if (uploadError) throw uploadError

    const { data, error } = await supabase.rpc("create_remittance", {
      p_team_leader_id: leader.id,
      p_registration_ids: ids,
      p_method: method,
      p_reference_no: referenceNo,
      p_receipt_path: path,
    })
    if (error) {
      await supabase.storage.from(RECEIPT_BUCKET).remove([path]) // nothing was recorded, so drop the file
      if (/AGENTS_NOT_ELIGIBLE/.test(error.message)) {
        return fail("Some of the selected agents can no longer be sent. Refresh and try again.", 409)
      }
      throw error
    }
    return NextResponse.json({ success: true, remittance: toRemittance(data as Record<string, unknown>) }, { status: 201 })
  } catch (error) {
    console.error("Remittance failed:", error)
    return fail("We could not record your remittance. Please try again.", 500)
  }
}
