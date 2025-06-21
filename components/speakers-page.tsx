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
        "🌟 THE LEGEND HIMSELF 🌟\n\nWhen the world talks about real estate transformation in Asia, one name echoes through boardrooms from Manila to Bangkok: Anthony Gerard Leuterio. This isn't just another success story—this is the epic tale of a man who didn't just enter the real estate game, he rewrote the entire playbook.\n\n🏆 From humble beginnings to becoming the 2024 International REALTOR® of the Year (recognized by the National Association of REALTORS® USA), Anthony has orchestrated the most spectacular rise in Philippine real estate history. With over 30,000 agents under his wing, he's not just running a company—he's commanding an unstoppable force that's reshaping how Filipinos dream, buy, and invest in property.\n\n⚡ At ARES 2025, witness the mastermind behind the revolution share his secrets. This is your once-in-a-lifetime chance to learn from the architect of modern Filipino real estate. When Anthony speaks, the industry listens. When he acts, markets move. This is more than a presentation—it's a masterclass in turning vision into empire.",
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
        "🏗️ THE COMMUNITY ARCHITECT 🏗️\n\nIn a world of cookie-cutter developments, Cesar Wee Jr. stands as the revolutionary who dared to build with soul. As President of WeeComm, he's not just constructing buildings—he's crafting communities that breathe, live, and thrive with authentic Filipino spirit.\n\n🎨 This visionary leader has mastered the art of blending cutting-edge innovation with deep cultural roots, creating residential spaces that don't just house families—they nurture dreams and build legacies. His developments aren't just addresses; they're destinations where life unfolds in its most beautiful form.\n\n🌟 At ARES 2025, discover the secrets behind building communities that last generations. Cesar will reveal how collaboration trumps competition, and why the future of real estate lies not in what we build, but in how we build it. Prepare to be inspired by a leader who proves that when you build with heart, you create more than homes—you create hope.",
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
        "👑 THE VISAYAS KINGMAKER 👑\n\nFrom the Queen City of the South to the farthest reaches of Mindanao, one name commands respect and admiration: Jose 'Joe' R. Soberano III. This isn't just a developer—this is the mastermind who transformed entire regions and redefined what's possible in Philippine real estate.\n\n🏆 Crowned the 2023 Real Estate Personality of the Year, Joe has orchestrated over 100 groundbreaking projects across 16 cities in VisMin. But numbers only tell part of his legendary story. This is about a visionary who saw potential where others saw challenges, who built dreams where others saw empty lots.\n\n⚡ As the founder of Cebu Landmasters, Joe has proven that real estate excellence isn't confined to Metro Manila. He's shown the world that when you combine local insight with global standards, you don't just develop properties—you develop entire communities, economies, and futures.\n\n🌟 At ARES 2025, witness the regional champion share his blueprint for transformational development. This is your exclusive access to the mind that's reshaping the Philippine archipelago, one visionary project at a time.",
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
        "⚙️ THE OPERATIONS MASTERMIND ⚙️\n\nBehind every real estate empire stands a strategic genius who turns vision into reality. Meet Carson Choa—the Chief Operating Officer who transformed WeeComm from a promising company into a national powerhouse that defines excellence in every project.\n\n🎯 Carson isn't just about systems and processes; he's about people and purpose. His revolutionary approach to operations combines cutting-edge efficiency with genuine heart, proving that the best businesses are built on both brilliant strategy and authentic care for every team member.\n\n🚀 Under his operational leadership, WeeComm has achieved unprecedented growth while maintaining the personal touch that makes every home special. Carson has cracked the code on scaling with soul—expanding reach without losing the essence that makes great companies truly great.\n\n💡 At ARES 2025, discover the operational secrets that fuel sustainable growth. Carson will reveal how mentorship, teamwork, and purposeful leadership create the foundation for building businesses that don't just succeed—they inspire. This is your masterclass in turning good intentions into great results.",
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
        "✨ THE HOSPITALITY INNOVATOR ✨\n\nWhere real estate meets world-class hospitality, you'll find Samantha Manigsaca orchestrating experiences that redefine luxury living. As AVP for Hospitality at AppleOne Properties, she's not just managing properties—she's curating lifestyles that rival the world's finest hotels.\n\n🏨 Samantha has mastered the art of bringing five-star service into residential living, creating developments where every day feels like a premium vacation. Her partnerships with global hotel brands have set new standards for what it means to truly live in luxury.\n\n🌟 This hospitality virtuoso understands that modern buyers don't just want homes—they want experiences, services, and amenities that elevate every moment of their lives. She's pioneering a new category of living where residential meets resort, where home becomes haven.\n\n🎭 At ARES 2025, step into the future of luxury living with Samantha. Discover how hospitality principles are revolutionizing real estate, creating properties that don't just appreciate in value—they appreciate in lifestyle. This is your exclusive preview of where residential development is heading: toward experiences that exceed every expectation.",
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
        "🚀 THE RENTAL REVOLUTION LEADER 🚀\n\nIn the rapidly evolving world of rental real estate, one name stands at the forefront of innovation: May Antonette Leuterio. As Managing Director of Rent.ph, she's not just running a platform—she's leading a revolution that's transforming how Filipinos connect with their perfect homes.\n\n💫 May has cracked the code on rental success, creating the country's premier platform that serves thousands of OFWs and property owners with unprecedented efficiency and care. But her genius lies not just in technology—it's in understanding the human heart behind every rental transaction.\n\n🌍 This visionary leader has built more than systems; she's built bridges—connecting overseas Filipinos with their dream properties, empowering property owners with tools that actually work, and creating a rental ecosystem that serves everyone with excellence.\n\n⚡ At ARES 2025, unlock the secrets of rental market mastery with May. Discover how to maximize rental income, reach global markets, and future-proof your rental business in an increasingly digital world. This isn't just about property management—it's about building rental empires that generate wealth while serving communities.",
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
        "🎓 THE VALUATION VIRTUOSO 🎓\n\nWhen Asia's most sophisticated investors need to understand true property value, they turn to one legendary figure: Dr. Sopon Pornchokchai. With over 40 years of expertise spanning 30+ countries, he's not just a valuation expert—he's the architect of modern property assessment across Southeast Asia.\n\n🏛️ This distinguished authority has advised the World Bank, UN-Habitat, and governments across the region, shaping policies that govern billions in real estate transactions. Dr. Sopon didn't just study the market—he helped create the systems that define it.\n\n💎 As the mastermind behind Thailand's first computer-assisted mass appraisal system, he's proven that precision and innovation can revolutionize how we understand property value. His methodologies have become the gold standard for accurate, reliable property assessment.\n\n🌟 At ARES 2025, gain exclusive access to four decades of valuation wisdom. Dr. Sopon will reveal the secrets of accurate property assessment, market prediction, and investment analysis that have guided some of Asia's most successful real estate decisions. This is your opportunity to learn from the master who literally wrote the book on Asian property valuation.",
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
        "🌟 THE NEXT-GEN CHAMPION 🌟\n\nMeet the future of real estate leadership: Azela Honor, the dynamic Team Leader who represents the perfect fusion of traditional relationship-building with cutting-edge digital mastery. Leading Team A at Filipino Homes, she's not just achieving results—she's redefining what's possible for the next generation of real estate professionals.\n\n💪 Azela embodies the new breed of real estate leaders who understand that success in today's market requires both heart and technology. She's mentored dozens of agents, transforming careers and building dreams while serving Filipino families with unmatched dedication.\n\n🚀 This rising star has mastered the art of combining authentic relationship-building with powerful digital strategies, proving that the future belongs to those who can bridge traditional values with modern innovation.\n\n⚡ At ARES 2025, discover the blueprint for next-generation real estate success with Azela. Learn how to build high-performing teams, leverage digital tools for maximum impact, and create sustainable growth in an evolving market. This is your window into the future of real estate leadership.",
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
        "🎯 THE STRATEGIC INNOVATOR 🎯\n\nIn the complex world of real estate strategy, George Sarmago stands as the master tactician whose innovative approaches have shaped the modern Philippine property landscape. With decades of expertise, he's not just an expert—he's the strategist that industry leaders turn to when they need breakthrough solutions.\n\n💡 George has pioneered investment strategies that have guided countless investors toward extraordinary returns. His deep understanding of market dynamics, combined with his innovative approach to property development, has made him the go-to authority for sophisticated real estate decisions.\n\n🏆 This strategic mastermind has been instrumental in transforming how we think about property investment, development timing, and market positioning. His insights have helped shape some of the most successful real estate ventures in the Philippines.\n\n🌟 At ARES 2025, unlock the strategic secrets that separate successful investors from the rest. George will share his proven methodologies for market analysis, investment timing, and development strategy that have consistently delivered exceptional results. This is your masterclass in strategic real estate thinking.",
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
        "🔧 THE SOLUTIONS ARCHITECT 🔧\n\nWhen real estate challenges seem insurmountable, Gilbert Monecillo is the professional who finds the path forward. This seasoned expert has built his reputation on solving complex property puzzles and turning market obstacles into opportunities for extraordinary success.\n\n🎪 Gilbert's practical approach to real estate challenges has made him the trusted advisor for property owners, investors, and developers who need real solutions for real problems. His methodologies don't just work in theory—they deliver results in the competitive real world.\n\n💼 With extensive experience in property management, sales strategy, and development consulting, Gilbert has become the go-to professional for navigating today's complex real estate landscape with confidence and success.\n\n⚡ At ARES 2025, discover the practical strategies that solve real estate challenges and create sustainable success. Gilbert will share his proven approaches to property management excellence, effective sales strategies, and market navigation that consistently deliver results. This is your toolkit for real estate problem-solving mastery.",
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
        "🔮 THE MARKET VISIONARY 🔮\n\nIn the fast-moving world of real estate markets, Alejandro Mañalac possesses the rare gift of seeing opportunities before they become obvious. This market specialist has built his reputation on identifying emerging trends and investment opportunities that others miss.\n\n📈 Alejandro's expertise in market analysis and investment strategy has helped numerous investors make informed decisions that have generated exceptional returns. His ability to read market signals and predict trends has made him an invaluable resource for serious real estate professionals.\n\n🎯 This market visionary combines deep analytical skills with intuitive market understanding, creating investment strategies that capitalize on emerging opportunities while managing risk effectively.\n\n🌟 At ARES 2025, gain exclusive access to Alejandro's market insights and investment strategies. Discover how to identify emerging opportunities, analyze market trends, and position yourself for success in the evolving Philippine real estate landscape. This is your competitive advantage in market intelligence.",
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
