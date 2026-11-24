// Looks an agent up in the company's other database (the Leuterio Realty agent API).
//
// LR_API in the environment is the address of that API, for example
//   https://leuteriorealty.com/api/public/agent
// The agent's email is added to the end of it. A sample email left on the end is ignored.

export type DirectoryAgent = {
  name: string
  email: string
  contact_number: string
  team: string
  team_leader_name: string
  /** Best way to match the agent to a registered team leader. May be missing. */
  team_leader_email: string | null
  /** True when the record names this very person as the leader of their team. */
  is_team_leader: boolean
}

export class DirectoryUnavailableError extends Error {
  constructor(message = "The agent directory is not available") {
    super(message)
    this.name = "DirectoryUnavailableError"
  }
}

const str = (value: unknown) => (typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "")
const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

/** Maps one agent record from the API to our shape. */
function fromApi(record: Record<string, unknown>, email: string): DirectoryAgent | null {
  const team = obj(record.team)
  const leader = obj(obj(team.team_leader).tl_info)
  const name = str(record.name) || [str(record.first_name), str(record.last_name)].filter(Boolean).join(" ")
  const teamName = str(team.teamname)
  if (!name || !teamName) return null
  const ownEmail = (str(record.email) || email).toLowerCase()
  const leaderEmail = str(leader.email).toLowerCase() || null
  // A team leader's own record lists them as their team's leader: same email, or the same record id.
  const sameId = str(record.id) !== "" && str(record.id) === str(leader.id)
  return {
    name,
    email: ownEmail,
    contact_number: str(record.mobile),
    team: teamName,
    team_leader_name: str(leader.completename),
    team_leader_email: leaderEmail,
    is_team_leader: leaderEmail === ownEmail || sameId,
  }
}

/** LR_API without a trailing slash or a sample email on the end. */
function apiBase(): string | null {
  const raw = process.env.LR_API?.trim()
  if (!raw) return null
  const url = new URL(raw)
  const segments = url.pathname.split("/").filter(Boolean)
  if (segments.length && decodeURIComponent(segments[segments.length - 1]).includes("@")) segments.pop()
  url.pathname = `/${segments.join("/")}`
  url.search = ""
  return url.toString().replace(/\/$/, "")
}

export async function lookupAgent(email: string): Promise<DirectoryAgent | null> {
  const wanted = email.trim().toLowerCase()
  const base = apiBase()
  if (!base) throw new DirectoryUnavailableError("LR_API is not set")

  let response: Response
  try {
    response = await fetch(`${base}/${encodeURIComponent(wanted)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })
  } catch (error) {
    throw new DirectoryUnavailableError(`Agent API request failed: ${String(error)}`)
  }

  const body = obj(await response.json().catch(() => null))
  if (response.status === 404) return null
  if (!response.ok) {
    // For an email it does not know, the API currently answers 500 with a
    // "read property ... on null" error instead of 404. Treat only that as "not found".
    if (response.status === 500 && /on null/i.test(str(body.message))) return null
    throw new DirectoryUnavailableError(`Agent API answered ${response.status}`)
  }

  const record = obj(body.data)
  // Guard against the API handing back someone other than the person asked for.
  if (str(record.email).toLowerCase() !== wanted) return null
  return fromApi(record, wanted)
}
