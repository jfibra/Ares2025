import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ContactPage from "@/components/contact-page"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ares2025.com"
const pageUrl = `${baseUrl}/contact-us`

export const metadata: Metadata = {
  title: "Contact ARES 2025 - Get in Touch | Asian Real Estate Summit",
  description:
    "📞 Contact ARES 2025! Get in touch for registration, sponsorship opportunities, or any questions about the Asian Real Estate Summit in Bangkok, Thailand. We're here to help!",
  keywords: [
    "Contact ARES 2025",
    "Asian Real Estate Summit",
    "Bangkok",
    "Thailand",
    "Registration",
    "Sponsorship",
    "Real Estate Conference",
    "Contact Information",
    "Get in Touch",
    "Event Inquiries",
  ],
  openGraph: {
    title: "📞 Contact ARES 2025 - Get in Touch",
    description:
      "Contact ARES 2025 for registration, sponsorship opportunities, or any questions about Asia's premier real estate summit!",
    url: pageUrl,
    siteName: "ARES 2025 - Asian Real Estate Summit",
    images: [
      {
        url: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png",
        width: 1200,
        height: 630,
        alt: "Contact ARES 2025 - Get in Touch",
        type: "image/png",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "📞 Contact ARES 2025 - Get in Touch",
    description: "Contact us for registration, sponsorship, or any questions about ARES 2025! 🚀",
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

export default function ContactUs() {
  return (
    <>
      <Navbar />
      <ContactPage />
      <Footer />
    </>
  )
}
