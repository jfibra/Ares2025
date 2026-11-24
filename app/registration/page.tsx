import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import RegistrationGate from "@/components/registration-gate"
import { getSlotStatus } from "@/lib/payments"

// Rendered per request so the countdown starts from the real current time.
export const dynamic = "force-dynamic"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://asianrealestatesummit.com"
const pageUrl = `${baseUrl}/registration`

export const metadata: Metadata = {
  title: "Registration - ARES 2027",
  description: "Register and reserve your tickets for ARES 2027, the Asian Real Estate Summit.",
  openGraph: {
    title: "Registration - ARES 2027",
    description: "Register and reserve your tickets for ARES 2027, the Asian Real Estate Summit.",
    url: pageUrl,
    siteName: "ARES 2027 - Asian Real Estate Summit",
    images: [{ url: `${baseUrl}/og-image.jpg`, width: 1200, height: 630, alt: "ARES 2027 Registration" }],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: pageUrl,
  },
}

export default async function Registration() {
  // Shown to visitors so they know slots are limited; the page still works if this cannot load.
  const slots = await getSlotStatus().catch((error) => {
    console.error("Registration page could not load the slots:", error)
    return null
  })
  return (
    <>
      <Navbar />
      <RegistrationGate serverNow={Date.now()} slots={slots} />
      <Footer />
    </>
  )
}
