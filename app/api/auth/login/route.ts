import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { findTeamLeaderByEmail, isAllowedAdmin, setSession, type Role } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** One sign-in for both portals. The answer says which one the account belongs to. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  if (!email || !password) {
    return NextResponse.json({ success: false, message: "Enter your email and password." }, { status: 400 })
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    console.error("Login: Supabase URL or publishable key is not set")
    return NextResponse.json({ success: false, message: "Sign-in is not configured." }, { status: 500 })
  }

  try {
    // Supabase Auth checks the password; our own tables decide the role.
    const auth = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { error } = await auth.auth.signInWithPassword({ email, password })
    if (error) {
      return NextResponse.json({ success: false, message: "Incorrect email or password." }, { status: 401 })
    }

    let role: Role | null = null
    if (await isAllowedAdmin(email)) role = "admin"
    else if (await findTeamLeaderByEmail(email)) role = "tl"
    if (!role) {
      return NextResponse.json({ success: false, message: "This account does not have access." }, { status: 403 })
    }
    setSession(email, role)
    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error("Login failed:", error)
    return NextResponse.json({ success: false, message: "Could not sign in. Please try again." }, { status: 500 })
  }
}
