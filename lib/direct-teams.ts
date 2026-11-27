// Teams that have no team leader in the LR records ("direct" teams). The admin assigns one of
// each team's own agents as its team leader. Safe to import in the browser.

export const DIRECT_TEAMS = ["Leuterio Direct", "Davao Eagles DIRECT", "FH Kaizen Ozamiz Team", "Team Tycoons", "Team Grateful"] as const

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
