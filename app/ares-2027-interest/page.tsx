import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Ares2027Form from "@/components/ares-2027-form"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://asianrealestatesummit.com"
const pageUrl = `${baseUrl}/ares-2027-interest`

export const metadata: Metadata = {
  title: "ARES 2027 Interest Form - Join the Future of Asian Real Estate",
  description:
    "Be part of ARES 2027! Register your interest for the next Asian Real Estate Summit and be the first to know about this groundbreaking event. Secure your spot in the future!",
  keywords: [
    "ARES 2027",
    "Asian Real Estate Summit",
    "Future Event",
    "Real Estate Conference",
    "Interest Form",
    "Early Registration",
    "Real Estate Investment",
    "Property Development",
    "Asia Pacific",
    "Networking Event",
  ],
  openGraph: {
    title: "ARES 2027 - Join the Future of Asian Real Estate",
    description:
      "Register your interest for ARES 2027 and be part of the next revolutionary Asian Real Estate Summit. The future starts here!",
    url: pageUrl,
    siteName: "ARES 2027 - Asian Real Estate Summit",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ARES 2027 - Future of Asian Real Estate",
        type: "image/jpeg",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARES 2027 - Join the Future of Asian Real Estate",
    description: "Register your interest for ARES 2027! Be part of the next revolutionary summit!",
    images: [`${baseUrl}/og-image.jpg`],
    creator: "@filipinohomes",
    site: "@ARES2025",
  },
  alternates: {
    canonical: pageUrl,
  },
}

export default function Ares2027InterestPage() {
  return (
    <>
      <Navbar />
      <Ares2027Form />
      <Footer />
    </>
  )
}
