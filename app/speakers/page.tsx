import { Suspense } from "react"
import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SpeakersPage from "@/components/speakers-page"

// Enhanced metadata generation for individual speakers with poster OG images
export async function generateMetadata({ searchParams }: { searchParams: { speaker?: string } }): Promise<Metadata> {
  const speakerSlug = searchParams.speaker
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ares2025.com"

  if (speakerSlug) {
    // Enhanced speaker data mapping for metadata with Hollywood-style descriptions
    const speakerData: Record<
      string,
      {
        name: string
        title: string
        company: string
        image: string
        tagline: string
        description: string
      }
    > = {
      "anthony-gerard-leuterio": {
        name: "Anthony Gerard Leuterio",
        title: "2024 International REALTOR® of the Year",
        company: "Filipino Homes",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Anthony+Leuterio.png",
        tagline: "The Visionary Who Built an Empire",
        description:
          "🌟 THE LEGEND HIMSELF - From humble beginnings to 2024 International REALTOR® of the Year, Anthony has built the Philippines' largest real estate network with 30,000+ agents. When Anthony speaks, the industry listens.",
      },
      "cesar-wee-jr": {
        name: "Cesar Wee Jr.",
        title: "President",
        company: "WeeComm",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Cesar+Wee+Jr..png",
        tagline: "The Community Builder Extraordinaire",
        description:
          "🏗️ THE COMMUNITY ARCHITECT - President of WeeComm, crafting communities that breathe with authentic Filipino spirit. Building homes that nurture dreams and create legacies.",
      },
      "jose-joe-soberano-iii": {
        name: "Jose 'Joe' R. Soberano III",
        title: "2023 Real Estate Personality of the Year",
        company: "Cebu Landmasters",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Joe+Soberano.png",
        tagline: "The Visayas Kingmaker",
        description:
          "👑 THE VISAYAS KINGMAKER - 2023 Real Estate Personality of the Year with 100+ projects across 16 cities in VisMin. The mastermind who transformed entire regions.",
      },
      "carson-choa": {
        name: "Carson Choa",
        title: "Chief Operating Officer",
        company: "WeeComm",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Carson+Choa.png",
        tagline: "The Operations Mastermind",
        description:
          "⚙️ THE OPERATIONS MASTERMIND - COO who transformed WeeComm into a national powerhouse. The strategic genius who turns vision into reality with heart and purpose.",
      },
      "samantha-manigsaca": {
        name: "Samantha Manigsaca",
        title: "AVP for Hospitality",
        company: "AppleOne Properties",
        image:
          "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Samantha+Manigsaca.png",
        tagline: "The Hospitality Innovator",
        description:
          "✨ THE HOSPITALITY INNOVATOR - AVP bringing five-star hotel service to residential living. Pioneering luxury developments where every day feels like a premium vacation.",
      },
      "may-antonette-leuterio": {
        name: "May Antonette Leuterio",
        title: "Managing Director",
        company: "Rent.ph",
        image:
          "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/May+Antonette+Leuterio.png",
        tagline: "The Rental Revolution Leader",
        description:
          "🚀 THE RENTAL REVOLUTION LEADER - Managing Director of Rent.ph, the country's premier rental platform serving thousands of OFWs and property owners with excellence.",
      },
      "dr-sopon-pornchokchai": {
        name: "Dr. Sopon Pornchokchai",
        title: "Real Estate Valuation Expert",
        company: "Agency for Real Estate Affairs (Thailand)",
        image:
          "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Dr.+Sopon+Pornchokchai.png",
        tagline: "The Valuation Virtuoso",
        description:
          "🎓 THE VALUATION VIRTUOSO - 40+ years expertise across 30+ countries. World Bank advisor who literally wrote the book on Asian property valuation.",
      },
      "azela-honor": {
        name: "Azela Honor",
        title: "Team Leader, Team A",
        company: "Filipino Homes",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Azela+Honor.png",
        tagline: "The Next-Gen Champion",
        description:
          "🌟 THE NEXT-GEN CHAMPION - Dynamic Team Leader representing the perfect fusion of traditional relationship-building with cutting-edge digital mastery.",
      },
      "george-sarmago": {
        name: "George Sarmago",
        title: "Real Estate Expert",
        company: "Industry Leader",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/George+Sarmago.png",
        tagline: "The Strategic Innovator",
        description:
          "🎯 THE STRATEGIC INNOVATOR - Master tactician whose innovative approaches have shaped the modern Philippine property landscape with decades of expertise.",
      },
      "gilbert-monecillo": {
        name: "Gilbert Monecillo",
        title: "Real Estate Professional",
        company: "Industry Expert",
        image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Gilbert+Monecillo.png",
        tagline: "The Solutions Architect",
        description:
          "🔧 THE SOLUTIONS ARCHITECT - The professional who finds paths forward when challenges seem insurmountable, turning market obstacles into opportunities.",
      },
      "alejandro-manalac": {
        name: "Alejandro Mañalac",
        title: "Real Estate Specialist",
        company: "Market Expert",
        image:
          "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Alejandro+Ma%C3%B1alac.png",
        tagline: "The Market Visionary",
        description:
          "🔮 THE MARKET VISIONARY - Market specialist with the rare gift of seeing opportunities before they become obvious, identifying emerging trends others miss.",
      },
    }

    const speaker = speakerData[speakerSlug]

    if (speaker) {
      const pageUrl = `${baseUrl}/speakers?speaker=${speakerSlug}`

      return {
        title: `${speaker.name} - ${speaker.tagline} | ARES 2025`,
        description: `${speaker.description} Speaking at the Asian Real Estate Summit 2025 in Bangkok, Thailand. Don't miss this legendary speaker!`,
        keywords: [
          speaker.name,
          "ARES 2025",
          "Asian Real Estate Summit",
          "Bangkok",
          "Thailand",
          "Real Estate Speaker",
          speaker.company,
          speaker.title,
          "Real Estate Conference",
          "Property Expert",
        ],
        openGraph: {
          title: `🌟 ${speaker.name} - ${speaker.tagline}`,
          description: `${speaker.description} Join us at ARES 2025 in Bangkok! 🇹🇭`,
          url: pageUrl,
          siteName: "ARES 2025 - Asian Real Estate Summit",
          images: [
            {
              url: speaker.image,
              width: 400,
              height: 600,
              alt: `${speaker.name} - ARES 2025 Featured Speaker`,
              type: "image/png",
            },
          ],
          type: "profile",
          locale: "en_US",
        },
        twitter: {
          card: "summary_large_image",
          title: `🌟 ${speaker.name} - ${speaker.tagline}`,
          description: `${speaker.description} Speaking at ARES 2025! 🚀`,
          images: [speaker.image],
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
    }
  }

  // Enhanced default metadata for speakers page
  const pageUrl = `${baseUrl}/speakers`

  return {
    title: "Meet the Legends - ARES 2025 Speakers | Asian Real Estate Summit",
    description:
      "🎬 The most epic lineup in real estate history! Meet the industry titans, visionaries, and game-changers speaking at ARES 2025 in Bangkok, Thailand. This isn't just a conference—it's a masterclass in excellence!",
    keywords: [
      "ARES 2025",
      "Asian Real Estate Summit",
      "Bangkok",
      "Thailand",
      "Real Estate Speakers",
      "Property Experts",
      "Real Estate Conference",
      "Industry Leaders",
      "Real Estate Summit",
      "Property Conference",
    ],
    openGraph: {
      title: "Meet the Legends - ARES 2025 Speakers",
      description:
        "🎬 The most epic lineup in real estate history! Industry titans, visionaries, and game-changers at ARES 2025.",
      url: pageUrl,
      siteName: "ARES 2025 - Asian Real Estate Summit",
      images: [
        {
          url: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png",
          width: 1200,
          height: 630,
          alt: "ARES 2025 - Meet the Legends",
          type: "image/png",
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Meet the Legends - ARES 2025 Speakers",
      description: "🎬 The most epic lineup in real estate history! Join us in Bangkok for ARES 2025! 🚀",
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
}

// Loading component for better UX
function SpeakersLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black/90 via-purple-900/85 to-black/90 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd700]/30 to-[#e22837]/30 rounded-2xl blur-2xl animate-pulse" />
          <img
            src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
            alt="ARES 2025"
            className="relative max-w-xs mx-auto h-auto filter drop-shadow-2xl"
          />
        </div>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffd700] mx-auto mb-4"></div>
          <p className="text-[#ffd700] font-bold text-lg animate-pulse">Loading the Legends...</p>
        </div>
      </div>
    </div>
  )
}

export default function Speakers() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<SpeakersLoading />}>
        <SpeakersPage />
      </Suspense>
      <Footer />
    </>
  )
}
