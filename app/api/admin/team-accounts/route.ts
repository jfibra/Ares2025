import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { createTeamAccount, listTeamAccounts, removeTeamAccount } from "@/lib/admin-team"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** The sign-ins of the people who look after the team the admin handles. Admin only. */
export async function GET() {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  try {
    return NextResponse.json({ success: true, accounts: await listTeamAccounts() })
  } catch (error) {
    console.error("Team accounts load failed:", error)
    return fail("Could not load the accounts.", 500)
  }
}

/** An admin creates one: an email and a password the admin chooses and hands over. */
export async function POST(request: Request) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  const body = await request.json().catch(() => null)
  try {
    const result = await createTeamAccount(body?.email, body?.password, body?.team)
    if (!result.ok) return fail(result.message, result.status)
    return NextResponse.json({ success: true, accounts: await listTeamAccounts() }, { status: 201 })
  } catch (error) {
    console.error("Team account create failed:", error)
    return fail("We could not create this account. Please try again.", 500)
  }
}

/** An admin removes one (`?email=`): that person can no longer sign in. */
export async function DELETE(request: Request) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  const email = new URL(request.url).searchParams.get("email") ?? ""
  if (!email) return fail("Invalid request.")
  try {
    await removeTeamAccount(email)
    return NextResponse.json({ success: true, accounts: await listTeamAccounts() })
  } catch (error) {
    console.error("Team account delete failed:", error)
    return fail("We could not remove this account. Please try again.", 500)
  }
}
