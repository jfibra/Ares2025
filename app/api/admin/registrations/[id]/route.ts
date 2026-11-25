import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { RECEIPT_BUCKET, setPaymentReceived } from "@/lib/payments"
import { PHOTO_BUCKET } from "@/lib/photo"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: { id: string } }

const parseId = (raw: string) => (/^\d+$/.test(raw) ? Number(raw) : null)
const unauthorized = () => NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })

/** An admin records, on the team leader's behalf, that the agent's payment was received (or undoes it). */
export async function PATCH(request: Request, { params }: Context) {
  if (!(await getAdmin())) return unauthorized()
  const id = parseId(params.id)
  const body = await request.json().catch(() => null)
  if (id === null || typeof body?.confirmed_by_tl !== "boolean") {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })
  }
  try {
    const result = await setPaymentReceived(id, body.confirmed_by_tl)
    if (!result.ok) return NextResponse.json({ success: false, message: result.message }, { status: result.status })
    return NextResponse.json({ success: true, registration: result.registration })
  } catch (error) {
    console.error("Admin update failed:", error)
    return NextResponse.json({ success: false, message: "Could not update the registration." }, { status: 500 })
  }
}

/** Deletes a registration. Refused once its payment has been sent to the admin. */
export async function DELETE(_request: Request, { params }: Context) {
  if (!(await getAdmin())) return unauthorized()
  const id = parseId(params.id)
  if (id === null) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from("registrations")
    .delete()
    .eq("id", id)
    .in("payment_status", ["unpaid", "paid_to_tl"])
    .select("id,agent_receipt_path,photo_paths")
    .maybeSingle()
  if (data?.photo_paths?.length) await supabase.storage.from(PHOTO_BUCKET).remove(data.photo_paths)
  if (data?.agent_receipt_path) await supabase.storage.from(RECEIPT_BUCKET).remove([data.agent_receipt_path])
  if (error) {
    console.error("Admin delete failed:", error)
    return NextResponse.json({ success: false, message: "Could not delete the registration." }, { status: 500 })
  }
  if (!data) {
    const { data: exists } = await supabase.from("registrations").select("id").eq("id", id).maybeSingle()
    return exists
      ? NextResponse.json(
          { success: false, message: "This agent's payment is part of a remittance, so the registration cannot be deleted." },
          { status: 409 },
        )
      : NextResponse.json({ success: false, message: "Registration not found." }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
