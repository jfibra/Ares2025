"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Crown, ExternalLink, Share2, Sparkles, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Speaker {
  id: number
  name: string
  title: string
  company: string
  image: string
  description: string
  slug: string
  tagline: string
  achievements: string[]
  expertise: string[]
}

// Speaker data array
const speakerPosters: Speaker[] = [
  {
    id: 1,
    name: "Anthony Gerard Leuterio",
    title: "2024 International REALTOR® of the Year",
    company: "Filipino Homes",
    image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Anthony+Leuterio.png",
    slug: "anthony-gerard-leuterio",
    tagline: "The Visionary Who Built an Empire",
    achievements: ["2024 International REALTOR® of the Year", "30,000+ Agents Nationwide", "Industry Pioneer"],
    expertise: ["Real Estate Leadership", "Network Building", "Market Innovation"],
    description:
      "🌟 THE LEGEND HIMSELF 🌟\n\nThere's a reason the whole world is watching Filipino Homes.\n\nIt all started with one man—Anthony Leuterio. 🙌\n\nHe's not just our founder—he's also the 2024 International REALTOR® of the Year, recognized by the National Association of REALTORS® in the USA.\n\nFrom starting in sales to building the country's biggest real estate network (with over 30,000 agents nationwide!), he has changed how Filipinos buy, sell, and invest in property.\n\nAt ARES 2025, we're proud to have him lead the charge. He's proof that when you build with vision and heart, anything is possible.\n\n👀 Watch this space—more global partnerships, more wins, and more opportunities are coming.\n\n#ARES2025 #FilipinoHomes #RealEstateWithPurpose",
  },
  {
    id: 2,
    name: "Cesar Wee Jr.",
    title: "President",
    company: "WeeComm",
    image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Cesar+Wee+Jr..png",
    slug: "cesar-wee-jr",
    tagline: "The Community Builder Extraordinaire",
    achievements: ["Innovative Residential Developments", "Cultural Integration Expert", "Community-Focused Leader"],
    expertise: ["Community Development", "Cultural Architecture", "Sustainable Building"],
    description:
      "Not all developers are the same.\n\nSome build structures. Others build communities.\n\nCesar Wee Jr. is definitely the latter.\n\nAs President of WeeComm, he's behind some of the most creative and thoughtful residential spaces in the country. His work blends innovation and culture, building homes that feel personal—and that's why he stands out.\n\nAt ARES 2025, he's joining us to share how collaboration (not competition!) is the real secret to lasting growth.\n\nWeeComm's strong partnership with Filipino Homes is a perfect example of that. Together, we move further.\n\n#ARES2025 #WeeComm #FilipinoHomes",
  },
  {
    id: 3,
    name: "Jose 'Joe' R. Soberano III",
    title: "2023 Real Estate Personality of the Year",
    company: "Cebu Landmasters",
    image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Joe+Soberano.png",
    slug: "jose-joe-soberano-iii",
    tagline: "The Visayas Kingmaker",
    achievements: ["2023 Real Estate Personality of the Year", "100+ Projects Delivered", "16 Cities Transformed"],
    expertise: ["Regional Development", "Project Management", "Market Expansion"],
    description:
      "Some stories start in big cities. Joe Soberano's started in Cebu—and grew from there.\n\nAs founder of Cebu Landmasters, Joe has spent decades developing real estate that truly reflects local needs. He's helped build over 100 projects in more than 16 cities across VisMin.\n\nThis 2023 Real Estate Personality of the Year is joining ARES 2025 to share how real estate done right can transform lives, regions, and industries.\n\nIf you're in real estate and you're serious about growth with impact, this is a voice you'll want to hear.\n\n#ARES2025 #CebuLandmasters #FilipinoHomes",
  },
  {
    id: 4,
    name: "Carson Choa",
    title: "Chief Operating Officer",
    company: "WeeComm",
    image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Carson+Choa.png",
    slug: "carson-choa",
    tagline: "The Operations Mastermind",
    achievements: ["Operational Excellence Leader", "National Expansion Architect", "Team Development Expert"],
    expertise: ["Operations Management", "Strategic Planning", "Team Leadership"],
    description:
      "Meet Carson Choa—COO of WeeComm, and the guy who helped take the company from a niche builder to a national name.\n\nHe's not all spreadsheets and systems. Carson believes in building with purpose—real homes for real families.\n\nAt ARES 2025, he'll share how teamwork, mentorship, and a good heart can help scale a business the right way.\n\nFilipino Homes is proud to grow alongside forward-thinking developers like WeeComm. And proud to give agents the chance to work with brands that actually care.\n\n#ARES2025 #WeeComm #FilipinoHomes",
  },
  {
    id: 5,
    name: "Yuriy Braterskyy",
    title: "Founder & CEO, SUPERAGENT.CO",
    company: "INTERNATIONAL SPEAKER (UKRAINE)",
    image:
      "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Yuriy+Braterskyy.png",
    slug: "yuriy-braterskyy",
    tagline: "The AI‑Powered Proptech Pioneer",
    achievements: ["Proptech Startup Founder", "AI-Powered Real Estate Innovator", "APAC Tech Conference Speaker"],
    expertise: ["AI Automation in Real Estate", "Digital Platform Scaling", "Startup Growth Strategy"],
    description:
      "What happens when real estate meets AI?\n\nYou get Yuriy Braterskyy. 🔥 \n\nHe's the CEO of Superagent.co, a rising tech company that's changing how property deals are done.\n\nThink of it like having a smart assistant in your pocket—helping agents close faster, answer better, and stay one step ahead.\n\nAt ARES 2025, Yuriy will show us how tech isn't just for the big guys. With the right tools, every broker and agent can work smarter—not harder.\n\nFilipino Homes believes in the same thing: providing agents with the support they need to thrive in today's digital world.\n\n#ARES2025 #Superagent #FilipinoHomes",
  },
  {
    id: 6,
    name: "Samantha Manigsaca",
    title: "AVP for Hospitality",
    company: "AppleOne Properties",
    image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Samantha+Manigsaca.png",
    slug: "samantha-manigsaca",
    tagline: "The Hospitality Innovator",
    achievements: ["Global Hotel Brand Partnerships", "Luxury Living Pioneer", "Hospitality-Real Estate Fusion Expert"],
    expertise: ["Hospitality Management", "Luxury Development", "Brand Partnerships"],
    description:
      "Real estate isn't just about homes—it's also about how people live, rest, and feel at home.\n\nThat's where Samantha Manigsaca shines.\n\nAs AVP for Hospitality at AppleOne Properties, Samantha blends real estate with hotel-style living—creating developments that offer comfort, class, and long-term value.\n\nShe's worked with some of the biggest global hotel brands, and at ARES 2025, she'll show us how hospitality can make real estate even more exciting for investors and homebuyers.\n\nLooking to develop a lifestyle-driven project? Filipino Homes can connect you to the right ideas—and the right people.\n\n#ARES2025 #AppleOne #FilipinoHomes",
  },
  {
    id: 7,
    name: "May Antonette Leuterio",
    title: "Managing Director",
    company: "Rent.ph",
    image:
      "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/May+Antonette+Leuterio.png",
    slug: "may-antonette-leuterio",
    tagline: "The Rental Revolution Leader",
    achievements: ["Top Rental Platform Creator", "OFW Market Pioneer", "PropTech Innovation Leader"],
    expertise: ["Rental Market Strategy", "Digital Platforms", "OFW Services"],
    description:
      "Rental real estate is booming—and May Antonette Leuterio is leading the way.\n\nShe's the Managing Director of Rent.ph, the country's top rental platform, helping thousands of OFWs and property owners connect with the right tenants faster and easier.\n\nBut she's not just about tech. May's all heart. She trains agents. Builds tools. And creates systems that actually work in the real world.\n\nAt ARES 2025, May will talk about how to grow rental income, reach overseas buyers, and future-proof your rental business.\n\nAnother reason to join Filipino Homes? Leaders like May are here to help you succeed.\n\n#ARES2025 #RentPH #FilipinoHomes",
  },
  {
    id: 8,
    name: "Alejandro Mañalac",
    title: "Real Estate Specialist",
    company: "Market Expert",
    image:
      "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Alejandro+Ma%C3%B1alac.png",
    slug: "alejandro-manalac",
    tagline: "The Market Visionary",
    achievements: ["Market Analysis Expert", "Investment Opportunity Identifier", "Trend Prediction Specialist"],
    expertise: ["Market Analysis", "Investment Strategy", "Trend Forecasting"],
    description:
      "If you've been in real estate long enough, you know the name Andy Mañalac.\n\nHe's a mentor, coach, and strategist who has helped shape some of the country's largest developers and brokerage teams.\n\nAs Chairman of Havitas and Operating Principal of Keller Williams Manila Bay, Andy blends global systems with local success.\n\nAnd at ARES 2025, he's bringing straight talk on leadership, sales, and how to lead with heart—without losing your edge.\n\nWant to grow your team or start your own real estate venture? This is the guy to listen to. And Filipino Homes is the place to start.\n\n#ARES2025 #Havitas #KellerWilliams #FilipinoHomes",
  },
  {
    id: 9,
    name: "Elddie Benigay",
    title: "Filipino Homes, Unit Manager",
    company: "Of Team Beautiful Properties",
    image:
      "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Elddie+Benigay.png",
    slug: "elddie-benigay",
    tagline: "The Content‑Driven Real Estate Leader",
    achievements: ["500+ Agent Team Leader", "Top Real Estate Content Creator", "Filipino Homes Influencer"],
    expertise: ["Content Marketing for Real Estate", "Team Building & Leadership", "Social Media Lead Generation"],
    description:
      "From civil engineer to full-time real estate influencer—Elddie Benigay is proof that bold career moves can change lives.\n\nHe now leads a 500-strong sales team at Filipino Homes and has become a go-to voice in the industry, thanks to his engaging YouTube home tours and viral TikTok tips.\n\nAt ARES 2025, Elddie will show us how agents can use content creation to build trust, attract clients, and grow their brand—without spending big.\n\nHe's not just selling properties. He's inspiring a new generation of digital-savvy agents.\n\n#ARES2025 #DigitalAgent #FilipinoHomes",
  },
  {
    id: 10,
    name: "Gilbert Monecillo",
    title: "Real Estate Professional",
    company: "Industry Expert",
    image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Gilbert+Monecillo.png",
    slug: "gilbert-monecillo",
    tagline: "The Solutions Architect",
    achievements: ["Property Management Excellence", "Sales Strategy Expert", "Market Navigation Specialist"],
    expertise: ["Property Management", "Sales Strategy", "Market Solutions"],
    description:
      "Gilbert Monecillo is on a mission to bring Filipino real estate to the global stage.\n\nAs VP for Global Expansion at Filipino Homes and back-to-back Top 1 Team Leader at NatCon, he's building bridges to international markets—while leading a massive network of 35 Unit Managers and 15 VIP offices.\nHe's also Harvard- and Wharton-trained, with the heart of a servant leader.\n\nAt ARES 2025, Gilbert will share how Filipino excellence can scale worldwide—by focusing on systems, service, and smart expansion.\nDreaming big? You'll want to hear this one.\n\n#ARES2025 #GlobalGrowth #FilipinoHomes",
  },
  {
    id: 11,
    name: "George Sarmago",
    title: "Real Estate Expert",
    company: "Industry Leader",
    image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/George+Sarmago.png",
    slug: "george-sarmago",
    tagline: "The Strategic Innovator",
    achievements: ["Decades of Market Expertise", "Investment Strategy Pioneer", "Development Innovation Leader"],
    expertise: ["Investment Strategy", "Market Analysis", "Development Planning"],
    description:
      "George Ryan Sarmago didn't start in real estate until he was 34 years old. Today? He's closed over ₱2 billion in sales. 🔥\n\nFrom corporate bulk deals to luxury listings, George has mastered how to read clients—and turn 'let me think about it' into 'where do I sign?'\n\nAt ARES 2025, he's sharing his secret playbook: decoding buyer psychology, building a personal brand, and selling with empathy.\n\nGeorge believes real estate can give you more than income—it can provide you with freedom, purpose, and a better life for your family.\n\n#ARES2025 #BuyerPsychology #FilipinoHomes",
  },
  {
    id: 12,
    name: "Azela Honor",
    title: "Team Leader, Team A",
    company: "Filipino Homes",
    image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Azela+Honor.png",
    slug: "azela-honor",
    tagline: "The Next-Gen Champion",
    achievements: ["Top Team Performance", "Digital Strategy Pioneer", "Agent Development Expert"],
    expertise: ["Team Leadership", "Digital Marketing", "Agent Training"],
    description:
      "If there's one word for Azela Honor, it's unstoppable.\n\nShe leads Filipino Homes Team A and runs multiple companies in real estate, hospitality, and property management—while advocating for women in business and leadership.\n\nA health sciences grad turned broker, Azela's 15-year journey proves that with vision and grit, you can build an empire from the ground up.\n\nAt ARES 2025, she'll share lessons on resilience, innovation, and how to lead multiple ventures with purpose and balance.\n\nShe's real, relatable, and exactly the kind of voice our industry needs more of.\n\n#ARES2025 #WomenInRealEstate #FilipinoHomes",
  },
  {
    id: 13,
    name: "Dr. Sopon Pornchokchai",
    title: "Real Estate Valuation Expert",
    company: "Agency for Real Estate Affairs (Thailand)",
    image:
      "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Dr.+Sopon+Pornchokchai.png",
    slug: "dr-sopon-pornchokchai",
    tagline: "The Valuation Virtuoso",
    achievements: ["40+ Years Experience", "30+ Countries Expertise", "World Bank Advisor"],
    expertise: ["Property Valuation", "Market Analysis", "International Standards"],
    description:
      "What do you get when you invite Asia's leading authority on real estate valuation to speak at the biggest real estate summit of the year?\n\nYou get serious knowledge. Practical solutions. And a whole new way to look at property.\n\nDr. Sopon Pornchokchai has over 40 years of experience in more than 30 countries—and he's not just teaching theory. He helped build Thailand's first computer-assisted mass appraisal system and has advised the World Bank, UN-Habitat, and governments across Southeast Asia. His work bridges the realms of real estate, public policy, and economic growth.\n\nAt ARES 2025, we're proud to welcome Dr. Sopon as he shares how strong valuation systems can boost investor trust and help developing nations grow faster and smarter.\n\nThis is the kind of global insight we want every Filipino Homes agent and developer to hear. \n\nBecause when we grow together, we grow stronger.\n\n💡 Want to build something bigger than just your sales target?\n💡 Want to partner with real estate leaders who think long-term?\n\nThen, ARES 2025 in Bangkok is where you need to be.",
  },
]

// Function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function SpeakersPage() {
  const searchParams = useSearchParams()
  const selectedSpeakerSlug = searchParams.get("speaker")
  const [visiblePosters, setVisiblePosters] = useState(new Set<number>())
  const observerRef = useRef<IntersectionObserver | null>(null)

  const selectedSpeaker = speakerPosters.find((s) => s.slug === selectedSpeakerSlug)

  // Randomize suggested speakers
  const suggested = shuffleArray(speakerPosters.filter((s) => s.slug !== selectedSpeakerSlug)).slice(0, 3)

  // Scroll to top when speaker changes
  useEffect(() => {
    if (selectedSpeakerSlug) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [selectedSpeakerSlug])

  useEffect(() => {
    if (selectedSpeakerSlug) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = Number.parseInt(e.target.getAttribute("data-id") || "0", 10)
            setVisiblePosters((p) => new Set([...p, id]))
          }
        })
      },
      { threshold: 0.1, rootMargin: "50px" },
    )

    document.querySelectorAll<HTMLElement>(".speaker-card").forEach((el) => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [selectedSpeakerSlug])

  async function share(s: Speaker) {
    const url = `${window.location.origin}/speakers?speaker=${s.slug}`
    const shareData = {
      title: `${s.name} – ARES 2025 Speaker`,
      text: `🌟 ${s.tagline} – ${s.name}, ${s.title} @ ${s.company}`,
      url,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (_) {
        // Ignore share errors
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard 🎉")
    }
  }

  // Individual Speaker View
  if (selectedSpeaker) {
    const s = selectedSpeaker
    return (
      <div className="min-h-screen relative overflow-hidden pb-24">
        {/* Background */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url(https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/background.png)",
          }}
        />

        {/* Overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-slate-900/85 to-black/80 z-10" />

        {/* Content */}
        <div className="relative z-20 pt-24 md:pt-32 pb-12 px-4 max-w-7xl mx-auto">
          <Link href="/speakers">
            <Button
              variant="outline"
              className="border-[#0078b6]/50 text-[#0078b6] hover:bg-[#0078b6]/10 mb-6 md:mb-10"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to all speakers
            </Button>
          </Link>

          {/* Hero */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0078b6]/20 to-[#e22837]/20 px-4 md:px-6 py-2 md:py-3 rounded-full border border-[#0078b6]/30 backdrop-blur-sm mb-4 md:mb-6">
              <Crown className="text-[#0078b6]" size={16} />
              <span className="text-[#0078b6] font-bold uppercase tracking-wider text-sm md:text-base">
                Featured Speaker
              </span>
              <Crown className="text-[#0078b6]" size={16} />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 font-['Poppins'] leading-tight px-2">
              {s.name}
            </h1>
            <p className="text-lg md:text-xl text-[#0078b6] italic font-bold mb-2 px-2">"{s.tagline}"</p>
            <p className="text-white/80 text-base md:text-lg px-2">
              {s.title} • {s.company}
            </p>
          </div>

          {/* Grid */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
            {/* Poster */}
            <div className="relative group order-2 lg:order-1">
              <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-[#0078b6]/30 to-[#e22837]/30 rounded-2xl md:rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <img
                src={s.image || "/placeholder.svg"}
                alt={s.name}
                className="relative w-full rounded-xl md:rounded-2xl border-2 md:border-4 border-[#0078b6]/40 shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Details */}
            <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
              {/* Achievements */}
              <div className="rounded-xl md:rounded-2xl border border-[#0078b6]/40 p-4 md:p-6 bg-white/10 backdrop-blur-sm">
                <h3 className="flex items-center gap-2 text-[#0078b6] font-bold text-lg md:text-xl mb-3 md:mb-4 font-['Poppins']">
                  <Trophy size={20} /> Achievements
                </h3>
                <div className="space-y-2 md:space-y-3">
                  {s.achievements.map((a, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#0078b6] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-white/90 font-medium text-sm md:text-base">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expertise */}
              <div className="rounded-xl md:rounded-2xl border border-[#e22837]/40 p-4 md:p-6 bg-white/10 backdrop-blur-sm">
                <h3 className="flex items-center gap-2 text-[#e22837] font-bold text-lg md:text-xl mb-3 md:mb-4 font-['Poppins']">
                  <Sparkles size={20} /> Expertise
                </h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {s.expertise.map((e, idx) => (
                    <span
                      key={idx}
                      className="px-3 md:px-4 py-1 md:py-2 rounded-full bg-gradient-to-r from-[#e22837]/30 to-[#0078b6]/30 text-white/90 font-semibold text-xs md:text-sm border border-white/20"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button
                  onClick={() => share(s)}
                  className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm md:text-base"
                >
                  <Share2 size={16} className="mr-2" /> Share Speaker
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-[#0078b6]/50 text-[#0078b6] hover:bg-[#0078b6]/10 font-bold py-2 md:py-3 px-4 md:px-6 rounded-full backdrop-blur-sm text-sm md:text-base"
                >
                  <ExternalLink size={16} className="mr-2" /> Learn More
                </Button>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white/10 backdrop-blur-sm p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-[#0078b6] mb-4 md:mb-6 text-center font-['Poppins']">
              Speaker Biography
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              {s.description.split("\n\n").map((p, i) => (
                <p key={i} className="text-white/90 text-base md:text-lg leading-relaxed mb-3 md:mb-4">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Suggested */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 font-['Poppins']">
              Other Featured Speakers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {suggested.map((sp) => (
                <Link key={sp.id} href={`/speakers?speaker=${sp.slug}`}>
                  <div className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg md:rounded-xl shadow-lg">
                      <img
                        src={sp.image || "/placeholder.svg"}
                        alt={sp.name}
                        className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="mt-3 md:mt-4 text-center px-2">
                      <h3 className="font-bold text-white/90 text-base md:text-lg font-['Poppins']">{sp.name}</h3>
                      <p className="text-[#0078b6] text-sm italic">"{sp.tagline}"</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url(https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/background.png)",
        }}
      />

      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-slate-900/85 to-black/80 z-10" />

      {/* Content */}
      <div className="relative z-20 pt-24 md:pt-32 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="mb-6 md:mb-8">
            <img
              src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
              alt="ARES 2025"
              className="max-w-xs md:max-w-md mx-auto h-auto filter drop-shadow-2xl"
            />
          </div>

          <div className="bg-gradient-to-r from-[#e22837] to-[#0078b6] px-4 md:px-8 py-3 md:py-4 rounded-full inline-block shadow-2xl border-2 border-white/20 backdrop-blur-sm mb-6 md:mb-8 mx-2">
            <h2 className="text-white font-black text-sm md:text-lg uppercase tracking-wider font-['Poppins']">
              🌟 BANGKOK, THAILAND | JULY 2, 2025 🌟
            </h2>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 leading-tight font-['Poppins'] px-2">
            MEET THE{" "}
            <span className="text-transparent bg-gradient-to-r from-[#0078b6] to-[#e22837] bg-clip-text">SPEAKERS</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed px-4">
            🎯 Meet the industry leaders, visionaries, and experts who will share their insights and strategies at
            Asia's premier real estate summit.
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {speakerPosters.map((s, idx) => (
            <Link key={s.id} href={`/speakers?speaker=${s.slug}`}>
              <div
                data-id={s.id}
                className={`speaker-card transform transition duration-700 ${
                  visiblePosters.has(s.id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className="group relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 md:-inset-2 bg-gradient-to-r from-[#0078b6]/30 to-[#e22837]/30 rounded-xl md:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Speaker poster */}
                  <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-xl border border-white/20 group-hover:border-[#0078b6]/60 transition-all duration-300">
                    <img
                      src={s.image || "/placeholder.svg"}
                      alt={s.name}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Hover info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-bold text-base md:text-lg mb-1 font-['Poppins']">{s.name}</h3>
                      <p className="text-[#0078b6] text-xs md:text-sm font-bold italic">"{s.tagline}"</p>
                      <p className="text-white/80 text-xs">{s.title}</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button className="w-full mt-3 md:mt-4 bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white font-bold py-2 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm md:text-base">
                  <Crown size={16} className="mr-2" />
                  View Profile
                </Button>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="text-center mt-16 md:mt-20">
          <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl md:rounded-3xl border-2 border-[#0078b6]/30 shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-black text-[#0078b6] mb-4 md:mb-6 uppercase tracking-wide font-['Poppins']">
              More Speakers Coming Soon!
            </h3>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6 md:mb-8 px-2">
              🎯 We're adding more industry experts and thought leaders to this incredible lineup. Stay tuned for more
              announcements!
            </p>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 px-4 md:px-6 py-2 md:py-3 rounded-full border border-[#0078b6]/30">
              <Crown className="text-[#0078b6]" size={16} />
              <span className="text-[#0078b6] font-bold text-sm md:text-base">
                The Ultimate Real Estate Experience Awaits
              </span>
              <Crown className="text-[#0078b6]" size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
