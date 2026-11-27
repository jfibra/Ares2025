import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { createAgentGuestCode } from "@/lib/guest-invite"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/**
 * An admin makes this registered agent's own guest link, or replaces it (`{ replace: true }`),
 * which stops the old link working. Guests who register through it are recorded as this agent's guests.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  const id = /^\d+$/.test(params.id) ? Number(params.id) : null
  if (id === null) return fail("Invalid request.")
  const body = await request.json().catch(() => null)
  try {
    const code = await createAgentGuestCode(id, body?.replace === true)
    if (!code) return fail("That registration was not found. Please refresh and try again.", 404)
    return NextResponse.json({ success: true, guest_code: code })
  } catch (error) {
    console.error("Agent guest link failed:", error)
    return fail("We could not create the link. Please try again.", 500)
  }
}
