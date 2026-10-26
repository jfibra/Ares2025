"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users, Target, Award, Globe, ArrowRight, ChevronDown, MapPin } from "lucide-react"
import { Reveal, Stagger, staggerItem } from "./motion"
import { homepageHighlights } from "@/lib/gallery-albums"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const features = [
  {
    icon: Users,
    title: "Industry Leaders",
    description: "Connect with top executives, developers, and innovators from across Asia's real estate sector.",
    from: "#e22837",
    to: "#672e91",
  },
  {
    icon: Target,
    title: "Strategic Insights",
    description: "Gain valuable market intelligence and strategic perspectives to drive your business forward.",
    from: "#0078b6",
    to: "#672e91",
  },
  {
    icon: Award,
    title: "Expert Knowledge",
    description: "Learn from renowned speakers sharing their expertise and best practices.",
    from: "#f59e0b",
    to: "#e22837",
  },
  {
    icon: Globe,
    title: "Regional Network",
    description: "Build lasting connections with professionals from Thailand, the Philippines, and beyond.",
    from: "#672e91",
    to: "#0078b6",
  },
]

// "What Makes ARES Special" copy, presented as a numbered list.
const pillars = [
  {
    title: "A transformative experience",
    text: "ARES is more than just a conference. It's a transformative experience that brings together the brightest minds in Asian real estate. Our biennial summit creates an unparalleled opportunity for learning, networking, and business development.",
  },
  {
    title: "A curated lineup",
    text: "We carefully curate our speaker lineup to include industry pioneers, successful entrepreneurs, and innovative thought leaders who share practical insights and actionable strategies.",
  },
  {
    title: "Sessions built for value",
    text: "From interactive workshops to panel discussions, every session is designed to provide maximum value and foster meaningful connections that extend far beyond the event.",
  },
]

/** Three real event photos for the hero: one tall, two stacked beside it. */
const heroPhotos = homepageHighlights.slice(0, 3)

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
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
                About Us
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
                className="text-5xl font-black leading-[1.02] tracking-tight md:text-6xl xl:text-7xl"
              >
                Where the best in
                <br />
                real estate <span className="gradient-text">come together.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl"
              >
                ARES 2027 is more than a summit. It is a global gathering of real estate leaders, brokers,
                entrepreneurs, and innovators who believe the future of real estate is built through collaboration,
                innovation, and continuous learning.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/speakers"
                  className="group inline-flex min-h-[48px] items-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-gray-900 transition-colors hover:bg-[#ffd700]"
                >
                  Meet the speakers
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex min-h-[48px] items-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  View the gallery
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-10 flex items-center gap-2 text-sm text-white/50"
              >
                <MapPin size={14} className="text-[#ffd700]" />
                Bangkok, Thailand · July 13, 2027
              </motion.p>
            </div>

            {/* Photos */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
              className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-3 lg:aspect-auto lg:h-[520px]"
            >
              {heroPhotos.map((photo, i) => (
                <motion.div
                  key={photo.thumb}
                  variants={{
                    hidden: { opacity: 0, scale: 0.94, y: 16 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
                  }}
                  className={`overflow-hidden rounded-2xl bg-white/5 ${i === 0 ? "row-span-2" : ""}`}
                >
                  <img
                    src={i === 0 ? photo.full : photo.thumb}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          aria-hidden
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">Explore</span>
          <ChevronDown size={22} className="text-white/70 motion-safe:animate-bounce" />
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ARES 2027 STATEMENT (highlighted)                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28">
        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#0b0f19] text-white shadow-[0_40px_100px_rgba(15,23,42,0.25)]">
              {/* Brand gradient edge + glows */}
              <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#e22837] via-[#672e91] to-[#0078b6]" />
              <div aria-hidden className="dot-grid absolute inset-0 opacity-20" />
              <div
                aria-hidden
                className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#0078b6]/30 blur-[100px]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#e22837]/25 blur-[100px]"
              />

              <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:p-16">
                {/* Left: event lockup */}
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                      <span className="h-px w-8 bg-gradient-to-r from-[#ffd700] to-[#e22837]" />
                      ARES 2027
                    </p>
                    <h2 className="mt-5 text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
                      Asian Real Estate <span className="gradient-text">Summit</span>
                    </h2>
                    <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">Where</dt>
                        <dd className="mt-2 text-lg font-bold">Bangkok, Thailand</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">When</dt>
                        <dd className="mt-2 text-lg font-bold">July 13, 2027</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Tagline */}
                  <div className="flex flex-wrap gap-2">
                    {["Think global.", "Innovate beyond.", "Grow together."].map((word, i) => (
                      <span
                        key={word}
                        className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold uppercase tracking-wider"
                        style={{
                          color: ["#ffd700", "#ffffff", "#5fc4ff"][i],
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: statement */}
                <div className="space-y-6 text-base leading-relaxed text-white/80 sm:text-lg">
                  <p className="text-xl font-semibold leading-snug text-white sm:text-2xl">
                    Building on the success of ARES 2023 and 2025, this biennial event brings together international
                    speakers, groundbreaking technologies, successful business systems, and fresh ideas from real estate
                    markets around the world.
                  </p>
                  <p>
                    Discover new opportunities, explore international markets, embrace emerging technologies, build
                    global partnerships, and strengthen the bonds that unite our team.
                  </p>
                  <p className="border-l-2 border-[#ffd700] pl-5 italic text-white/90">
                    Because growth happens when we look beyond what we know, learn from the best, and dare to think
                    beyond boundaries.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href="/ares-2027-interest"
                      className="group inline-flex min-h-[48px] items-center gap-3 rounded-full bg-[#ffd700] px-6 text-sm font-semibold text-gray-900 transition-colors hover:bg-white"
                    >
                      Register your interest
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* MISSION + FEATURES                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-gray-50 py-24 md:py-32">
        <div
          aria-hidden
          className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        />

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
            <Reveal>
              <p className="mb-5 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0078b6]">
                <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                Our mission
                <span className="h-px w-8 bg-gradient-to-r from-[#0078b6] to-[#e22837]" />
              </p>
              <h2 className="text-3xl font-bold leading-snug tracking-tight text-gray-900 md:text-4xl lg:text-[2.75rem] lg:leading-[1.2]">
                To create a dynamic platform for knowledge exchange, networking, and collaboration among real estate
                professionals <span className="gradient-text-brand">across Asia.</span>
              </h2>
            </Reveal>
          </div>

          <Stagger className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4" amount={0.15}>
            {features.map(({ icon: Icon, title, description, from, to }, i) => (
              <motion.div key={title} variants={staggerItem} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-[28px] border border-gray-200/80 bg-white p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)] md:p-8">
                  {/* Soft colour wash that appears on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-20"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  />

                  {/* Large faint index */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-6 top-4 text-6xl font-black leading-none tracking-tight text-gray-100 transition-colors duration-500 group-hover:text-gray-200/80"
                  >
                    0{i + 1}
                  </span>

                  <div
                    className="relative grid h-14 w-14 place-items-center rounded-2xl text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-6deg]"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="relative mt-8 text-xl font-bold text-gray-900">{title}</h3>
                  <p className="relative mt-3 leading-relaxed text-gray-600">{description}</p>

                  {/* Accent rule that grows on hover */}
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-7 right-7 h-[3px] origin-left scale-x-0 rounded-t-full transition-transform duration-500 ease-out group-hover:scale-x-100 md:left-8 md:right-8"
                    style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
                  />
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* WHAT MAKES ARES SPECIAL                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-[#0b0f19] py-20 text-white md:py-28">
        <div aria-hidden className="dot-grid absolute inset-0 opacity-30" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full bg-[#0078b6]/20 blur-[120px]"
        />

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
            <div>
              <Reveal>
                <p className="mb-4 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                  <span className="h-px w-8 bg-gradient-to-r from-[#ffd700] to-[#e22837]" />
                  Why ARES
                </p>
                <h2 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                  What makes ARES <span className="gradient-text">special</span>
                </h2>
              </Reveal>

              <ol className="mt-12 divide-y divide-white/10 border-y border-white/10">
                {pillars.map(({ title, text }, i) => (
                  <Reveal key={title} as="li" delay={i * 0.08} className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr]">
                    <span className="text-sm font-semibold tabular-nums tracking-widest text-[#ffd700]">0{i + 1}</span>
                    <div>
                      <h3 className="text-xl font-bold">{title}</h3>
                      <p className="mt-3 leading-relaxed text-white/70">{text}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>

            {/* Poster */}
            <Reveal direction="left" amount={0.2} className="lg:sticky lg:top-28 lg:self-start">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <img
                  src="/about-mission.jpg"
                  alt="ARES 2027 Asian Real Estate Summit poster"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
                />
                <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm">
                  Biennial summit
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

    </div>
  )
}

export default AboutPage
