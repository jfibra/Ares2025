import { createSupabaseAdmin } from "@/lib/supabase-server"

// Server only. A team with no team leader in the LR records gets one chosen by the admin:
// one of its own agents, who then signs up through the team leader link. One per team.

export type TlAssignment = { id: number; name: string; email: string; team: string; assigned_at: string }
export const TL_ASSIGNMENT_COLUMNS = "id,name,email,team,assigned_at"
const TABLE = "team_leader_assignments"

/** "LR  Direct " and "lr direct" are the same team. */
export const normaliseTeam = (team: string) => team.trim().toLowerCase().replace(/\s+/g, " ")

/**
 * The lookups below sit in the middle of registration, so a problem reading the table
 * (it is new, and may not exist yet) is logged and treated as "nobody assigned".
 */
async function findOne(column: "email" | "team_key", value: string): Promise<TlAssignment | null> {
  const { data, error } = await createSupabaseAdmin().from(TABLE).select(TL_ASSIGNMENT_COLUMNS).eq(column, value).maybeSingle()
  if (error) {
    console.error("Team leader assignment lookup failed:", error)
    return null
  }
  return (data as TlAssignment | null) ?? null
}

/** The agent the admin chose to lead this team, if any. */
export const getAssignmentForTeam = (team: string) => findOne("team_key", normaliseTeam(team))

/** True when the admin chose this agent to lead this team. */
export async function isAssignedTeamLeader(email: string, team: string): Promise<boolean> {
  const assignment = await findOne("email", email.trim().toLowerCase())
  return Boolean(assignment && normaliseTeam(assignment.team) === normaliseTeam(team))
}

export async function listAssignments(): Promise<TlAssignment[]> {
  const { data, error } = await createSupabaseAdmin().from(TABLE).select(TL_ASSIGNMENT_COLUMNS).order("assigned_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as TlAssignment[]
}
