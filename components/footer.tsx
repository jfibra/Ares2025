"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, ArrowUpRight, ArrowRight } from "lucide-react"
import { Reveal, Stagger, staggerItem, Magnetic } from "./motion"

const FOOTER_LOGO = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+LOGO+WITH+SQUARE+A+(2).png"

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Speakers", href: "/speakers" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact Us", href: "/contact-us" },
]

const socials = [
  { name: "Facebook", href: "https://www.facebook.com/filipinohomes/", icon: Facebook, from: "#1877f2", to: "#0d5dbf" },
  { name: "Instagram", href: "https://www.instagram.com/filipinohomes/", icon: Instagram, from: "#e4405f", to: "#833ab4" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/filipino-homes", icon: Linkedin, from: "#0077b5", to: "#005885" },
  { name: "X", href: "https://x.com/filipinohomes", icon: Twitter, from: "#1da1f2", to: "#0d8bd9" },
]

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-[#070b14] text-white">
      {/* Top gradient hairline */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0078b6] via-50% to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e22837] to-transparent opacity-70 [mask-image:linear-gradient(90deg,transparent,black_30%,black_70%,transparent)]" />

      <div aria-hidden className="dot-grid absolute inset-0 opacity-40" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-[#0078b6]/20 blur-[140px] motion-safe:animate-float-slow" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#e22837]/20 blur-[140px] motion-safe:animate-float-slow [animation-delay:-6s]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        {/* CTA band */}
        <Reveal className="-mt-px pt-16 md:pt-20" amount={0.2}>
          <div className="conic-border rounded-[32px]">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1020] px-8 py-12 md:px-14 md:py-16">
              <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent" />
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#ffd700]/10 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-[#0078b6]/15 blur-3xl" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_auto]">
                <div>
                  <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                    The next chapter
                  </p>
                  <h2 className="text-3xl font-black leading-tight md:text-5xl">
                    See you at <span className="gradient-text">ARES 2027</span>
                  </h2>
                  <p className="mt-4 max-w-xl text-base text-white/70 md:text-lg">
                    Registration, sponsorship or speaking opportunities. Reach out and be part of Asia&apos;s premier
                    real estate summit.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 lg:justify-end">
                  <Magnetic>
                    <Link
                      href="/contact-us"
                      className="shine group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_40px_rgba(226,40,55,0.35)] transition-shadow hover:shadow-[0_14px_50px_rgba(0,120,182,0.45)]"
                    >
                      Get in touch
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Magnetic>
                  <Magnetic strength={10}>
                    <Link
                      href="/gallery"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-semibold text-white/90 backdrop-blur-md transition-colors hover:bg-white/15 hover:text-white"
                    >
                      Relive 2025
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Columns */}
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr_1fr] md:py-20">
          <Reveal>
            <Link href="/" className="inline-block" aria-label="ARES home">
              <img
                src={FOOTER_LOGO}
                alt="ARES Logo"
                className="h-auto w-full max-w-[260px] drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.03]"
              />
            </Link>
            <h3 className="mt-6 text-lg font-bold">About Ares</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
              The Asian Real Estate Summit (ARES) is an biennial international conference uniting real estate
              professionals across Asia. We facilitate knowledge exchange, networking, and collaboration among
              developers, brokers, agents, and proptech companies.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Explore</h3>
            <Stagger className="mt-5 space-y-1" amount={0.3}>
              {exploreLinks.map((link) => (
                <motion.div key={link.href} variants={staggerItem}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 py-1.5 text-base font-medium text-white/80 transition-colors hover:text-white"
                  >
                    <span className="h-px w-0 bg-gradient-to-r from-[#e22837] to-[#0078b6] transition-all duration-300 group-hover:w-5" />
                    <span className="transition-transform duration-300 group-hover:translate-x-1">{link.name}</span>
                  </Link>
                </motion.div>
              ))}
            </Stagger>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Contact</h3>
            <ul className="mt-5 space-y-4">
              <li>
                <a href="mailto:info@filipinohomes.com" className="group flex items-start gap-3 text-sm text-white/80 transition-colors hover:text-white">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#0078b6] to-[#005a8b] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <Mail size={16} />
                  </span>
                  <span className="pt-2">info@filipinohomes.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+639778150888" className="group flex items-start gap-3 text-sm text-white/80 transition-colors hover:text-white">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#e22837] to-[#d41e2d] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <Phone size={16} />
                  </span>
                  <span className="pt-2">(+63) 977 815 0888</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/80">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#ffd700]">
                  <MapPin size={16} />
                </span>
                <span className="pt-2">Bangkok, Thailand</span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Follow Us</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {socials.map(({ name, href, icon: Icon, from, to }) => (
                <motion.a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  whileHover={{ y: -4, scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-white transition-colors"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  />
                  <Icon size={20} className="relative" />
                </motion.a>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-white/55">
              Follow Filipino Homes for announcements, highlights and the road to ARES 2027.
            </p>
            <a
              href="https://filipinohomes.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white/80 transition-colors hover:text-white"
            >
              filipinohomes.com
              <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-center text-xs text-white/50 md:flex-row md:text-left">
          <p>© 2011 - {currentYear} Filipino Homes. All Rights Reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
            Asian Real Estate Summit · Bangkok, Thailand
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
