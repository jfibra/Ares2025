import { NextResponse } from "next/server"
import { getTeamLeader } from "@/lib/auth"
import { photosIn, photosProblem, removePhotos, storePhotos } from "@/lib/photo-store"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { checkOwnTicket, saveOwnTicket } from "@/lib/tl-ticket"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** A signed-in team leader who has no registration of their own yet adds it from their portal. */
export async function POST(request: Request) {
  const leader = await getTeamLeader()
  if (!leader) return NextResponse.json({ success: false, message: "Not signed in." }, { status: 401 })
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 })
  const body: Record<string, unknown> = {}
  for (const key of ["birth_date", "birth_date_2", "whatsapp_number", "polo_shirt_size", "polo_shirt_size_2", "attending"]) {
    const value = form.get(key)
    if (typeof value === "string") body[key] = value
  }
  const photos = photosIn(form)

  try {
    const checked = await checkOwnTicket(leader.name, body)
    if (!checked.ok) {
      return NextResponse.json({ success: false, field: checked.field, message: checked.message }, { status: checked.status })
    }
    const photoProblem = photosProblem(photos, checked.ticket.attendee_count)
    if (photoProblem) return NextResponse.json({ success: false, field: "photo", message: photoProblem }, { status: 400 })

    const photoPaths = await storePhotos(photos)
    let saved: "saved" | "exists"
    try {
      saved = await saveOwnTicket(leader, checked.ticket, photoPaths)
    } catch (saveError) {
      await removePhotos(photoPaths)
      throw saveError
    }
    if (saved === "exists") {
      await removePhotos(photoPaths)
      return NextResponse.json({ success: false, message: "You are already registered. Refresh to see your registration." }, { status: 409 })
    }
    // They are attending after all: drop the "can't attend" answer they gave when registering.
    const { error: declineError } = await createSupabaseAdmin().from("team_leader_declines").delete().eq("email", leader.email)
    if (declineError) console.error("Could not clear the team leader's decline:", declineError)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Team leader own registration failed:", error)
    return NextResponse.json({ success: false, message: "We could not save your registration. Please try again." }, { status: 500 })
  }
}
