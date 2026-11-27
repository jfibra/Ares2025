// Teams that have no team leader in the LR records ("direct" teams). The admin assigns one of
// each team's own agents as its team leader. Safe to import in the browser.

export const DIRECT_TEAMS = ["Leuterio Direct", "Davao Eagles DIRECT", "FH Kaizen Ozamiz Team", "Team Grateful"] as const

// Teams the admin handles directly: they have no team leader for ARES. Their agents register,
// pay the admin, and only the admin confirms them. Each gets its own tab in the admin.
export const ADMIN_TEAMS = ["Team Tycoons"] as const

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

/** True when this team is handled by the admin, with no team leader. */
export const isAdminTeam = (team: string) => ADMIN_TEAMS.some((adminTeam) => isSameTeam(team, adminTeam))
