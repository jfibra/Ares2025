// Teams that have no team leader in the LR records ("direct" teams). The admin assigns one of
// each team's own agents as its team leader. Safe to import in the browser.

export const DIRECT_TEAMS = ["Davao Eagles DIRECT", "FH Kaizen Ozamiz Team", "Team Grateful", "Luzon Leaders", "Starshooters"] as const

// Teams the admin handles directly: they have no team leader for ARES. Their agents register and
// pay into the admin's accounts. The admin gives each team an account (for a secretary) that
// manages its agents' registrations the way a team leader would.
export const ADMIN_TEAMS = ["Team Tycoons", "Leuterio Direct", "FH Luzon Ledesma"] as const
export type AdminTeam = (typeof ADMIN_TEAMS)[number]

/** "Team Tycoons", "tycoons" and "TEAM  TYCOONS" all become "tycoons". */
const teamKey = (team: string) =>
  team
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^team /, "")
    .replace(/ team$/, "")

/** True when a team name from the LR records is the team on a card, allowing for small differences in how it is written. */
export const isSameTeam = (lrTeam: string, cardTeam: string) => teamKey(lrTeam) !== "" && teamKey(lrTeam) === teamKey(cardTeam)

/** Which admin-handled team a team name from the LR records is, or null when it is not one. */
export const adminTeamOf = (team: string): AdminTeam | null => ADMIN_TEAMS.find((adminTeam) => isSameTeam(team, adminTeam)) ?? null

/** True when this team is handled by the admin, with no team leader. */
export const isAdminTeam = (team: string) => adminTeamOf(team) !== null
