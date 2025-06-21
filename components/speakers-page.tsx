"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, Award, Users, ExternalLink, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Speaker {
  id: number
  name: string
  title: string
  company: string
  image: string
  description: string
  slug: string
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
      description:
        "There's a reason the whole world is watching Filipino Homes. It all started with one man—Anthony Leuterio. He's not just our founder—he's also the 2024 International REALTOR® of the Year, recognized by the National Association of REALTORS® in the USA. From starting in sales to building the country's biggest real estate network (with over 30,000 agents nationwide!), he has changed how Filipinos buy, sell, and invest in property. At ARES 2025, we're proud to have him lead the charge. He's proof that when you build with vision and heart, anything is possible.",
    },
    {
      id: 2,
      name: "Cesar Wee Jr.",
      title: "President",
      company: "WeeComm",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Cesar+Wee+Jr..png",
      slug: "cesar-wee-jr",
      description:
        "Not all developers are the same. Some build structures. Others build communities. Cesar Wee Jr. is definitely the latter. As President of WeeComm, he's behind some of the most creative and thoughtful residential spaces in the country. His work blends innovation and culture, building homes that feel personal—and that's why he stands out. At ARES 2025, he's joining us to share how collaboration (not competition!) is the real secret to lasting growth.",
    },
    {
      id: 3,
      name: "Jose 'Joe' R. Soberano III",
      title: "2023 Real Estate Personality of the Year",
      company: "Cebu Landmasters",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Joe+Soberano.png",
      slug: "jose-joe-soberano-iii",
      description:
        "Some stories start in big cities. Joe Soberano's started in Cebu—and grew from there. As founder of Cebu Landmasters, Joe has spent decades developing real estate that truly reflects local needs. He's helped build over 100 projects in more than 16 cities across VisMin. This 2023 Real Estate Personality of the Year is joining ARES 2025 to share how real estate done right can transform lives, regions, and industries.",
    },
    {
      id: 4,
      name: "Carson Choa",
      title: "Chief Operating Officer",
      company: "WeeComm",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Carson+Choa.png",
      slug: "carson-choa",
      description:
        "Behind every great real estate brand is a strong operator. Meet Carson Choa—COO of WeeComm, and the guy who helped take the company from a niche builder to a national name. He's not all spreadsheets and systems. Carson believes in building with purpose—real homes for real families. At ARES 2025, he'll share how teamwork, mentorship, and a good heart can help scale a business the right way.",
    },
    {
      id: 5,
      name: "Samantha Manigsaca",
      title: "AVP for Hospitality",
      company: "AppleOne Properties",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Samantha+Manigsaca.png",
      slug: "samantha-manigsaca",
      description:
        "Real estate isn't just about homes—it's also about how people live, rest, and feel at home. That's where Samantha Manigsaca shines. As AVP for Hospitality at AppleOne Properties, Samantha blends real estate with hotel-style living—creating developments that offer comfort, class, and long-term value. She's worked with some of the biggest global hotel brands, and at ARES 2025, she'll show us how hospitality can make real estate even more exciting for investors and homebuyers.",
    },
    {
      id: 6,
      name: "May Antonette Leuterio",
      title: "Managing Director",
      company: "Rent.ph",
      image:
        "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/May+Antonette+Leuterio.png",
      slug: "may-antonette-leuterio",
      description:
        "Rental real estate is booming—and May Antonette Leuterio is leading the way. She's the Managing Director of Rent.ph, the country's top rental platform, helping thousands of OFWs and property owners connect with the right tenants faster and easier. But she's not just about tech. May's all heart. She trains agents. Builds tools. And creates systems that actually work in the real world. At ARES 2025, May will talk about how to grow rental income, reach overseas buyers, and future-proof your rental business.",
    },
    {
      id: 7,
      name: "Dr. Sopon Pornchokchai",
      title: "Real Estate Valuation Expert",
      company: "Agency for Real Estate Affairs (Thailand)",
      image:
        "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Dr.+Sopon+Pornchokchai.png",
      slug: "dr-sopon-pornchokchai",
      description:
        "What do you get when you invite Asia's leading authority on real estate valuation to speak at the biggest real estate summit of the year? You get serious knowledge. Practical solutions. And a whole new way to look at property. Dr. Sopon Pornchokchai has over 40 years of experience in more than 30 countries—and he's not just teaching theory. He helped build Thailand's first computer-assisted mass appraisal system and has advised the World Bank, UN-Habitat, and governments across Southeast Asia.",
    },
    {
      id: 8,
      name: "Azela Honor",
      title: "Team Leader, Team A",
      company: "Filipino Homes",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Azela+Honor.png",
      slug: "azela-honor",
      description:
        "Meet one of Filipino Homes' top performers and team leaders. Azela Honor represents the new generation of real estate professionals who combine traditional relationship-building with modern digital strategies. As Team Leader of Team A, she's mentored dozens of agents and helped them achieve their real estate dreams while serving Filipino families nationwide.",
    },
    {
      id: 9,
      name: "George Sarmago",
      title: "Real Estate Expert",
      company: "Industry Leader",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/George+Sarmago.png",
      slug: "george-sarmago",
      description:
        "George Sarmago brings decades of real estate expertise to ARES 2025. Known for his innovative approaches to property development and investment strategies, he has been instrumental in shaping the modern Philippine real estate landscape. His insights on market trends and investment opportunities have guided countless investors and developers.",
    },
    {
      id: 10,
      name: "Gilbert Monecillo",
      title: "Real Estate Professional",
      company: "Industry Expert",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Gilbert+Monecillo.png",
      slug: "gilbert-monecillo",
      description:
        "Gilbert Monecillo is a seasoned real estate professional with extensive experience in property management, sales, and development. His practical approach to real estate challenges and solutions has made him a sought-after speaker and consultant in the industry. At ARES 2025, he'll share valuable insights on navigating today's competitive real estate market.",
    },
    {
      id: 11,
      name: "Alejandro Mañalac",
      title: "Real Estate Specialist",
      company: "Market Expert",
      image:
        "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Alejandro+Ma%C3%B1alac.png",
      slug: "alejandro-manalac",
      description:
        "Alejandro Mañalac brings a wealth of knowledge in real estate market analysis and investment strategies. His expertise in identifying emerging market opportunities and trends has helped numerous investors make informed decisions. Join him at ARES 2025 as he shares his insights on the future of Philippine real estate.",
    },
  ]

  const selectedSpeaker = speakerPosters.find((speaker) => speaker.slug === selectedSpeakerSlug)
  const suggestedSpeakers = speakerPosters.filter((speaker) => speaker.slug !== selectedSpeakerSlug).slice(0, 3)

  useEffect(() => {
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
  }, [selectedSpeakerSlug])

  const handleShare = async (speaker: Speaker) => {
    const shareData = {
      title: `${speaker.name} - ARES 2025 Speaker`,
      text: `Meet ${speaker.name}, ${speaker.title} at ${speaker.company}. Speaking at ARES 2025!`,
      url: `${window.location.origin}/speakers?speaker=${speaker.slug}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(shareData.url)
      alert("Link copied to clipboard!")
    }
  }

  // Individual Speaker View
  if (selectedSpeaker) {
    return (
      <div className="min-h-screen relative">
        {/* Enhanced Background with Colors */}
        <div
          className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url(https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/TEMPLE.png)",
          }}
        />

        {/* Colorful Gradient Overlays */}
        <div className="fixed top-0 left-0 w-full h-full z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-purple-800/75 via-blue-900/80 to-slate-900/90" />
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-br from-[#e22837]/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-[#0078b6]/20 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-1/2 bg-gradient-to-t from-[#ffd700]/10 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-20 pb-20">
          {/* Back Button */}
          <div className="pt-32 pb-8">
            <div className="container mx-auto px-4">
              <Link href="/speakers">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  <ArrowLeft className="mr-2" size={20} />
                  Back to Speakers
                </Button>
              </Link>
            </div>
          </div>

          {/* Speaker Detail */}
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
                {/* Speaker Poster */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd700]/20 via-[#e22837]/20 to-[#0078b6]/20 rounded-3xl blur-2xl" />
                  <img
                    src={selectedSpeaker.image || "/placeholder.svg"}
                    alt={selectedSpeaker.name}
                    className="relative w-full h-auto rounded-2xl shadow-2xl border border-[#ffd700]/30"
                  />
                </div>

                {/* Speaker Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-[#ffd700] mb-4 font-['Lato']">
                      {selectedSpeaker.name}
                    </h1>
                    <h2 className="text-xl lg:text-2xl text-white/95 font-semibold mb-3">{selectedSpeaker.title}</h2>
                    <h3 className="text-lg text-[#ffd700]/80 font-semibold italic uppercase tracking-wide">
                      {selectedSpeaker.company}
                    </h3>
                  </div>

                  <div className="h-0.5 bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent rounded-full" />

                  <div className="text-white/90 text-lg leading-relaxed">
                    <p>{selectedSpeaker.description}</p>
                  </div>

                  {/* Share Button */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleShare(selectedSpeaker)}
                      className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white"
                    >
                      <Share2 className="mr-2" size={20} />
                      Share Speaker
                    </Button>
                    <Button variant="outline" className="border-[#ffd700]/30 text-[#ffd700] hover:bg-[#ffd700]/10">
                      <ExternalLink className="mr-2" size={20} />
                      Learn More
                    </Button>
                  </div>

                  {/* Featured Badge */}
                  <div className="bg-gradient-to-r from-[#ffd700]/10 to-[#ffd700]/5 p-6 rounded-2xl border border-[#ffd700]/30">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="text-[#ffd700]" size={20} />
                      <p className="text-[#ffd700]/90 font-semibold uppercase tracking-wide">
                        Featured Speaker at ARES 2025
                      </p>
                      <Star className="text-[#ffd700]" size={20} />
                    </div>
                    <p className="text-white/70 text-sm text-center">Bangkok, Thailand • July 2, 2025</p>
                  </div>
                </div>
              </div>

              {/* Suggested Speakers */}
              <div className="mt-20">
                <h3 className="text-3xl font-bold text-[#ffd700] mb-8 text-center">Other Featured Speakers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {suggestedSpeakers.map((speaker) => (
                    <Link key={speaker.id} href={`/speakers?speaker=${speaker.slug}`}>
                      <div className="group cursor-pointer">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-[#ffd700]/20 hover:border-[#ffd700]/60 transition-all duration-400 hover:-translate-y-2 hover:scale-105">
                          <img
                            src={speaker.image || "/placeholder.svg"}
                            alt={speaker.name}
                            className="w-full h-auto block transition-transform duration-400 group-hover:scale-105"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <h4 className="text-white font-bold text-lg mb-1 truncate">{speaker.name}</h4>
                            <p className="text-[#ffd700] text-sm font-medium truncate">{speaker.title}</p>
                            <p className="text-white/80 text-xs truncate">{speaker.company}</p>
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
      </div>
    )
  }

  // Main Speakers Grid View
  return (
    <div className="min-h-screen relative">
      {/* Enhanced Background with Colors */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url(https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/TEMPLE.png)",
        }}
      />

      {/* Colorful Gradient Overlays */}
      <div className="fixed top-0 left-0 w-full h-full z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-purple-800/75 via-blue-900/80 to-slate-900/90" />
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-br from-[#e22837]/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-[#0078b6]/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-1/2 bg-gradient-to-t from-[#ffd700]/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-[#e22837]/15 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-[#0078b6]/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-[#ffd700]/10 to-transparent rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-20 pb-20">
        {/* Header Section */}
        <div className="pt-32 pb-16 text-center">
          <div className="container mx-auto px-4">
            <div className="mb-8 animate-in fade-in duration-1000">
              <img
                src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
                alt="ARES 2025"
                className="max-w-sm mx-auto h-auto filter drop-shadow-2xl"
              />
            </div>

            <div className="mb-10 animate-in slide-in-from-bottom duration-1000 delay-300">
              <div className="bg-gradient-to-r from-[#e22837] to-[#0078b6] px-8 py-4 rounded-full inline-block shadow-2xl border border-white/20 backdrop-blur-sm">
                <h2 className="text-white font-bold text-lg uppercase tracking-wider">
                  BANGKOK, THAILAND | JULY 2, 2025
                </h2>
              </div>
            </div>

            <div className="animate-in slide-in-from-bottom duration-1000 delay-500">
              <h1 className="text-6xl md:text-8xl font-black text-[#ffd700] mb-4 font-['Lato'] italic leading-tight filter drop-shadow-2xl">
                Meet Our
              </h1>
              <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-[#ffd700] via-[#ffed4e] to-[#f59e0b] bg-clip-text text-transparent mb-8 font-['Lato'] italic leading-tight filter drop-shadow-lg">
                Speakers
              </h1>
            </div>

            <div className="animate-in slide-in-from-bottom duration-1000 delay-700">
              <p className="text-white/95 text-xl max-w-4xl mx-auto leading-relaxed text-shadow-lg">
                Join us for an inspiring lineup of industry leaders, innovators, and visionaries who will share their
                expertise and insights at the Asian Real Estate Summit 2025.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto animate-in slide-in-from-bottom duration-1000 delay-1000">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-[#ffd700]/30 hover:border-[#ffd700]/60 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <Users className="text-[#ffd700] mr-2" size={28} />
                  <h3 className="text-3xl font-bold text-[#ffd700]">11+</h3>
                </div>
                <p className="text-white/80 font-medium">Expert Speakers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-[#e22837]/30 hover:border-[#e22837]/60 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <Award className="text-[#e22837] mr-2" size={28} />
                  <h3 className="text-3xl font-bold text-[#e22837]">40+</h3>
                </div>
                <p className="text-white/80 font-medium">Years Experience</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-[#0078b6]/30 hover:border-[#0078b6]/60 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <Star className="text-[#0078b6] mr-2" size={28} />
                  <h3 className="text-3xl font-bold text-[#0078b6]">2</h3>
                </div>
                <p className="text-white/80 font-medium">Days of Insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Speakers Grid */}
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
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-[#ffd700]/20 hover:border-[#ffd700]/60 transition-all duration-400 hover:-translate-y-4 hover:scale-105 hover:shadow-3xl group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#ffd700]/20 via-[#e22837]/20 to-[#0078b6]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 -z-10" />

                  <img
                    src={speaker.image || "/placeholder.svg?height=600&width=400&text=Speaker+Poster"}
                    alt={speaker.name}
                    className="w-full h-auto block transition-transform duration-400 group-hover:scale-105 relative z-20"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-30" />
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-600 group-hover:left-full z-40" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-50">
                    <h3 className="text-white font-bold text-lg mb-1 truncate">{speaker.name}</h3>
                    <p className="text-[#ffd700] text-sm font-medium truncate">{speaker.title}</p>
                    <p className="text-white/80 text-xs truncate">{speaker.company}</p>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="mt-4">
                  <Link href={`/speakers?speaker=${speaker.slug}`}>
                    <Button className="w-full bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Section */}
          <div className="text-center py-20 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
              <h3 className="text-3xl font-bold text-[#ffd700] mb-6">More Speakers Coming Soon!</h3>
              <p className="text-white/90 text-xl leading-relaxed">
                We're excited to announce additional industry experts and thought leaders who will be joining us at ARES
                2025. Stay tuned for more updates as we continue to build an incredible lineup of speakers!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpeakersPage
