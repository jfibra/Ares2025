import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { MAX_ATTENDEES_PER_REQUEST, addPastAttendees, listPastAttendees, parseEmails, removePastAttendees } from "@/lib/past-attendees"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status })

/** Admin: the LR emails of everyone who attended ARES 2025. They register first. */
export async function GET() {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  try {
    return NextResponse.json({ success: true, emails: await listPastAttendees() })
  } catch (error) {
    console.error("Past attendee list failed:", error)
    return fail("Could not load the ARES 2025 attendee list.", 500)
  }
}

/** Admin: add the pasted emails to the list, or take them off it. */
export async function POST(request: Request) {
  if (!(await getAdmin())) return fail("Not signed in.", 401)
  const body = await request.json().catch(() => null)
  const action = body?.action === "remove" ? "remove" : body?.action === "add" ? "add" : null
  if (!action || typeof body?.emails !== "string") return fail("Invalid request.")
  if (body.emails.length > 1_000_000) return fail("That is too much text at once. Please paste the list in smaller parts.")

  const emails = parseEmails(body.emails)
  if (!emails.length) return fail("We could not find any email address in what you pasted.")
  if (emails.length > MAX_ATTENDEES_PER_REQUEST) return fail(`Please paste at most ${MAX_ATTENDEES_PER_REQUEST.toLocaleString()} emails at a time.`)

  try {
    const before = new Set(await listPastAttendees())
    if (action === "add") await addPastAttendees(emails)
    else await removePastAttendees(emails)
    const after = await listPastAttendees()
    const onListBefore = emails.filter((email) => before.has(email)).length
    return NextResponse.json({
      success: true,
      emails: after,
      // How many of the pasted emails actually changed the list.
      changed: action === "add" ? emails.length - onListBefore : onListBefore,
      found: emails.length,
    })
  } catch (error) {
    console.error("Past attendee update failed:", error)
    return fail("Could not update the ARES 2025 attendee list.", 500)
  }
}
