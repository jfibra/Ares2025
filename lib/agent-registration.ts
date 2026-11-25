import { DirectoryUnavailableError, lookupAgent, type DirectoryAgent } from "@/lib/agent-directory"
import { isPastAttendee } from "@/lib/past-attendees"
import { generalRegistrationOpensAtMs } from "@/lib/registration-opening"
import { TEAM_LEADER_COLUMNS, type TeamLeader } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getAssignmentForTeam, normaliseTeam, type TlAssignment } from "@/lib/tl-assignments"

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

/**
 * The registered team leader for an agent: the one the admin chose for the team (if they have
 * registered), else matched by the leader's email in the LR records, else by team name.
 */
async function findTeamLeaderFor(agent: DirectoryAgent, assigned: TlAssignment | null): Promise<TeamLeader | null> {
  const { data, error } = await createSupabaseAdmin().from("team_leaders").select(TEAM_LEADER_COLUMNS)
  if (error) throw error
  const leaders = (data ?? []) as TeamLeader[]
  if (assigned) {
    const chosen = leaders.find((leader) => leader.email === assigned.email)
    if (chosen) return chosen
  }
  if (agent.team_leader_email) {
    const byEmail = leaders.find((leader) => leader.email === agent.team_leader_email)
    if (byEmail) return byEmail
  }
  const team = normaliseTeam(agent.team)
  const sameTeam = leaders.filter((leader) => normaliseTeam(leader.team) === team)
  // Only trust a team-name match when it points at exactly one leader.
  return sameTeam.length === 1 ? sameTeam[0] : null
}

/** True when this agent's team leader told us they are not joining: matched by email, else by team name. */
async function teamLeaderDeclined(agent: DirectoryAgent): Promise<boolean> {
  const { data, error } = await createSupabaseAdmin().from("team_leader_declines").select("email,team")
  if (error) throw error
  const declines = (data ?? []) as { email: string; team: string }[]
  if (agent.team_leader_email && declines.some((decline) => decline.email === agent.team_leader_email)) return true
  const team = normaliseTeam(agent.team)
  return declines.some((decline) => normaliseTeam(decline.team) === team)
}

export type AgentResolution =
  /**
   * `teamLeader` is null when the agent's team leader said they are not joining: the agent can
   * still register, and the admin looks after them (takes the payment and confirms it).
   * `pastAttendee`: they attended ARES 2025, so they are welcomed back.
   */
  | { status: "found"; agent: DirectoryAgent; teamLeader: TeamLeader | null; pastAttendee: boolean }
  | { status: "not_found" }
  /** Pre-registration is on and this agent did not attend ARES 2025: they wait for general registration. */
  | { status: "general_only" }
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

  // Until general registration opens, only people who attended ARES 2025 may register.
  const pastAttendee = await isPastAttendee(agent.email)
  if (!pastAttendee && Date.now() < generalRegistrationOpensAtMs) return { status: "general_only" }

  const assigned = await getAssignmentForTeam(agent.team)
  const teamLeader = await findTeamLeaderFor(agent, assigned)
  if (!teamLeader) {
    // The admin's choice for the team is who the agent should be waiting for (or asking).
    const teamLeaderName = assigned?.name || agent.team_leader_name
    // A team leader who is not joining does not hold their agents back: the admin manages them instead.
    if (await teamLeaderDeclined(agent)) return { status: "found", agent, teamLeader: null, pastAttendee }
    return { status: "tl_not_registered", team: agent.team, teamLeaderName }
  }
  return { status: "found", agent, teamLeader, pastAttendee }
}

/** 09171234567 -> 0917•••4567, so the lookup page does not hand out full numbers. */
export function maskContactNumber(value: string) {
  const digits = value.replace(/\s+/g, "")
  if (digits.length <= 6) return digits
  return `${digits.slice(0, 4)}${"•".repeat(digits.length - 8 > 0 ? digits.length - 8 : 2)}${digits.slice(-4)}`
}
