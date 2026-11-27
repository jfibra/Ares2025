import type { Metadata } from "next"
import { redirect } from "next/navigation"
import TeamPortal from "@/components/team-portal"
import { HOME_OF, getSignedInRole, getTeamAccount } from "@/lib/auth"
import { loadTeamPortal } from "@/lib/team-portal"

export const metadata: Metadata = { title: "My team - Registrations", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function TeamPortalPage() {
  const account = await getTeamAccount()
  if (!account) {
    // Someone signed in to another portal lands on their own page instead.
    const role = await getSignedInRole()
    redirect(role ? HOME_OF[role] : "/admin/login")
  }
  const data = await loadTeamPortal(account.team).catch((error) => {
    console.error("Team portal page could not load:", error)
    return null
  })
  return <TeamPortal teamName={account.team} userLabel={account.email} initial={data} />
}
