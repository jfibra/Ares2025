import type { Metadata } from "next"
import GuestRegister from "@/components/guest-register"
import { resolveGuestInvite } from "@/lib/guest-invite"

export const metadata: Metadata = { title: "Guest registration - ARES 2027", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

/** The special registration link for guests: /guest/<code>, the admin's or one team leader's own. */
export default async function GuestPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).trim().toLowerCase()
  const invite = await resolveGuestInvite(code).catch((error) => {
    console.error("Could not check the guest invite:", error)
    return null
  })
  // A team leader's own link says who is inviting the guest.
  return <GuestRegister invite={invite ? code : null} invitedBy={invite?.leader ? invite.leader.name : null} />
}
