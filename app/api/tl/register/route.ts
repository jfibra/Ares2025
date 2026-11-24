import { NextResponse } from "next/server"
import { EMAIL_PATTERN } from "@/lib/agent-registration"
import { findTeamLeaderByEmail, setSession } from "@/lib/auth"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { isValidTlInvite } from "@/lib/tl-invite"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")
const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** Team leader sign-up. Only works with the invite token from the admin's link or QR code. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") return fail("Invalid request.")

  try {
    if (!(await isValidTlInvite(body.invite))) {
      return fail("This registration link is no longer valid. Please ask the admin for a new one.", 403)
    }

    const name = text(body.name)
    const email = text(body.email).toLowerCase()
    const contactNumber = text(body.contact_number)
    const team = text(body.team)
    const password = typeof body.password === "string" ? body.password : ""

    const errors: string[] = []
    if (!name || name.length > 200) errors.push("Please enter your name.")
    if (!EMAIL_PATTERN.test(email) || email.length > 320) errors.push("Please enter a valid email address.")
    if (contactNumber.length < 5 || contactNumber.length > 40) errors.push("Please enter your contact number.")
    if (!team || team.length > 200) errors.push("Please enter your team.")
    if (password.length < 8 || password.length > 72) errors.push("Your password must be 8 to 72 characters.")
    if (errors.length) return fail(errors.join(" "))

    if (await findTeamLeaderByEmail(email)) {
      return fail("This email is already registered as a team leader. Please sign in instead.", 409)
    }

    const supabase = createSupabaseAdmin()
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })
    if (createError || !created?.user) {
      // Never reset the password of an account that already exists.
      if (createError?.code === "email_exists" || createError?.status === 422) {
        return fail("An account with this email already exists. Please contact the admin.", 409)
      }
      throw createError ?? new Error("User was not created")
    }

    const { error: insertError } = await supabase
      .from("team_leaders")
      .insert({ user_id: created.user.id, name, email, contact_number: contactNumber, team })
    if (insertError) {
      await supabase.auth.admin.deleteUser(created.user.id) // undo the half-made account
      if (insertError.code === "23505") {
        return fail("This email is already registered as a team leader. Please sign in instead.", 409)
      }
      throw insertError
    }

    // They are joining after all: drop any earlier "not joining" answer.
    await supabase.from("team_leader_declines").delete().eq("email", email)

    setSession(email, "tl")
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Team leader registration failed:", error)
    return fail("We could not complete your registration. Please try again.", 500)
  }
}
