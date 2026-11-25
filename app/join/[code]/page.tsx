import type { Metadata } from "next"
import TeamLeaderRegister from "@/components/tl-register"
import { isValidTlInvite } from "@/lib/tl-invite"

export const metadata: Metadata = { title: "Team leader registration", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

/** The short team leader registration link the admin shares: /join/<code>. Same page as /tl/register. */
export default async function JoinPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).trim().toLowerCase()
  const valid = await isValidTlInvite(code).catch((error) => {
    console.error("Could not check the TL invite:", error)
    return false
  })
  return <TeamLeaderRegister invite={valid ? code : null} />
}
