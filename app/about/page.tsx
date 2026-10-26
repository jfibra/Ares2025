import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AboutPage from "@/components/about-page"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://asianrealestatesummit.com"
const pageUrl = `${baseUrl}/about`

export const metadata: Metadata = {
  title: "About Us - ARES 2027 Asian Real Estate Summit",
  description:
    "ARES 2027 is a global gathering of real estate leaders, brokers, entrepreneurs, and innovators in Bangkok, Thailand on July 13, 2027. Think global. Innovate beyond. Grow together.",
  keywords: [
    "About Us",
    "ARES 2027",
    "Asian Real Estate Summit",
    "Mission",
    "Vision",
    "Bangkok",
    "Thailand",
    "Real Estate Conference",
    "Industry Leaders",
    "Property Summit",
    "Real Estate Networking",
  ],
  openGraph: {
    title: "About Us - ARES 2027 Asian Real Estate Summit",
    description:
      "ARES 2027 is a global gathering of real estate leaders, brokers, entrepreneurs, and innovators in Bangkok, Thailand.",
    url: pageUrl,
    siteName: "ARES 2027 - Asian Real Estate Summit",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "About Us - ARES 2027 Asian Real Estate Summit",
        type: "image/jpeg",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - ARES 2027 Asian Real Estate Summit",
    description: "Think global. Innovate beyond. Grow together. Bangkok, July 13, 2027.",
    images: [`${baseUrl}/og-image.jpg`],
    creator: "@filipinohomes",
    site: "@ARES2025",
  },
  alternates: {
    canonical: pageUrl,
  },
}

export default function About() {
  return (
    <>
      <Navbar />
      <AboutPage />
      <Footer />
    </>
  )
}
