import { DirectoryUnavailableError, lookupAgent, type DirectoryAgent } from "@/lib/agent-directory"

export type TlVerification =
  | { status: "verified"; leader: DirectoryAgent }
  | { status: "not_found" }
  | { status: "not_team_leader" }
  | { status: "unavailable" }

/** Checks the LR records: is this email a team leader there? Never trusts the browser. */
export async function verifyTeamLeader(rawEmail: string): Promise<TlVerification> {
  let record: DirectoryAgent | null
  try {
    record = await lookupAgent(rawEmail)
  } catch (error) {
    if (error instanceof DirectoryUnavailableError) {
      console.error("Team leader lookup unavailable:", error.message)
      return { status: "unavailable" }
    }
    throw error
  }
  if (!record) return { status: "not_found" }
  if (!record.is_team_leader) return { status: "not_team_leader" }
  return { status: "verified", leader: record }
}

/** What to tell someone whose email did not pass the check. */
export const TL_VERIFY_MESSAGES: Record<Exclude<TlVerification["status"], "verified">, string> = {
  not_found: "We could not find this email in our LR records. Please check the spelling, and make sure it is your LR email, not a personal one.",
  not_team_leader:
    "Our LR records do not list this email as a team leader, so we cannot register it here. If you think this is a mistake, please contact the ARES admin.",
  // The LR API answers a plain "Server Error" both when it is down and for an email it does not
  // know, so this has to cover a mistyped email as well.
  unavailable:
    "We could not confirm this email in our LR records. Please check the spelling and make sure it is your LR email. If it is correct, try again in a few minutes.",
}
