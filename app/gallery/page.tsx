import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import GalleryPage from "@/components/gallery-page"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ares2025.com"
const pageUrl = `${baseUrl}/gallery`

export const metadata: Metadata = {
  title: "ARES Gallery - Event Photos & Highlights | Asian Real Estate Summit",
  description:
    "📸 Explore the ARES 2025 Gallery! View stunning photos and highlights from previous Asian Real Estate Summit events. Relive the memorable moments and see what awaits you in Bangkok, Thailand.",
  keywords: [
    "ARES Gallery",
    "Event Photos",
    "Asian Real Estate Summit",
    "Bangkok",
    "Thailand",
    "Real Estate Events",
    "Conference Photos",
    "Industry Networking",
    "Property Summit",
    "Event Highlights",
  ],
  openGraph: {
    title: "📸 ARES Gallery - Event Photos & Highlights",
    description:
      "Explore stunning photos and highlights from ARES events! See what awaits you at Asia's premier real estate summit.",
    url: pageUrl,
    siteName: "ARES 2025 - Asian Real Estate Summit",
    images: [
      {
        url: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png",
        width: 1200,
        height: 630,
        alt: "ARES Gallery - Event Photos & Highlights",
        type: "image/png",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "📸 ARES Gallery - Event Photos & Highlights",
    description: "Explore stunning photos from Asia's premier real estate summit! 🚀",
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

export default function Gallery() {
  return (
    <>
      <Navbar />
      <GalleryPage />
      <Footer />
    </>
  )
}
