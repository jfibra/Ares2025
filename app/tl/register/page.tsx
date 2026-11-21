import type { Metadata } from "next"
import TeamLeaderRegister from "@/components/tl-register"
import { isValidTlInvite } from "@/lib/tl-invite"

export const metadata: Metadata = { title: "Team leader registration", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function TeamLeaderRegisterPage({ searchParams }: { searchParams: { invite?: string | string[] } }) {
  const invite = typeof searchParams.invite === "string" ? searchParams.invite : ""
  const valid = await isValidTlInvite(invite).catch((error) => {
    console.error("Could not check the TL invite:", error)
    return false
  })
  return <TeamLeaderRegister invite={valid ? invite : null} />
}
