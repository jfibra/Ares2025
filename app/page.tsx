import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import HomePage from "@/components/home-page"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://asianrealestatesummit.com"

export const metadata: Metadata = {
  title: "ARES 2027 - Asian Real Estate Summit | Bangkok, Thailand",
  description:
    "Welcome to ARES 2027! Join Asia's premier real estate summit featuring industry legends, visionaries, and game-changers. Bangkok, Thailand - July 13, 2027. Register now for the ultimate real estate experience!",
  keywords: [
    "ARES 2027",
    "Asian Real Estate Summit",
    "Bangkok",
    "Thailand",
    "Real Estate Conference",
    "Property Summit",
    "Real Estate Networking",
    "Industry Leaders",
    "Property Investment",
    "Real Estate Professionals",
    "July 2027",
  ],
  openGraph: {
    title: "ARES 2027 - Asian Real Estate Summit | Bangkok, Thailand",
    description:
      "Welcome to ARES 2027! Join Asia's premier real estate summit featuring industry legends and visionaries. Bangkok, Thailand - July 13, 2027",
    url: baseUrl,
    siteName: "ARES 2027 - Asian Real Estate Summit",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ARES 2027 - Asian Real Estate Summit",
        type: "image/jpeg",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARES 2027 - Asian Real Estate Summit",
    description: "Join Asia's premier real estate summit in Bangkok, Thailand! July 13, 2027",
    images: [`${baseUrl}/og-image.jpg`],
    creator: "@filipinohomes",
    site: "@ARES2025",
  },
  alternates: {
    canonical: baseUrl,
  },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <HomePage />
      <Footer />
    </>
  )
}
