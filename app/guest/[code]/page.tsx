import type { Metadata } from "next"
import GuestRegister from "@/components/guest-register"
import { isValidGuestInvite } from "@/lib/guest-invite"

export const metadata: Metadata = { title: "Guest registration - ARES 2027", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

/** The special registration link the admin gives to guests: /guest/<code>. */
export default async function GuestPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).trim().toLowerCase()
  const valid = await isValidGuestInvite(code).catch((error) => {
    console.error("Could not check the guest invite:", error)
    return false
  })
  return <GuestRegister invite={valid ? code : null} />
}
