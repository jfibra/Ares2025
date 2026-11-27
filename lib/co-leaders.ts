import { TEAM_LEADER_COLUMNS, type TeamLeader } from "@/lib/registrations"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { normaliseTeam } from "@/lib/tl-assignments"

// Server only. A team with more than one team leader shares one dashboard.
//
// Nothing has to be set up: as soon as two or more team leaders of the same team (the team name
// in the LR records) have registered, they share. Each signs in with their own account, but they
// all work on the same dashboard: the one that belongs to whichever of them registered first
// (the "dashboard leader"). Agents, payment details, the Facebook link and the contact number
// shown to agents hang off that one.

/** The registered leaders of this team, the first to register first. */
const leadersOfTeam = (team: string, leaders: TeamLeader[]) => {
  const key = normaliseTeam(team)
  return leaders.filter((leader) => normaliseTeam(leader.team) === key).sort((a, b) => a.id - b.id)
}

/** The dashboard leader of a team that has several registered leaders; null for any other team. */
export function sharedLeaderForTeam(team: string, leaders: TeamLeader[]): TeamLeader | null {
  const sameTeam = leadersOfTeam(team, leaders)
  return sameTeam.length > 1 ? sameTeam[0] : null
}

/** The registered leaders who share this leader's dashboard (including them), the dashboard leader first. */
export async function dashboardMembers(leader: TeamLeader): Promise<TeamLeader[]> {
  const { data, error } = await createSupabaseAdmin().from("team_leaders").select(TEAM_LEADER_COLUMNS)
  if (error) throw error
  const sameTeam = leadersOfTeam(leader.team, (data ?? []) as TeamLeader[])
  return sameTeam.length ? sameTeam : [leader]
}

/** The leader whose dashboard this leader works on: themselves, unless their team has several leaders. */
export async function dashboardLeaderOf(leader: TeamLeader): Promise<TeamLeader> {
  return (await dashboardMembers(leader))[0]
}
