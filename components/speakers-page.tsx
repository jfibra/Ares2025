"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, Award, Users, ExternalLink, Share2, Play, Sparkles, Crown, Trophy } from "lucide-react"
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

function SpeakersPage() {
  const [visiblePosters, setVisiblePosters] = useState(new Set<number>())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedSpeakerSlug = searchParams.get("speaker")

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
      name: "Samantha Manigsaca",
      title: "AVP for Hospitality",
      company: "AppleOne Properties",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Samantha+Manigsaca.png",
      slug: "samantha-manigsaca",
      tagline: "The Hospitality Innovator",
      achievements: [
        "Global Hotel Brand Partnerships",
        "Luxury Living Pioneer",
        "Hospitality-Real Estate Fusion Expert",
      ],
      expertise: ["Hospitality Management", "Luxury Development", "Brand Partnerships"],
      description:
        "Real estate isn't just about homes—it's also about how people live, rest, and feel at home.\n\nThat's where Samantha Manigsaca shines.\n\nAs AVP for Hospitality at AppleOne Properties, Samantha blends real estate with hotel-style living—creating developments that offer comfort, class, and long-term value.\n\nShe's worked with some of the biggest global hotel brands, and at ARES 2025, she'll show us how hospitality can make real estate even more exciting for investors and homebuyers.\n\nLooking to develop a lifestyle-driven project? Filipino Homes can connect you to the right ideas—and the right people.\n\n#ARES2025 #AppleOne #FilipinoHomes",
    },
    {
      id: 6,
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
      id: 7,
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
        "What do you get when you invite Asia’s leading authority on real estate valuation to speak at the biggest real estate summit of the year?\n\nYou get serious knowledge. Practical solutions. And a whole new way to look at property.\n\nDr. Sopon Pornchokchai has over 40 years of experience in more than 30 countries—and he’s not just teaching theory. He helped build Thailand’s first computer-assisted mass appraisal system and has advised the World Bank, UN-Habitat, and governments across Southeast Asia. His work bridges the realms of real estate, public policy, and economic growth.\n\nAt 𝗔𝗥𝗘𝗦 𝟮𝟬𝟮𝟱, we’re proud to welcome Dr. Sopon as he shares how 𝘀𝘁𝗿𝗼𝗻𝗴 𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝘀𝘆𝘀𝘁𝗲𝗺𝘀 𝗰𝗮𝗻 𝗯𝗼𝗼𝘀𝘁 𝗶𝗻𝘃𝗲𝘀𝘁𝗼𝗿 𝘁𝗿𝘂𝘀𝘁 𝗮𝗻𝗱 𝗵𝗲𝗹𝗽 𝗱𝗲𝘃𝗲𝗹𝗼𝗽𝗶𝗻𝗴 𝗻𝗮𝘁𝗶𝗼𝗻𝘀 𝗴𝗿𝗼𝘄 𝗳𝗮𝘀𝘁𝗲𝗿 𝗮𝗻𝗱 𝘀𝗺𝗮𝗿𝘁𝗲𝗿.\n\nThis is the kind of global insight we want every Filipino Homes agent and developer to hear. \n\nBecause when we grow together, we grow stronger.\n\n💡 Want to build something bigger than just your sales target?\n💡 Want to partner with real estate leaders who think long-term?\n\nThen, 𝗔𝗥𝗘𝗦 𝟮𝟬𝟮𝟱 𝗶𝗻 𝗕𝗮𝗻𝗴𝗸𝗼𝗸 is where you need to be.",
    },
    {
      id: 8,
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
      id: 9,
      name: "George Sarmago",
      title: "Real Estate Expert",
      company: "Industry Leader",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/George+Sarmago.png",
      slug: "george-sarmago",
      tagline: "The Strategic Innovator",
      achievements: ["Decades of Market Expertise", "Investment Strategy Pioneer", "Development Innovation Leader"],
      expertise: ["Investment Strategy", "Market Analysis", "Development Planning"],
      description:
        "George Ryan Sarmago didn't start in real estate until he was 34 years old. Today? He's closed over ₱2 billion in sales. 🔥\n\nFrom corporate bulk deals to luxury listings, George has mastered how to read clients—and turn "let me think about it" into "where do I sign?"\n\nAt ARES 2025, he's sharing his secret playbook: decoding buyer psychology, building a personal brand, and selling with empathy.\n\nGeorge believes real estate can give you more than income—it can provide you with freedom, purpose, and a better life for your family.\n\n#ARES2025 #BuyerPsychology #FilipinoHomes",
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
  ]

  const selectedSpeaker = speakerPosters.find((speaker) => speaker.slug === selectedSpeakerSlug)
  const suggestedSpeakers = speakerPosters.filter((speaker) => speaker.slug !== selectedSpeakerSlug).slice(0, 3)

  useEffect(() => {
    if (!selectedSpeakerSlug) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const posterId = Number.parseInt(entry.target.getAttribute("data-poster-id") || "0")
              setVisiblePosters((prev) => new Set([...prev, posterId]))
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: "50px",
        },
      )

      const posterElements = document.querySelectorAll(".speaker-poster")
      posterElements.forEach((el) => observerRef.current?.observe(el))

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect()
        }
      }
    }
  }, [selectedSpeakerSlug])

  const handleShare = async (speaker: Speaker) => {
    const shareData = {
      title: `${speaker.name} - ARES 2025 Speaker`,
      text: `🌟 ${speaker.tagline} - Meet ${speaker.name}, ${speaker.title} at ${speaker.company}. Speaking at ARES 2025!`,
      url: `${window.location.origin}/speakers?speaker=${speaker.slug}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      navigator.clipboard.writeText(shareData.url)
      alert("🎉 Speaker link copied to clipboard!")
    }
  }

  // Individual Speaker View
  if (selectedSpeaker) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Cinematic Background */}
        <div
          className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url(https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/TEMPLE.png)",
          }}
        />

        {/* Hollywood-style Overlays */}
        <div className="fixed top-0 left-0 w-full h-full z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-purple-900/85 via-indigo-900/80 to-black/90" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#e22837]/20 via-transparent via-[#ffd700]/10 via-transparent to-[#0078b6]/20" />

          {/* Animated light rays */}
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-[#ffd700]/30 to-transparent transform rotate-12 animate-pulse" />
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-[#e22837]/20 to-transparent transform -rotate-12 animate-pulse delay-1000" />

          {/* Spotlight effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-[#ffd700]/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-[#e22837]/15 to-transparent rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        {/* Content */}
        <div className="relative z-20 min-h-screen pb-32">
          {/* Cinematic Header */}
          <div className="pt-32 pb-8">
            <div className="container mx-auto px-4">
              <Link href="/speakers">
                <Button
                  variant="outline"
                  className="border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/10 backdrop-blur-sm shadow-2xl hover:shadow-[#ffd700]/25 transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="mr-2" size={20} />← Back to All Stars
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Speaker Showcase */}
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ffd700]/20 to-[#e22837]/20 px-6 py-3 rounded-full border border-[#ffd700]/30 backdrop-blur-sm mb-6">
                  <Crown className="text-[#ffd700]" size={20} />
                  <span className="text-[#ffd700] font-bold uppercase tracking-wider">Featured Speaker</span>
                  <Crown className="text-[#ffd700]" size={20} />
                </div>

                <h1 className="text-5xl lg:text-7xl font-black text-transparent bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text leading-tight mb-4 font-['Lato']">
                  {selectedSpeaker.name}
                </h1>

                <div className="text-2xl lg:text-3xl text-[#ffd700] font-bold italic mb-2">
                  "{selectedSpeaker.tagline}"
                </div>

                <div className="text-xl text-white/90 font-semibold mb-8">
                  {selectedSpeaker.title} • {selectedSpeaker.company}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
                {/* Speaker Poster - Cinematic Presentation */}
                <div className="relative group">
                  {/* Glow effects */}
                  <div className="absolute -inset-8 bg-gradient-to-r from-[#ffd700]/30 via-[#e22837]/20 to-[#0078b6]/30 rounded-3xl blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd700]/20 via-transparent to-[#e22837]/20 rounded-2xl blur-xl" />

                  {/* Main poster */}
                  <div className="relative overflow-hidden rounded-2xl border-2 border-[#ffd700]/40 shadow-2xl group-hover:shadow-[#ffd700]/30 transition-all duration-500 group-hover:scale-105">
                    <img
                      src={selectedSpeaker.image || "/placeholder.svg"}
                      alt={selectedSpeaker.name}
                      className="w-full h-auto relative z-10 transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay effects */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Shine effect */}
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 group-hover:left-full" />
                  </div>

                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#e22837] to-[#d41e2d] text-white px-4 py-2 rounded-full font-bold text-sm shadow-2xl animate-bounce">
                    ⭐ FEATURED
                  </div>
                </div>

                {/* Speaker Information - Hollywood Style */}
                <div className="space-y-8">
                  {/* Achievements Showcase */}
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-6 rounded-2xl border border-[#ffd700]/30 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="text-[#ffd700]" size={24} />
                      <h3 className="text-xl font-bold text-[#ffd700] uppercase tracking-wide">
                        Legendary Achievements
                      </h3>
                    </div>
                    <div className="grid gap-3">
                      {selectedSpeaker.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#ffd700] rounded-full animate-pulse" />
                          <span className="text-white/90 font-medium">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expertise Areas */}
                  <div className="bg-gradient-to-br from-[#e22837]/10 to-[#0078b6]/10 backdrop-blur-sm p-6 rounded-2xl border border-[#e22837]/30 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-[#e22837]" size={24} />
                      <h3 className="text-xl font-bold text-[#e22837] uppercase tracking-wide">Areas of Mastery</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedSpeaker.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 text-white px-4 py-2 rounded-full border border-white/20 font-semibold text-sm hover:scale-105 transition-transform duration-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => handleShare(selectedSpeaker)}
                      className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-[#e22837]/30 transition-all duration-300 hover:scale-105 group"
                    >
                      <Share2 className="mr-2 group-hover:rotate-12 transition-transform duration-300" size={20} />
                      Share This Legend
                    </Button>
                    <Button
                      variant="outline"
                      className="border-2 border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/10 font-bold py-4 px-8 rounded-full backdrop-blur-sm hover:scale-105 transition-all duration-300"
                    >
                      <ExternalLink className="mr-2" size={20} />
                      Learn More
                    </Button>
                  </div>

                  {/* ARES 2025 Badge */}
                  <div className="bg-gradient-to-r from-[#ffd700]/20 to-[#ffd700]/10 p-6 rounded-2xl border-2 border-[#ffd700]/40 shadow-2xl">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Star className="text-[#ffd700] animate-spin" size={24} />
                        <span className="text-[#ffd700] font-black text-lg uppercase tracking-wider">
                          ARES 2025 HEADLINER
                        </span>
                        <Star className="text-[#ffd700] animate-spin" size={24} />
                      </div>
                      <p className="text-white/90 font-semibold">Bangkok, Thailand • July 2, 2025</p>
                      <p className="text-white/70 text-sm mt-2">Don't miss this exclusive opportunity!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Epic Biography Section */}
              <div className="mb-20">
                <div className="bg-gradient-to-br from-black/60 to-purple-900/40 backdrop-blur-sm p-8 lg:p-12 rounded-3xl border border-[#ffd700]/30 shadow-2xl">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-[#ffd700] mb-4 uppercase tracking-wide">The Epic Story</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full" />
                  </div>

                  <div className="prose prose-lg prose-invert max-w-none">
                    {selectedSpeaker.description.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="text-white/90 text-lg leading-relaxed mb-6 text-justify">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Other Legends Section */}
              <div className="text-center mb-12">
                <h3 className="text-4xl font-black text-[#ffd700] mb-4 uppercase tracking-wide">Other Legends</h3>
                <p className="text-white/80 text-xl">Meet the other superstars joining this epic summit</p>
                <div className="w-20 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mt-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {suggestedSpeakers.map((speaker) => (
                  <Link key={speaker.id} href={`/speakers?speaker=${speaker.slug}`}>
                    <div className="group cursor-pointer">
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-[#ffd700]/20 hover:border-[#ffd700]/60 transition-all duration-500 hover:-translate-y-4 hover:scale-105 hover:shadow-[#ffd700]/20">
                        {/* Glow effect */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#ffd700]/20 via-[#e22837]/10 to-[#0078b6]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                        <img
                          src={speaker.image || "/placeholder.svg"}
                          alt={speaker.name}
                          className="w-full h-auto block transition-transform duration-500 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                          <h4 className="text-white font-bold text-lg mb-2 truncate">{speaker.name}</h4>
                          <p className="text-[#ffd700] text-sm font-bold italic mb-1 truncate">"{speaker.tagline}"</p>
                          <p className="text-white/80 text-xs truncate">{speaker.title}</p>
                          <p className="text-white/60 text-xs truncate">{speaker.company}</p>
                        </div>

                        {/* Hover play button */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-[#ffd700]/90 text-black p-4 rounded-full shadow-2xl">
                            <Play size={24} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Speakers Grid View - Hollywood Style
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Background */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url(https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/TEMPLE.png)",
        }}
      />

      {/* Hollywood Overlays */}
      <div className="fixed top-0 left-0 w-full h-full z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-purple-900/85 via-indigo-900/80 to-black/90" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#e22837]/20 via-transparent via-[#ffd700]/10 via-transparent to-[#0078b6]/20" />

        {/* Animated elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-[#ffd700]/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-[#e22837]/15 to-transparent rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-[#0078b6]/10 to-transparent rounded-full blur-3xl animate-pulse delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-20 min-h-screen pb-32">
        {/* Epic Header */}
        <div className="pt-32 pb-20 text-center">
          <div className="container mx-auto px-4">
            {/* Logo with glow */}
            <div className="mb-12 animate-in fade-in duration-1000">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd700]/30 to-[#e22837]/30 rounded-2xl blur-2xl animate-pulse" />
                <img
                  src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
                  alt="ARES 2025"
                  className="relative max-w-sm mx-auto h-auto filter drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Event Badge */}
            <div className="mb-12 animate-in slide-in-from-bottom duration-1000 delay-300">
              <div className="bg-gradient-to-r from-[#e22837] to-[#0078b6] px-8 py-4 rounded-full inline-block shadow-2xl border-2 border-[#ffd700]/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <h2 className="text-white font-black text-lg uppercase tracking-wider">
                  🌟 BANGKOK, THAILAND | JULY 2, 2025 🌟
                </h2>
              </div>
            </div>

            {/* Main Title - Hollywood Style */}
            <div className="animate-in slide-in-from-bottom duration-1000 delay-500">
              <div className="mb-6">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text leading-tight filter drop-shadow-2xl font-['Lato'] italic">
                  MEET THE
                </h1>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-[#e22837] via-[#ffd700] to-[#0078b6] bg-clip-text text-transparent leading-tight filter drop-shadow-lg font-['Lato'] italic">
                  LEGENDS
                </h1>
              </div>

              <div className="text-2xl md:text-3xl text-[#ffd700] font-bold italic mb-8 animate-pulse">
                "The Most Epic Lineup in Real Estate History"
              </div>
            </div>

            {/* Description */}
            <div className="animate-in slide-in-from-bottom duration-1000 delay-700">
              <p className="text-white/95 text-xl md:text-2xl max-w-5xl mx-auto leading-relaxed text-shadow-lg mb-12">
                🎬 Prepare for the ultimate real estate experience! These industry titans, visionaries, and
                game-changers will share their secrets, strategies, and success stories that have shaped Asia's property
                landscape. This isn't just a conference—it's a masterclass in excellence! 🎬
              </p>
            </div>

            {/* Epic Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto animate-in slide-in-from-bottom duration-1000 delay-1000">
              <div className="bg-gradient-to-br from-[#ffd700]/20 to-[#ffd700]/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-[#ffd700]/40 hover:border-[#ffd700]/70 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-[#ffd700]/20">
                <div className="flex items-center justify-center mb-4">
                  <Users className="text-[#ffd700] mr-3 animate-bounce" size={32} />
                  <h3 className="text-4xl font-black text-[#ffd700]">11+</h3>
                </div>
                <p className="text-white/90 font-bold text-lg uppercase tracking-wide">Industry Legends</p>
              </div>

              <div className="bg-gradient-to-br from-[#e22837]/20 to-[#e22837]/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-[#e22837]/40 hover:border-[#e22837]/70 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-[#e22837]/20">
                <div className="flex items-center justify-center mb-4">
                  <Award className="text-[#e22837] mr-3 animate-bounce delay-500" size={32} />
                  <h3 className="text-4xl font-black text-[#e22837]">40+</h3>
                </div>
                <p className="text-white/90 font-bold text-lg uppercase tracking-wide">Years of Mastery</p>
              </div>

              <div className="bg-gradient-to-br from-[#0078b6]/20 to-[#0078b6]/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-[#0078b6]/40 hover:border-[#0078b6]/70 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-[#0078b6]/20">
                <div className="flex items-center justify-center mb-4">
                  <Star className="text-[#0078b6] mr-3 animate-bounce delay-1000" size={32} />
                  <h3 className="text-4xl font-black text-[#0078b6]">2</h3>
                </div>
                <p className="text-white/90 font-bold text-lg uppercase tracking-wide">Epic Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Speakers Showcase */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {speakerPosters.map((speaker, index) => (
              <div
                key={speaker.id}
                className={`speaker-poster opacity-0 transform translate-y-12 scale-90 transition-all duration-800 ${
                  visiblePosters.has(speaker.id) ? "opacity-100 translate-y-0 scale-100" : ""
                }`}
                data-poster-id={speaker.id}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-[#ffd700]/20 hover:border-[#ffd700]/60 transition-all duration-500 hover:-translate-y-6 hover:scale-105 hover:shadow-3xl group">
                  {/* Epic glow effects */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#ffd700]/30 via-[#e22837]/20 to-[#0078b6]/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                  {/* Main poster */}
                  <img
                    src={speaker.image || "/placeholder.svg?height=600&width=400&text=Speaker+Poster"}
                    alt={speaker.name}
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-110 relative z-20"
                    loading="lazy"
                  />

                  {/* Overlay effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

                  {/* Shine effect */}
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-full z-40" />

                  {/* Hover info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-50">
                    <h3 className="text-white font-bold text-lg mb-1 truncate">{speaker.name}</h3>
                    <p className="text-[#ffd700] text-sm font-bold italic mb-1 truncate">"{speaker.tagline}"</p>
                    <p className="text-white/80 text-xs truncate">{speaker.title}</p>
                    <p className="text-white/60 text-xs truncate">{speaker.company}</p>
                  </div>

                  {/* Play button overlay */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                    <div className="bg-[#ffd700]/90 text-black p-4 rounded-full shadow-2xl animate-pulse">
                      <Play size={32} />
                    </div>
                  </div>

                  {/* Featured badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#e22837] to-[#d41e2d] text-white px-3 py-1 rounded-full font-bold text-xs shadow-2xl animate-bounce z-50">
                    ⭐ LEGEND
                  </div>
                </div>

                {/* Epic CTA Button */}
                <div className="mt-6">
                  <Link href={`/speakers?speaker=${speaker.slug}`}>
                    <Button className="w-full bg-gradient-to-r from-[#e22837] via-[#ffd700] to-[#0078b6] hover:from-[#d41e2d] hover:via-[#ffed4e] hover:to-[#005a8b] text-black font-black py-4 text-lg rounded-full shadow-2xl hover:shadow-[#ffd700]/40 transition-all duration-300 hover:scale-105 group">
                      <span className="flex items-center justify-center gap-2">
                        <Crown className="group-hover:rotate-12 transition-transform duration-300" size={20} />
                        MEET THE LEGEND
                        <Sparkles className="group-hover:-rotate-12 transition-transform duration-300" size={20} />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon - Epic Style */}
          <div className="text-center py-24 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-12 rounded-3xl border-2 border-[#ffd700]/30 shadow-2xl relative overflow-hidden">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700]/5 via-transparent to-[#e22837]/5 animate-pulse" />

              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Sparkles className="text-[#ffd700] animate-spin" size={32} />
                  <h3 className="text-4xl font-black text-[#ffd700] uppercase tracking-wide">
                    More Legends Coming Soon!
                  </h3>
                  <Sparkles className="text-[#ffd700] animate-spin" size={32} />
                </div>

                <p className="text-white/90 text-xl leading-relaxed mb-8">
                  🎬 The casting isn't complete! We're adding more industry superstars, visionaries, and game-changers
                  to this already incredible lineup. Stay tuned for announcements that will blow your mind! 🎬
                </p>

                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 px-6 py-3 rounded-full border border-[#ffd700]/30">
                  <Crown className="text-[#ffd700] animate-bounce" size={20} />
                  <span className="text-[#ffd700] font-bold">The Ultimate Real Estate Experience Awaits</span>
                  <Crown className="text-[#ffd700] animate-bounce" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpeakersPage
