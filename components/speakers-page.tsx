"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, MapPin, Share2 } from "lucide-react"
import { Reveal } from "@/components/motion"

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
    image: "/speakers/anthony-gerard-leuterio.webp",
    slug: "anthony-gerard-leuterio",
    tagline: "The Visionary Who Built an Empire",
    achievements: ["2024 International REALTOR® of the Year", "30,000+ Agents Nationwide", "Industry Pioneer"],
    expertise: ["Real Estate Leadership", "Network Building", "Market Innovation"],
    description:
      "THE LEGEND HIMSELF\n\nThere's a reason the whole world is watching Filipino Homes.\n\nIt all started with one man—Anthony Leuterio.\n\nHe's not just our founder—he's also the 2024 International REALTOR® of the Year, recognized by the National Association of REALTORS® in the USA.\n\nFrom starting in sales to building the country's biggest real estate network (with over 30,000 agents nationwide!), he has changed how Filipinos buy, sell, and invest in property.\n\nAt ARES 2025, we're proud to have him lead the charge. He's proof that when you build with vision and heart, anything is possible.\n\nWatch this space—more global partnerships, more wins, and more opportunities are coming.\n\n#ARES2025 #FilipinoHomes #RealEstateWithPurpose",
  },
  {
    id: 2,
    name: "Cesar Wee Jr.",
    title: "President",
    company: "WeeComm",
    image: "/speakers/cesar-wee-jr.webp",
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
    image: "/speakers/jose-joe-soberano-iii.webp",
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
    image: "/speakers/carson-choa.webp",
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
    image: "/speakers/yuriy-braterskyy.webp",
    slug: "yuriy-braterskyy",
    tagline: "The AI‑Powered Proptech Pioneer",
    achievements: ["Proptech Startup Founder", "AI-Powered Real Estate Innovator", "APAC Tech Conference Speaker"],
    expertise: ["AI Automation in Real Estate", "Digital Platform Scaling", "Startup Growth Strategy"],
    description:
      "What happens when real estate meets AI?\n\nYou get Yuriy Braterskyy.\n\nHe's the CEO of Superagent.co, a rising tech company that's changing how property deals are done.\n\nThink of it like having a smart assistant in your pocket—helping agents close faster, answer better, and stay one step ahead.\n\nAt ARES 2025, Yuriy will show us how tech isn't just for the big guys. With the right tools, every broker and agent can work smarter—not harder.\n\nFilipino Homes believes in the same thing: providing agents with the support they need to thrive in today's digital world.\n\n#ARES2025 #Superagent #FilipinoHomes",
  },
  {
    id: 6,
    name: "Samantha Manigsaca",
    title: "AVP for Hospitality",
    company: "AppleOne Properties",
    image: "/speakers/samantha-manigsaca.webp",
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
    image: "/speakers/may-antonette-leuterio.webp",
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
    image: "/speakers/alejandro-manalac.webp",
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
    image: "/speakers/elddie-benigay.webp",
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
    image: "/speakers/gilbert-monecillo.webp",
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
    image: "/speakers/george-sarmago.webp",
    slug: "george-sarmago",
    tagline: "The Strategic Innovator",
    achievements: ["Decades of Market Expertise", "Investment Strategy Pioneer", "Development Innovation Leader"],
    expertise: ["Investment Strategy", "Market Analysis", "Development Planning"],
    description:
      "George Ryan Sarmago didn't start in real estate until he was 34 years old. Today? He's closed over ₱2 billion in sales.\n\nFrom corporate bulk deals to luxury listings, George has mastered how to read clients—and turn 'let me think about it' into 'where do I sign?'\n\nAt ARES 2025, he's sharing his secret playbook: decoding buyer psychology, building a personal brand, and selling with empathy.\n\nGeorge believes real estate can give you more than income—it can provide you with freedom, purpose, and a better life for your family.\n\n#ARES2025 #BuyerPsychology #FilipinoHomes",
  },
  {
    id: 12,
    name: "Azela Honor",
    title: "Team Leader, Team A",
    company: "Filipino Homes",
    image: "/speakers/azela-honor.webp",
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
    image: "/speakers/dr-sopon-pornchokchai.webp",
    slug: "dr-sopon-pornchokchai",
    tagline: "The Valuation Virtuoso",
    achievements: ["40+ Years Experience", "30+ Countries Expertise", "World Bank Advisor"],
    expertise: ["Property Valuation", "Market Analysis", "International Standards"],
    description:
      "What do you get when you invite Asia's leading authority on real estate valuation to speak at the biggest real estate summit of the year?\n\nYou get serious knowledge. Practical solutions. And a whole new way to look at property.\n\nDr. Sopon Pornchokchai has over 40 years of experience in more than 30 countries—and he's not just teaching theory. He helped build Thailand's first computer-assisted mass appraisal system and has advised the World Bank, UN-Habitat, and governments across Southeast Asia. His work bridges the realms of real estate, public policy, and economic growth.\n\nAt ARES 2025, we're proud to welcome Dr. Sopon as he shares how strong valuation systems can boost investor trust and help developing nations grow faster and smarter.\n\nThis is the kind of global insight we want every Filipino Homes agent and developer to hear. \n\nBecause when we grow together, we grow stronger.\n\nWant to build something bigger than just your sales target?\nWant to partner with real estate leaders who think long-term?\n\nThen, ARES 2025 in Bangkok is where you need to be.",
  },
]

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Four posters for the hero, shown whole in a 2x2 grid. The posters are square. */
const heroPosters = speakerPosters.slice(0, 4)

/** Eyebrow + heading pair used at the top of each section. */
function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  dark = false,
}: {
  eyebrow: string
  title: string
  accent: string
  description?: string
  dark?: boolean
}) {
  return (
    <Reveal className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div>
        <p
          className={`mb-3 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] ${
            dark ? "text-white/60" : "text-[#0078b6]"
          }`}
        >
          <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
          {eyebrow}
        </p>
        <h2 className="text-3xl font-bold leading-tight md:text-4xl">
          {title} <span className={dark ? "gradient-text" : "gradient-text-brand"}>{accent}</span>
        </h2>
      </div>
      {description ? (
        <p className={`max-w-sm md:text-right ${dark ? "text-white/60" : "text-gray-500"}`}>{description}</p>
      ) : null}
    </Reveal>
  )
}

/** Poster on top, name and role below. The posters carry their own branding, so nothing is overlaid on them. */
function SpeakerCard({ speaker, index }: { speaker: Speaker; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.07, ease: EASE_OUT }}
    >
      <Link
        href={`/speakers?speaker=${speaker.slug}`}
        aria-label={`View profile: ${speaker.name}`}
        className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#0078b6] focus-visible:ring-offset-4"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 shadow-[0_10px_40px_rgba(15,23,42,0.08)] transition-shadow duration-500 group-hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <img
            src={speaker.image || "/placeholder.svg"}
            alt={`${speaker.name}, ${speaker.title} at ${speaker.company}`}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <span className="absolute right-3 top-3 grid h-9 w-9 scale-75 place-items-center rounded-full bg-white text-gray-900 opacity-0 shadow-lg transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
            <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-tight">{speaker.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{speaker.title}</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400">{speaker.company}</p>
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums tracking-widest text-gray-300">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

function ShareButton({ speaker, dark = true }: { speaker: Speaker; dark?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = `${window.location.origin}/speakers?speaker=${speaker.slug}`
    const shareData = {
      title: `${speaker.name} – ARES Speaker`,
      text: `${speaker.tagline} – ${speaker.name}, ${speaker.title} @ ${speaker.company}`,
      url,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (_) {
        // The visitor dismissed the share sheet.
      }
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex min-h-[48px] items-center gap-2 rounded-full border px-6 text-sm font-semibold transition-colors ${
        dark
          ? "border-white/25 text-white hover:border-white hover:bg-white/10"
          : "border-gray-300 text-gray-900 hover:border-gray-900"
      }`}
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Link copied" : "Share"}
    </button>
  )
}

export default function SpeakersPage() {
  const searchParams = useSearchParams()
  const selectedSpeakerSlug = searchParams.get("speaker")
  const selectedSpeaker = speakerPosters.find((s) => s.slug === selectedSpeakerSlug)

  // Scroll to top when speaker changes
  useEffect(() => {
    if (selectedSpeakerSlug) window.scrollTo({ top: 0, behavior: "smooth" })
  }, [selectedSpeakerSlug])

  // ---- Individual speaker ---------------------------------------------------
  if (selectedSpeaker) {
    const s = selectedSpeaker
    const position = speakerPosters.indexOf(s)
    // The next three speakers in lineup order, wrapping around. Deterministic,
    // so the server and client render the same suggestions.
    const suggested = [1, 2, 3].map((offset) => speakerPosters[(position + offset) % speakerPosters.length])

    return (
      <div className="min-h-screen bg-white font-sans text-gray-900">
        <section className="relative overflow-hidden bg-[#0b0f19] text-white">
          <div aria-hidden className="dot-grid absolute inset-0 opacity-30" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-0 h-[26rem] w-[26rem] rounded-full bg-[#0078b6]/25 blur-[120px]"
          />

          <div className="container relative z-10 mx-auto px-4 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="mb-10"
              >
                <Link
                  href="/speakers"
                  className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
                >
                  <ArrowLeft size={16} />
                  All speakers
                </Link>
              </motion.div>

              <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
                <div>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05, ease: EASE_OUT }}
                    className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60"
                  >
                    <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                    Speaker {String(position + 1).padStart(2, "0")} of {speakerPosters.length}
                  </motion.p>

                  <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
                    className="text-4xl font-black leading-[1.05] tracking-tight md:text-6xl"
                  >
                    {s.name}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
                    className="gradient-text mt-5 text-xl font-bold md:text-2xl"
                  >
                    {s.tagline}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT }}
                    className="mt-4 text-lg text-white/70"
                  >
                    {s.title} · {s.company}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: EASE_OUT }}
                    className="mt-10 flex flex-wrap gap-3"
                  >
                    <ShareButton speaker={s} />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
                  className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.5)] lg:ml-auto"
                >
                  <img src={s.image || "/placeholder.svg"} alt={`${s.name} poster`} className="h-auto w-full" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile */}
        <section className="border-b border-gray-100 bg-white py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="space-y-10 lg:sticky lg:top-28 lg:self-start">
                <Reveal>
                  <p className="mb-4 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0078b6]">
                    <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                    Achievements
                  </p>
                  <ul className="divide-y divide-gray-200 border-y border-gray-200">
                    {s.achievements.map((a) => (
                      <li key={a} className="flex items-start gap-3 py-3 font-medium">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e22837]" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="mb-4 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0078b6]">
                    <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                    Expertise
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {s.expertise.map((e) => (
                      <span
                        key={e}
                        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.1} amount={0.1}>
                <p className="mb-4 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0078b6]">
                  <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                  Biography
                </p>
                <div className="space-y-5">
                  {s.description.split("\n\n").map((p, i) => (
                    <p key={i} className={`leading-relaxed ${i === 0 ? "text-xl font-semibold md:text-2xl" : "text-lg text-gray-600"}`}>
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Suggested */}
        <section className="bg-white py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <SectionHeading eyebrow="Keep exploring" title="More" accent="speakers" />
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
                {suggested.map((sp) => (
                  <SpeakerCard key={sp.id} speaker={sp} index={speakerPosters.indexOf(sp)} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link
                  href="/speakers"
                  className="group inline-flex min-h-[48px] items-center gap-3 rounded-full bg-gray-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0078b6]"
                >
                  See the full lineup
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ---- Lineup ---------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <section className="relative overflow-hidden bg-[#0b0f19] text-white">
        <div aria-hidden className="dot-grid absolute inset-0 opacity-30" />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-[#0078b6]/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#e22837]/20 blur-[120px]"
        />

        <div className="container relative z-10 mx-auto px-4 pb-16 pt-32 sm:px-6 md:pb-24 md:pt-40">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
                className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60"
              >
                <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                ARES 2025 lineup
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
                className="text-5xl font-black leading-[1.02] tracking-tight md:text-6xl xl:text-7xl"
              >
                The voices
                <br />
                <span className="gradient-text">on stage.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl"
              >
                Industry leaders, visionaries, and experts who shared their insights and strategies at Asia&apos;s
                premier real estate summit.
              </motion.p>

              <motion.dl
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT }}
                className="mt-10 flex flex-wrap gap-x-10 gap-y-4"
              >
                <div>
                  <dd className="text-2xl font-bold leading-none tabular-nums">{speakerPosters.length}</dd>
                  <dt className="mt-1 text-xs uppercase tracking-widest text-white/50">speakers</dt>
                </div>
                <div>
                  <dd className="text-2xl font-bold leading-none">Keynotes &amp; panels</dd>
                  <dt className="mt-1 text-xs uppercase tracking-widest text-white/50">format</dt>
                </div>
                <div>
                  <dd className="flex items-center gap-2 text-2xl font-bold leading-none">
                    <MapPin size={18} className="text-[#ffd700]" />
                    Bangkok
                  </dd>
                  <dt className="mt-1 text-xs uppercase tracking-widest text-white/50">July 2, 2025</dt>
                </div>
              </motion.dl>
            </div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
              className="grid grid-cols-2 gap-3"
            >
              {heroPosters.map((speaker) => (
                <motion.div
                  key={speaker.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.94, y: 16 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
                  }}
                  className="overflow-hidden rounded-2xl bg-white/5"
                >
                  <Link href={`/speakers?speaker=${speaker.slug}`} aria-label={`View profile: ${speaker.name}`}>
                    <img
                      src={speaker.image}
                      alt=""
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-700 ease-out hover:scale-105"
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lineup grid */}
      <section className="bg-white py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Meet the speakers"
              title="The full"
              accent="lineup"
              description="Tap any speaker to read their story, achievements and areas of expertise."
            />

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4">
              {speakerPosters.map((s, idx) => (
                <SpeakerCard key={s.id} speaker={s} index={idx} />
              ))}

              {/* Placeholder for the next announcement */}
              <Reveal amount={0.2}>
                <div className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Stay tuned</span>
                  <p className="mt-3 text-lg font-bold">More speakers to be announced</p>
                  <p className="mt-2 text-sm text-gray-500">
                    We&apos;re adding more industry experts and thought leaders to the lineup.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
