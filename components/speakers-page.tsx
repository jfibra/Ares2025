"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

interface Speaker {
  id: number
  name: string
  title: string
  company: string
  image: string
  description: string
}

function SpeakersPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [visiblePosters, setVisiblePosters] = useState(new Set<number>())
  const observerRef = useRef<IntersectionObserver | null>(null)

  const speakerPosters: Speaker[] = [
    {
      id: 1,
      name: "Anthony Gerard Leuterio",
      title: "2024 International REALTOR® of the Year",
      company: "Filipino Homes",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Anthony+Leuterio.png",
      description:
        "There's a reason the whole world is watching Filipino Homes. It all started with one man—Anthony Leuterio. He's not just our founder—he's also the 2024 International REALTOR® of the Year, recognized by the National Association of REALTORS® in the USA. From starting in sales to building the country's biggest real estate network (with over 30,000 agents nationwide!), he has changed how Filipinos buy, sell, and invest in property. At ARES 2025, we're proud to have him lead the charge. He's proof that when you build with vision and heart, anything is possible.",
    },
    {
      id: 2,
      name: "Cesar Wee Jr.",
      title: "President",
      company: "WeeComm",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Cesar+Wee+Jr..png",
      description:
        "Not all developers are the same. Some build structures. Others build communities. Cesar Wee Jr. is definitely the latter. As President of WeeComm, he's behind some of the most creative and thoughtful residential spaces in the country. His work blends innovation and culture, building homes that feel personal—and that's why he stands out. At ARES 2025, he's joining us to share how collaboration (not competition!) is the real secret to lasting growth.",
    },
    {
      id: 3,
      name: "Jose 'Joe' R. Soberano III",
      title: "2023 Real Estate Personality of the Year",
      company: "Cebu Landmasters",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Joe+Soberano.png",
      description:
        "Some stories start in big cities. Joe Soberano's started in Cebu—and grew from there. As founder of Cebu Landmasters, Joe has spent decades developing real estate that truly reflects local needs. He's helped build over 100 projects in more than 16 cities across VisMin. This 2023 Real Estate Personality of the Year is joining ARES 2025 to share how real estate done right can transform lives, regions, and industries.",
    },
    {
      id: 4,
      name: "Carson Choa",
      title: "Chief Operating Officer",
      company: "WeeComm",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Carson+Choa.png",
      description:
        "Behind every great real estate brand is a strong operator. Meet Carson Choa—COO of WeeComm, and the guy who helped take the company from a niche builder to a national name. He's not all spreadsheets and systems. Carson believes in building with purpose—real homes for real families. At ARES 2025, he'll share how teamwork, mentorship, and a good heart can help scale a business the right way.",
    },
    {
      id: 5,
      name: "Samantha Manigsaca",
      title: "AVP for Hospitality",
      company: "AppleOne Properties",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Samantha+Manigsaca.png",
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
      description:
        "What do you get when you invite Asia's leading authority on real estate valuation to speak at the biggest real estate summit of the year? You get serious knowledge. Practical solutions. And a whole new way to look at property. Dr. Sopon Pornchokchai has over 40 years of experience in more than 30 countries—and he's not just teaching theory. He helped build Thailand's first computer-assisted mass appraisal system and has advised the World Bank, UN-Habitat, and governments across Southeast Asia.",
    },
    {
      id: 8,
      name: "Azela Honor",
      title: "Team Leader, Team A",
      company: "Filipino Homes",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Azela+Honor.png",
      description:
        "Meet one of Filipino Homes' top performers and team leaders. Azela Honor represents the new generation of real estate professionals who combine traditional relationship-building with modern digital strategies. As Team Leader of Team A, she's mentored dozens of agents and helped them achieve their real estate dreams while serving Filipino families nationwide.",
    },
    {
      id: 9,
      name: "George Sarmago",
      title: "Real Estate Expert",
      company: "Industry Leader",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/George+Sarmago.png",
      description:
        "George Sarmago brings decades of real estate expertise to ARES 2025. Known for his innovative approaches to property development and investment strategies, he has been instrumental in shaping the modern Philippine real estate landscape. His insights on market trends and investment opportunities have guided countless investors and developers.",
    },
    {
      id: 10,
      name: "Gilbert Monecillo",
      title: "Real Estate Professional",
      company: "Industry Expert",
      image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES_2025_Speakers/Gilbert+Monecillo.png",
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
      description:
        "Alejandro Mañalac brings a wealth of knowledge in real estate market analysis and investment strategies. His expertise in identifying emerging market opportunities and trends has helped numerous investors make informed decisions. Join him at ARES 2025 as he shares his insights on the future of Philippine real estate.",
    },
  ]

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
  }, [])

  const handlePosterClick = (speaker: Speaker) => {
    setSelectedSpeaker(speaker)
  }

  const handleCloseModal = () => {
    setSelectedSpeaker(null)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fixed Background */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-fixed z-0"
        style={{
          backgroundImage: "url(/placeholder.svg?height=1080&width=1920&text=Temple+Background)",
        }}
      />

      {/* Overlay */}
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-black/75 via-slate-800/85 via-indigo-900/65 via-amber-900/75 to-black/85 z-10" />

      {/* Header Section */}
      <div className="pt-32 pb-16 text-center relative z-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <img
              src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
              alt="ARES 2025"
              className="max-w-sm mx-auto h-auto filter drop-shadow-lg"
            />
          </div>
          <div className="bg-gradient-to-r from-[#e22837] to-[#0078b6] px-8 py-4 rounded-full inline-block mb-10 shadow-lg">
            <h2 className="text-white font-bold text-lg uppercase tracking-wider">BANGKOK, THAILAND | JULY 2, 2025</h2>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-[#ffd700] mb-4 font-['Lato'] italic leading-tight">
            Meet Our
          </h1>
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-[#ffd700] via-[#ffed4e] to-[#f59e0b] bg-clip-text text-transparent mb-8 font-['Lato'] italic leading-tight filter drop-shadow-lg">
            Speakers
          </h1>
          <p className="text-white text-xl max-w-4xl mx-auto leading-relaxed">
            Join us for an inspiring lineup of industry leaders, innovators, and visionaries who will share their
            expertise and insights at the Asian Real Estate Summit 2025.
          </p>
        </div>
      </div>

      {/* Speakers Posters Grid */}
      <div className="container mx-auto px-4 pb-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {speakerPosters.map((speaker, index) => (
            <div
              key={speaker.id}
              className={`speaker-poster opacity-0 transform translate-y-12 scale-90 transition-all duration-800 cursor-pointer ${
                visiblePosters.has(speaker.id) ? "opacity-100 translate-y-0 scale-100" : ""
              }`}
              data-poster-id={speaker.id}
              onClick={() => handlePosterClick(speaker)}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-[#ffd700]/20 hover:border-[#ffd700]/60 transition-all duration-400 hover:-translate-y-4 hover:scale-105 hover:shadow-3xl group">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-radial-gradient from-[#ffd700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-10" />
                <img
                  src={speaker.image || "/placeholder.svg?height=600&width=400&text=Speaker+Poster"}
                  alt={speaker.name}
                  className="w-full h-auto block transition-transform duration-400 group-hover:scale-105 relative z-20"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-45 from-transparent via-[#ffd700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-30" />
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-600 group-hover:left-full z-40" />
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="text-center py-20">
          <div className="max-w-3xl mx-auto">
            <p className="text-white text-xl leading-relaxed">
              We're excited to announce additional industry experts and thought leaders who will be joining us at ARES
              2025. Stay tuned for more updates!
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Speaker Detail Modal */}
      {selectedSpeaker && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-black/95 to-slate-800/95 rounded-3xl p-12 max-w-4xl max-h-[90vh] overflow-y-auto m-8 relative backdrop-blur-2xl border-2 border-[#ffd700]/30 shadow-3xl animate-in">
            <div className="absolute -top-5 -left-5 -right-5 -bottom-5 bg-gradient-to-br from-[#ffd700]/5 to-[#ffd700]/2 rounded-4xl -z-10" />

            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-white/80 hover:text-[#ffd700] bg-black/40 hover:bg-[#ffd700]/20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              <div className="relative flex-shrink-0">
                <img
                  src={selectedSpeaker.image || "/placeholder.svg"}
                  alt={selectedSpeaker.name}
                  className="w-64 h-auto rounded-2xl border-3 border-[#ffd700]/40 shadow-2xl hover:border-[#ffd700]/70 transition-all duration-300 hover:scale-105"
                />
                <div className="absolute -top-3 -left-3 -right-3 -bottom-3 bg-radial-gradient from-[#ffd700]/20 to-transparent rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-[#ffd700] font-bold text-3xl md:text-4xl font-['Lato'] mb-6 leading-tight">
                  {selectedSpeaker.name}
                </h2>
                <h3 className="text-white/95 font-semibold text-xl mb-4 leading-snug">{selectedSpeaker.title}</h3>
                <h4 className="text-[#ffd700]/80 font-semibold italic text-lg uppercase tracking-wide">
                  {selectedSpeaker.company}
                </h4>
              </div>
            </div>

            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent my-8 rounded-full" />

            <div className="text-white/90 text-lg leading-relaxed text-justify mb-8">
              <p>{selectedSpeaker.description}</p>
            </div>

            <div className="text-center pt-6 border-t border-[#ffd700]/20">
              <div className="bg-gradient-to-r from-[#ffd700]/10 to-[#ffd700]/5 p-4 rounded-2xl border border-[#ffd700]/30">
                <p className="text-[#ffd700]/90 font-semibold uppercase tracking-wide">
                  Don't miss this speaker at ARES 2025!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpeakersPage
