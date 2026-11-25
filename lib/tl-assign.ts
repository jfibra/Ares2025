import { DirectoryUnavailableError, lookupAgent } from "@/lib/agent-directory"
import { isSameTeam } from "@/lib/direct-teams"
import { TEAM_LEADER_COLUMNS, type TeamLeader } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { getAssignmentForTeam, normaliseTeam } from "@/lib/tl-assignments"

// Server only. Checks whether an agent can be made the leader of their own team by the admin.

export type TlCandidate = {
  name: string
  email: string
  team: string
  /** Who the LR records name as this team's leader; empty when they name nobody. */
  lr_team_leader: string
}

export type CandidateCheck =
  | { found: false; status: number; message: string }
  /** `blocked` says why this agent cannot be assigned; null when they can. */
  | { found: true; agent: TlCandidate; blocked: string | null }

/** `forTeam` is the team the admin is choosing a leader for: the agent must belong to it. */
export async function checkCandidate(email: string, forTeam?: string): Promise<CandidateCheck> {
  let record
  try {
    record = await lookupAgent(email)
  } catch (error) {
    if (!(error instanceof DirectoryUnavailableError)) throw error
    console.error("TL candidate lookup unavailable:", error.message)
    // The LR API answers a plain "Server Error" both when it is down and for an email it does not know.
    return {
      found: false,
      status: 503,
      message: "We could not find this email in the LR records. Check the spelling and that it is the agent's LR email. If it is correct, try again in a few minutes.",
    }
  }
  if (!record) {
    return { found: false, status: 404, message: "This email is not in the LR records. Check the spelling, and use the agent's LR email, not a personal one." }
  }

  const agent: TlCandidate = { name: record.name, email: record.email, team: record.team, lr_team_leader: record.team_leader_name }
  const blocked = (reason: string): CandidateCheck => ({ found: true, agent, blocked: reason })

  if (forTeam && !isSameTeam(record.team, forTeam)) {
    return blocked(`${record.name} belongs to ${record.team}, not ${forTeam}. Choose an agent from ${forTeam}.`)
  }
  if (record.is_team_leader) {
    return blocked(`${record.name} is already the team leader of ${record.team} in the LR records, so there is nothing to assign. Send them the team leader registration link.`)
  }

  // One team leader per team.
  const assigned = await getAssignmentForTeam(record.team)
  if (assigned) {
    return blocked(
      assigned.email === record.email
        ? `${record.name} is already assigned as the team leader of ${record.team}.`
        : `${record.team} already has a team leader assigned: ${assigned.name}. Remove them below first if you want to change it.`,
    )
  }
  const { data, error } = await createSupabaseAdmin().from("team_leaders").select(TEAM_LEADER_COLUMNS)
  if (error) throw error
  const teamKey = normaliseTeam(record.team)
  const registered = ((data ?? []) as TeamLeader[]).find((leader) => normaliseTeam(leader.team) === teamKey)
  if (registered) {
    return blocked(`${record.team} already has a registered team leader: ${registered.name}. A team can only have one.`)
  }
  return { found: true, agent, blocked: null }
}
