import { Suspense } from "react"
import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SpeakersPage from "@/components/speakers-page"

// Dynamic metadata generation for individual speakers
export async function generateMetadata({ searchParams }: { searchParams: { speaker?: string } }): Promise<Metadata> {
  const speakerSlug = searchParams.speaker

  if (speakerSlug) {
    // Speaker data mapping for metadata
    const speakerData: Record<string, { name: string; title: string; company: string; image: string }> = {
      "anthony-gerard-leuterio": {
        name: "Anthony Gerard Leuterio",
        title: "2024 International REALTOR® of the Year",
        company: "Filipino Homes",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Anthony+Leuterio.png",
      },
      "cesar-wee-jr": {
        name: "Cesar Wee Jr.",
        title: "President",
        company: "WeeComm",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Cesar+Wee+Jr..png",
      },
      "jose-joe-soberano-iii": {
        name: "Jose 'Joe' R. Soberano III",
        title: "2023 Real Estate Personality of the Year",
        company: "Cebu Landmasters",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Joe+Soberano.png",
      },
      "carson-choa": {
        name: "Carson Choa",
        title: "Chief Operating Officer",
        company: "WeeComm",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Carson+Choa.png",
      },
      "samantha-manigsaca": {
        name: "Samantha Manigsaca",
        title: "AVP for Hospitality",
        company: "AppleOne Properties",
        image:
          "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Samantha+Manigsaca.png",
      },
      "may-antonette-leuterio": {
        name: "May Antonette Leuterio",
        title: "Managing Director",
        company: "Rent.ph",
        image:
          "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/May+Antonette+Leuterio.png",
      },
      "dr-sopon-pornchokchai": {
        name: "Dr. Sopon Pornchokchai",
        title: "Real Estate Valuation Expert",
        company: "Agency for Real Estate Affairs (Thailand)",
        image:
          "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Dr.+Sopon+Pornchokchai.png",
      },
      "azela-honor": {
        name: "Azela Honor",
        title: "Team Leader, Team A",
        company: "Filipino Homes",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Azela+Honor.png",
      },
      "george-sarmago": {
        name: "George Sarmago",
        title: "Real Estate Expert",
        company: "Industry Leader",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/George+Sarmago.png",
      },
      "gilbert-monecillo": {
        name: "Gilbert Monecillo",
        title: "Real Estate Professional",
        company: "Industry Expert",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Gilbert+Monecillo.png",
      },
      "alejandro-manalac": {
        name: "Alejandro Mañalac",
        title: "Real Estate Specialist",
        company: "Market Expert",
        image:
          "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Alejandro+Ma%C3%B1alac.png",
      },
    }

    const speaker = speakerData[speakerSlug]

    if (speaker) {
      return {
        title: `${speaker.name} - ARES 2025 Speaker`,
        description: `Meet ${speaker.name}, ${speaker.title} at ${speaker.company}. Speaking at the Asian Real Estate Summit 2025 in Bangkok, Thailand.`,
        openGraph: {
          title: `${speaker.name} - ARES 2025 Speaker`,
          description: `Meet ${speaker.name}, ${speaker.title} at ${speaker.company}. Speaking at ARES 2025!`,
          images: [
            {
              url: speaker.image,
              width: 400,
              height: 600,
              alt: `${speaker.name} - ARES 2025 Speaker`,
            },
          ],
          type: "profile",
        },
        twitter: {
          card: "summary_large_image",
          title: `${speaker.name} - ARES 2025 Speaker`,
          description: `Meet ${speaker.name}, ${speaker.title} at ${speaker.company}. Speaking at ARES 2025!`,
          images: [speaker.image],
        },
      }
    }
  }

  // Default metadata for speakers page
  return {
    title: "Speakers - ARES 2025",
    description:
      "Meet the inspiring lineup of industry leaders, innovators, and visionaries speaking at the Asian Real Estate Summit 2025 in Bangkok, Thailand.",
    openGraph: {
      title: "Speakers - ARES 2025",
      description: "Meet the inspiring lineup of industry leaders, innovators, and visionaries speaking at ARES 2025.",
      images: [
        {
          url: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png",
          width: 1200,
          height: 630,
          alt: "ARES 2025 Speakers",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Speakers - ARES 2025",
      description: "Meet the inspiring lineup of industry leaders, innovators, and visionaries speaking at ARES 2025.",
      images: ["https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"],
    },
  }
}

export default function Speakers() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <SpeakersPage />
      </Suspense>
      <Footer />
    </>
  )
}
