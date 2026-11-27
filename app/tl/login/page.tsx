import type { Metadata } from "next"
import { redirect } from "next/navigation"
import PortalLogin from "@/components/portal-login"
import { HOME_OF, getSignedInRole } from "@/lib/auth"

export const metadata: Metadata = { title: "Team leader sign in", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function TeamLeaderLoginPage() {
  const role = await getSignedInRole()
  if (role) redirect(HOME_OF[role])
  return <PortalLogin variant="tl" />
}
