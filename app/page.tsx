import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import HomePage from "@/components/home-page"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ares2025.com"

export const metadata: Metadata = {
  title: "ARES 2025 - Asian Real Estate Summit | Bangkok, Thailand",
  description:
    "🌟 Welcome to ARES 2025! Join Asia's premier real estate summit featuring industry legends, visionaries, and game-changers. Bangkok, Thailand - July 2, 2025. Register now for the ultimate real estate experience!",
  keywords: [
    "ARES 2025",
    "Asian Real Estate Summit",
    "Bangkok",
    "Thailand",
    "Real Estate Conference",
    "Property Summit",
    "Real Estate Networking",
    "Industry Leaders",
    "Property Investment",
    "Real Estate Professionals",
    "July 2025",
  ],
  openGraph: {
    title: "🌟 ARES 2025 - Asian Real Estate Summit | Bangkok, Thailand",
    description:
      "Welcome to ARES 2025! Join Asia's premier real estate summit featuring industry legends and visionaries. Bangkok, Thailand - July 2, 2025 🚀",
    url: baseUrl,
    siteName: "ARES 2025 - Asian Real Estate Summit",
    images: [
      {
        url: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png",
        width: 1200,
        height: 630,
        alt: "ARES 2025 - Asian Real Estate Summit",
        type: "image/png",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "🌟 ARES 2025 - Asian Real Estate Summit",
    description: "Join Asia's premier real estate summit in Bangkok, Thailand! July 2, 2025 🚀",
    images: ["https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"],
    creator: "@filipinohomes",
    site: "@ARES2025",
  },
  alternates: {
    canonical: baseUrl,
  },
  other: {
    "fb:app_id": "your-facebook-app-id", // Replace with actual Facebook App ID
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
