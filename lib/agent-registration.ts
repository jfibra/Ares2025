import { DirectoryUnavailableError, lookupAgent, type DirectoryAgent } from "@/lib/agent-directory"
import { TEAM_LEADER_COLUMNS, type TeamLeader } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

const normaliseTeam = (team: string) => team.trim().toLowerCase().replace(/\s+/g, " ")

/** The registered team leader for an agent: matched by the leader's email, else by team name. */
async function findTeamLeaderFor(agent: DirectoryAgent): Promise<TeamLeader | null> {
  const { data, error } = await createSupabaseAdmin().from("team_leaders").select(TEAM_LEADER_COLUMNS)
  if (error) throw error
  const leaders = (data ?? []) as TeamLeader[]
  if (agent.team_leader_email) {
    const byEmail = leaders.find((leader) => leader.email === agent.team_leader_email)
    if (byEmail) return byEmail
  }
  const team = normaliseTeam(agent.team)
  const sameTeam = leaders.filter((leader) => normaliseTeam(leader.team) === team)
  // Only trust a team-name match when it points at exactly one leader.
  return sameTeam.length === 1 ? sameTeam[0] : null
}

export type AgentResolution =
  | { status: "found"; agent: DirectoryAgent; teamLeader: TeamLeader }
  | { status: "not_found" }
  | { status: "tl_not_registered"; team: string; teamLeaderName: string }
  | { status: "already_registered"; confirmed: boolean; teamLeaderName: string | null; teamLeaderId: number | null; attendeeCount: number; receiptAt: string | null }
  | { status: "unavailable" }

/** Everything the server needs to know before an agent may register. Never trusts the browser. */
export async function resolveAgent(rawEmail: string): Promise<AgentResolution> {
  const email = rawEmail.trim().toLowerCase()

  const { data: existing, error } = await createSupabaseAdmin()
    .from("registrations")
    .select("confirmed_by_tl,team_leader_name,team_leader_id,attendee_count,agent_receipt_at")
    .eq("email", email)
    .maybeSingle()
  if (error) throw error
  if (existing) {
    return {
      status: "already_registered",
      confirmed: existing.confirmed_by_tl,
      teamLeaderName: existing.team_leader_name,
      teamLeaderId: existing.team_leader_id,
      attendeeCount: existing.attendee_count ?? 1,
      receiptAt: existing.agent_receipt_at ?? null,
    }
  }

  let agent: DirectoryAgent | null
  try {
    agent = await lookupAgent(email)
  } catch (lookupError) {
    if (lookupError instanceof DirectoryUnavailableError) {
      console.error("Agent lookup unavailable:", lookupError.message)
      return { status: "unavailable" }
    }
    throw lookupError
  }
  if (!agent) return { status: "not_found" }

  const teamLeader = await findTeamLeaderFor(agent)
  if (!teamLeader) {
    return { status: "tl_not_registered", team: agent.team, teamLeaderName: agent.team_leader_name }
  }
  return { status: "found", agent, teamLeader }
}

/** 09171234567 -> 0917•••4567, so the lookup page does not hand out full numbers. */
export function maskContactNumber(value: string) {
  const digits = value.replace(/\s+/g, "")
  if (digits.length <= 6) return digits
  return `${digits.slice(0, 4)}${"•".repeat(digits.length - 8 > 0 ? digits.length - 8 : 2)}${digits.slice(-4)}`
}
