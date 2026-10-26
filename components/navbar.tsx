"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion"
import { Facebook, Twitter, ArrowUpRight, MapPin } from "lucide-react"
import ScrollToTop from "./scroll-to-top"

const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Speakers", href: "/speakers" },
  { name: "Gallery", href: "/gallery" },
]

const socials = [
  { name: "Facebook", href: "https://facebook.com", icon: Facebook },
  { name: "Twitter", href: "https://twitter.com", icon: Twitter },
]

const ease = [0.22, 1, 0.36, 1] as const

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  // Solid glass once past the top; tuck away while scrolling down, pop back on scroll up.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0
    setIsScrolled(latest > 40)
    if (isOpen) return
    setHidden(latest > prev && latest > 240)
  })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) setIsOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "visible"
    return () => {
      document.body.style.overflow = "visible"
    }
  }, [isOpen])

  useEffect(() => {
    // Close the menu and scroll to top when the route changes
    setIsOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen])

  const light = !isScrolled && !isOpen // white text over the hero
  const activeKey = hovered ?? pathname

  return (
    <>
      {/* Soft scrim so white nav text stays legible over any hero */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-[999] h-40 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-500 ${
          light ? "opacity-100" : "opacity-0"
        }`}
      />

      <motion.header
        className={`fixed inset-x-0 top-0 ${isOpen ? "z-[1002]" : "z-[1000]"}`}
        initial={false}
        animate={{ y: hidden && !isOpen ? -120 : 0 }}
        transition={{ duration: 0.45, ease }}
      >
        <motion.div
          className="mx-auto"
          initial={false}
          animate={{
            maxWidth: isScrolled ? 1180 : 1400,
            marginTop: isScrolled ? 12 : 0,
            paddingLeft: isScrolled ? 12 : 0,
            paddingRight: isScrolled ? 12 : 0,
          }}
          transition={{ duration: 0.5, ease }}
        >
          <motion.nav
            aria-label="Main"
            className={`relative flex items-center justify-between px-4 md:px-6 ${
              isScrolled && !isOpen ? "glass-light" : ""
            }`}
            initial={false}
            animate={{
              height: isScrolled ? 68 : 88,
              borderRadius: isScrolled ? 999 : 0,
            }}
            transition={{ duration: 0.5, ease }}
          >
            {/* Logo */}
            <Link href="/" className="group relative z-10 flex items-center" aria-label="ARES home">
              <motion.img
                src={LOGO_URL}
                alt="Asian Real Estate Summit"
                className={`w-auto transition-[filter] duration-500 ${light ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" : ""}`}
                initial={false}
                animate={{ height: isScrolled ? 44 : 60 }}
                transition={{ duration: 0.5, ease }}
                whileHover={{ scale: 1.04 }}
              />
            </Link>

            {/* Desktop links */}
            <ul
              className="relative hidden items-center gap-1 md:flex"
              onMouseLeave={() => setHovered(null)}
            >
              {navItems.map((item) => {
                const active = pathname === item.href
                const highlighted = activeKey === item.href
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHovered(item.href)}
                      className={`relative block rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-300 ${
                        light
                          ? active
                            ? "text-white"
                            : "text-white/80 hover:text-white"
                          : active
                            ? "text-[#0078b6]"
                            : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      {highlighted && (
                        <motion.span
                          layoutId="nav-pill"
                          className={`absolute inset-0 -z-10 rounded-full ${
                            light ? "bg-white/15 ring-1 ring-white/25" : "bg-[#0078b6]/10"
                          }`}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      {item.name}
                      {active && (
                        <motion.span
                          layoutId="nav-dot"
                          className={`absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                            light ? "bg-[#ffd700]" : "bg-[#e22837]"
                          }`}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Right cluster: socials + CTA */}
            <div className="hidden items-center gap-2 md:flex">
              {socials.map(({ name, href, icon: Icon }) => (
                <motion.a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  whileHover={{ y: -2, scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className={`grid h-10 w-10 place-items-center rounded-full border transition-colors duration-300 ${
                    light
                      ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#0078b6]/40 hover:text-[#0078b6]"
                  }`}
                >
                  <Icon size={16} />
                </motion.a>
              ))}

              <Link href="/contact-us" className="ml-2">
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className={`shine group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-shadow duration-300 hover:shadow-xl ${
                    pathname === "/contact-us"
                      ? "bg-gradient-to-r from-[#0078b6] to-[#005a8b]"
                      : "bg-gradient-to-r from-[#e22837] to-[#0078b6]"
                  }`}
                >
                  Contact Us
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </motion.span>
              </Link>
            </div>

            {/* Mobile toggle: two bars that morph into an X */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isOpen}
              className={`relative z-[1002] grid h-11 w-11 place-items-center rounded-full border transition-colors duration-300 md:hidden ${
                light || isOpen ? "border-white/25 bg-white/10 text-white" : "border-gray-200 bg-white text-gray-800"
              }`}
            >
              <span className="relative block h-4 w-5">
                <motion.span
                  className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current"
                  animate={isOpen ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.3, ease }}
                />
                <motion.span
                  className="absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-current"
                  animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="absolute left-0 top-[14px] block h-0.5 w-5 rounded-full bg-current"
                  animate={isOpen ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.3, ease }}
                />
              </span>
            </button>
          </motion.nav>
        </motion.div>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-[1001] flex flex-col overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-black text-white md:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="dot-grid absolute inset-0 opacity-60" />
            <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-[#0078b6]/40 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[#e22837]/40 blur-[100px]" />

            {/* Spacer under the header, which stays on top while the menu is open */}
            <div className="h-[88px]" />

            <nav aria-label="Mobile" className="relative flex flex-1 flex-col justify-center px-8">
              <ul className="space-y-2">
                {[...navItems, { name: "Contact Us", href: "/contact-us" }].map((item, i) => {
                  const active = pathname === item.href
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="group flex items-center justify-between py-3"
                      >
                        <span className="flex items-baseline gap-4">
                          <span className="text-xs font-semibold tabular-nums text-white/40">0{i + 1}</span>
                          <span
                            className={`text-4xl font-black tracking-tight transition-colors ${
                              active ? "gradient-text" : "text-white group-hover:text-white/80"
                            }`}
                          >
                            {item.name}
                          </span>
                        </span>
                        <ArrowUpRight
                          className="text-white/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
                          size={22}
                        />
                      </Link>
                    </motion.li>
                  )
                })}
              </ul>
            </nav>

            <motion.div
              className="relative flex items-center justify-between border-t border-white/10 px-8 py-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                <MapPin size={14} className="text-[#ffd700]" /> Bangkok · July 1–2, 2025
              </p>
              <div className="flex gap-2">
                {socials.map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollToTop />
    </>
  )
}

export default Navbar
