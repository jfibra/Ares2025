import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SponsorsPage from "@/components/sponsors-page"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://asianrealestatesummit.com"

export const metadata: Metadata = {
  title: "ARES 2027 Sponsors - Asian Real Estate Summit | Bangkok, Thailand",
  description:
    "Meet our prestigious sponsors and partners supporting ARES 2027. Leading real estate developers and industry partners making the Asian Real Estate Summit possible in Bangkok, Thailand.",
  keywords: [
    "ARES 2027 Sponsors",
    "Real Estate Partners",
    "Bangkok Summit Sponsors",
    "Asian Real Estate Developers",
    "Property Development Partners",
    "ARES 2027 Supporters",
    "Real Estate Industry Partners",
  ],
  openGraph: {
    title: "ARES 2027 Sponsors - Asian Real Estate Summit",
    description:
      "Meet our prestigious sponsors and partners supporting ARES 2027 in Bangkok, Thailand. Leading real estate developers and industry partners.",
    url: `${baseUrl}/sponsors`,
    siteName: "ARES 2027 - Asian Real Estate Summit",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ARES 2027 Sponsors",
        type: "image/jpeg",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARES 2027 Sponsors - Asian Real Estate Summit",
    description: "Meet our prestigious sponsors and partners supporting ARES 2027 in Bangkok, Thailand.",
    images: [`${baseUrl}/og-image.jpg`],
    creator: "@filipinohomes",
    site: "@ARES2025",
  },
  alternates: {
    canonical: `${baseUrl}/sponsors`,
  },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <SponsorsPage />
      <Footer />
    </>
  )
}
