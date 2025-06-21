import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CountdownContest from "@/components/countdown-contest"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ares2025.com"
const pageUrl = `${baseUrl}/ares-2025-countdown-contest`

export const metadata: Metadata = {
  title: "ARES 2025 Countdown Contest - Share Your Excitement & Win Prizes!",
  description:
    "🎉 Join the ARES 2025 Countdown Contest! Share your excitement for the Asian Real Estate Summit and win amazing prizes. Contest entry form available now - don't miss out!",
  keywords: [
    "ARES 2025",
    "Countdown Contest",
    "Asian Real Estate Summit",
    "Bangkok",
    "Thailand",
    "Contest",
    "Prizes",
    "Real Estate Event",
    "Social Media Contest",
    "Win Prizes",
  ],
  openGraph: {
    title: "🎉 ARES 2025 Countdown Contest - Win Amazing Prizes!",
    description:
      "Join the ARES 2025 Countdown Contest! Share your excitement for the Asian Real Estate Summit and win amazing prizes. Enter now! 🏆",
    url: pageUrl,
    siteName: "ARES 2025 - Asian Real Estate Summit",
    images: [
      {
        url: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/EVENT+COUNTDOWN.png",
        width: 1200,
        height: 630,
        alt: "ARES 2025 Countdown Contest - Win Amazing Prizes",
        type: "image/png",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "🎉 ARES 2025 Countdown Contest - Win Amazing Prizes!",
    description: "Join the countdown contest and win amazing prizes! Share your excitement for ARES 2025! 🏆",
    images: ["https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/EVENT+COUNTDOWN.png"],
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

export default function CountdownContestPage() {
  return (
    <>
      <Navbar />
      <CountdownContest />
      <Footer />
    </>
  )
}
