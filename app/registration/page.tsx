import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import RegistrationPage from "@/components/registration-page"

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

export default function Registration() {
  return (
    <>
      <Navbar />
      <RegistrationPage />
      <Footer />
    </>
  )
}
