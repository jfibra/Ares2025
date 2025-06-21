import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AboutPage from "@/components/about-page"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ares2025.com"
const pageUrl = `${baseUrl}/about`

export const metadata: Metadata = {
  title: "About ARES 2025 - Asian Real Estate Summit Mission & Vision",
  description:
    "🌟 Discover the mission behind ARES 2025! Learn about Asia's premier real estate summit, our vision for the industry, and why Bangkok, Thailand is the perfect destination for real estate excellence.",
  keywords: [
    "About ARES 2025",
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
    title: "About ARES 2025 - Asian Real Estate Summit Mission & Vision",
    description:
      "🌟 Discover the mission behind ARES 2025! Learn about Asia's premier real estate summit and our vision for the industry.",
    url: pageUrl,
    siteName: "ARES 2025 - Asian Real Estate Summit",
    images: [
      {
        url: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png",
        width: 1200,
        height: 630,
        alt: "About ARES 2025 - Asian Real Estate Summit",
        type: "image/png",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About ARES 2025 - Asian Real Estate Summit",
    description: "🌟 Discover the mission behind Asia's premier real estate summit! 🚀",
    images: ["https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"],
    creator: "@filipinohomes",
    site: "@ARES2025",
  },
  alternates: {
    canonical: pageUrl,
  },
  other: {
    "fb:app_id": "your-facebook-app-id", // Replace with actual Facebook App ID
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
