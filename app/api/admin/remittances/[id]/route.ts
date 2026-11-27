import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { sendPendingConfirmationEmails } from "@/lib/confirmation-email"
import { toRemittance } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** An admin marks a remittance as received, or rejects it with a note (which hands the agents back to the TL). */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdmin()
  if (!admin) return fail("Not signed in.", 401)

  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  const body = await request.json().catch(() => null)
  const decision = body?.status
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : ""
  if (id === null || (decision !== "verified" && decision !== "rejected")) return fail("Invalid request.")
  if (decision === "rejected" && !note) return fail("Add a note so the team leader knows why it was rejected.")

  const { data, error } = await createSupabaseAdmin().rpc("review_remittance", {
    p_id: id,
    p_verified: decision === "verified",
    p_note: note,
    p_reviewer: admin,
  })
  if (error) {
    if (/NOT_FOUND/.test(error.message)) return fail("Remittance not found.", 404)
    if (/ALREADY_REVIEWED/.test(error.message)) return fail("This remittance was already reviewed. Refresh to see it.", 409)
    console.error("Remittance review failed:", error)
    return fail("Could not update the remittance.", 500)
  }
  // The team leader's payment reached the admin, so these agents are now fully registered: congratulate them.
  if (decision === "verified") await sendPendingConfirmationEmails()
  return NextResponse.json({ success: true, remittance: toRemittance(data as Record<string, unknown>) })
}
