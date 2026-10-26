"use client"

import type React from "react"
import { useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  MessageSquare,
  ArrowDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Reveal, Stagger, staggerItem, SplitText, TiltCard, Magnetic, Particles } from "@/components/motion"

const inputClass =
  "h-12 rounded-xl border-gray-200 bg-gray-50/80 px-4 text-base text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:border-[#0078b6] focus:bg-white focus:ring-[#0078b6] focus:shadow-[0_0_0_4px_rgba(0,120,182,0.12)] focus-visible:ring-0 focus-visible:ring-offset-0"

const ContactPage = () => {
  const reduce = useReducedMotion()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ---- Hero parallax: scroll + pointer --------------------------------------
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const bgY = useTransform(heroProgress, [0, 1], ["0%", reduce ? "0%" : "26%"])
  const bgScale = useTransform(heroProgress, [0, 1], [1.08, reduce ? 1.08 : 1.22])
  const contentY = useTransform(heroProgress, [0, 1], [0, reduce ? 0 : 120])
  const contentOpacity = useTransform(heroProgress, [0, 0.75], [1, 0])

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 60, damping: 18 })
  const smoothY = useSpring(pointerY, { stiffness: 60, damping: 18 })
  const bgShiftX = useTransform(smoothX, (v) => v * -16)
  const orbAX = useTransform(smoothX, (v) => v * 40)
  const orbAY = useTransform(smoothY, (v) => v * 30)
  const orbBX = useTransform(smoothX, (v) => v * -55)
  const orbBY = useTransform(smoothY, (v) => v * -35)

  const onHeroPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType === "touch") return
    const rect = e.currentTarget.getBoundingClientRect()
    pointerX.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    pointerY.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
  const onHeroPointerLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  // ---- Form -----------------------------------------------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch("https://api.leuteriorealty.com/ares/v1/public/api/ares/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        })
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrorMessage("Something went wrong. Please try again later.")
      alert("Something went wrong. Please try again later.")
    } finally {
      setSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "info@filipinohomes.com",
      description: "Send us an email anytime",
      href: "mailto:info@filipinohomes.com",
      from: "#0078b6",
      to: "#005a8b",
      glow: "rgba(0,120,182,0.35)",
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "(+63) 977 815 0888",
      description: "Mon-Fri 9AM-6PM (PHT)",
      href: "tel:+639778150888",
      from: "#e22837",
      to: "#d41e2d",
      glow: "rgba(226,40,55,0.35)",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "Cebu City, Philippines",
      description: "Our headquarters",
      href: "#map",
      from: "#672e91",
      to: "#4b1f6b",
      glow: "rgba(103,46,145,0.4)",
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "9:00 AM - 6:00 PM",
      description: "Monday to Friday",
      href: undefined,
      from: "#f59e0b",
      to: "#d97706",
      glow: "rgba(255,215,0,0.3)",
    },
  ]

  return (
    <div className="min-h-screen font-sans">
      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={heroRef}
        onPointerMove={onHeroPointerMove}
        onPointerLeave={onHeroPointerLeave}
        className="relative flex min-h-[70vh] items-center overflow-hidden bg-gray-950 text-white"
      >
        {/* Parallax photo */}
        <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ y: bgY, x: bgShiftX, scale: bgScale }}>
          <img src="/bangkok.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-950" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
        <div aria-hidden className="dot-grid absolute inset-0 opacity-60" />

        {/* Drifting colour orbs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/4 h-[26rem] w-[26rem] rounded-full bg-[#0078b6]/40 blur-[120px] motion-safe:animate-float-slow"
          style={{ x: orbAX, y: orbAY }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#e22837]/35 blur-[140px] motion-safe:animate-float-slow [animation-delay:-4s]"
          style={{ x: orbBX, y: orbBY }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-[#ffd700]/20 blur-[110px] motion-safe:animate-float-slow [animation-delay:-7s]"
        />

        <Particles count={60} />

        {/* Content */}
        <motion.div
          className="container relative z-10 mx-auto px-4 pb-20 pt-32 sm:px-6 md:pt-40"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] md:text-sm"
            >
              <Sparkles size={16} className="text-[#ffd700]" />
              We&apos;d love to hear from you
            </motion.div>

            <h1 className="text-5xl font-black uppercase leading-[1.05] tracking-tight md:text-7xl">
              <SplitText text="Contact Us" delay={0.2} stagger={0.12} wordClassName="gradient-text" />
            </h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-6 h-1 w-24 origin-left rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6]"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/80 md:text-2xl"
            >
              Ready to join ARES 2025? We&apos;re here to help with registration, sponsorship opportunities, and any
              questions you may have.
            </motion.p>

            {/* Quick contact cards */}
            <Stagger className="mt-12 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4" amount={0.1}>
              {contactInfo.map(({ icon: Icon, title, content, description, href, from, to, glow }) => {
                const inner = (
                  <TiltCard
                    intensity={8}
                    glow={glow}
                    className="glass group h-full rounded-2xl p-5 transition-colors duration-300 hover:bg-white/[0.12]"
                  >
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-1 break-all text-sm font-medium text-[#ffd700] md:text-base">{content}</p>
                    <p className="mt-1 text-sm text-white/60">{description}</p>
                  </TiltCard>
                )
                return (
                  <motion.div key={title} variants={staggerItem} className="h-full">
                    {href ? (
                      <a
                        href={href}
                        aria-label={`${title}: ${content}`}
                        className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700]"
                      >
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </motion.div>
                )
              })}
            </Stagger>
          </div>
        </motion.div>

        <motion.a
          href="#connect"
          aria-label="Scroll to the contact form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 place-items-center rounded-full border border-white/30 text-white/70 transition-colors hover:text-white motion-safe:animate-float md:grid"
        >
          <ArrowDown size={18} />
        </motion.a>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CONNECT: details + form                                              */}
      {/* ------------------------------------------------------------------ */}
      <section id="connect" className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white py-24 scroll-mt-24">
        <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-[#0078b6]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-24 h-96 w-96 rounded-full bg-[#e22837]/10 blur-[140px]" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
              {/* Left: info */}
              <div className="space-y-10">
                <Reveal direction="right">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-10 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0078b6]">Get in touch</span>
                  </div>
                  <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
                    Let&apos;s <span className="gradient-text-brand">Connect</span>
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
                    Whether you&apos;re interested in attending, speaking, or sponsoring ARES 2025, we&apos;d love to hear from
                    you. Our team is ready to assist you with all your inquiries.
                  </p>
                </Reveal>

                <Stagger className="space-y-4">
                  {contactInfo.map(({ icon: Icon, title, content, description, href, from, to }) => {
                    const Tag: "a" | "div" = href ? "a" : "div"
                    const MotionTag = motion[Tag]
                    return (
                      <MotionTag
                        key={title}
                        {...(href ? { href } : {})}
                        variants={staggerItem}
                        whileHover={reduce ? undefined : { x: 8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078b6] sm:p-5"
                      >
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                          <p className="break-words font-semibold text-[#0078b6]">{content}</p>
                          <p className="text-sm text-gray-500">{description}</p>
                        </div>
                        {href ? (
                          <ArrowRight
                            className="ml-auto shrink-0 text-[#0078b6] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                            size={18}
                          />
                        ) : null}
                      </MotionTag>
                    )
                  })}
                </Stagger>

                {/* Image */}
                <Reveal direction="up" className="hidden lg:block">
                  <div className="conic-border group relative overflow-hidden rounded-3xl">
                    <img
                      src="/contact-us-page-left.png"
                      alt="Customer Support"
                      className="relative h-[300px] w-full rounded-3xl object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 flex items-center gap-2 text-sm font-semibold text-white">
                      <MessageSquare size={16} className="text-[#ffd700]" />
                      Our team is ready to assist you
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Right: form */}
              <Reveal direction="left" delay={0.1}>
                <div className="relative rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:p-8 lg:p-12">
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#0078b6]/60 to-transparent" />
                  <AnimatePresence mode="wait" initial={false}>
                    {isSubmitted ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -12 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="py-12 text-center"
                        role="status"
                        aria-live="polite"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-[0_0_0_10px_rgba(34,197,94,0.12)]"
                        >
                          <CheckCircle className="text-green-600" size={40} />
                        </motion.div>
                        <h3 className="mb-4 text-2xl font-bold text-gray-900">Message Sent Successfully!</h3>
                        <p className="mb-8 text-gray-600">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                        <Magnetic>
                          <Button
                            onClick={() => setIsSubmitted(false)}
                            className="shine relative h-12 overflow-hidden rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6] px-8 text-white hover:from-[#d41e2d] hover:to-[#005a8b]"
                          >
                            Send Another Message
                          </Button>
                        </Magnetic>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="mb-8">
                          <h3 className="mb-3 text-3xl font-bold text-gray-900">Send us a Message</h3>
                          <p className="text-gray-600">Fill out the form below and we&apos;ll respond as soon as possible.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid gap-6 md:grid-cols-2">
                            <div>
                              <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-gray-700">
                                Full Name *
                              </label>
                              <Input
                                id="contact-name"
                                placeholder="Enter your full name"
                                name="name"
                                autoComplete="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-gray-700">
                                Email Address *
                              </label>
                              <Input
                                id="contact-email"
                                type="email"
                                placeholder="Enter your email"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="contact-phone" className="mb-2 block text-sm font-semibold text-gray-700">
                              Phone Number *
                            </label>
                            <Input
                              id="contact-phone"
                              placeholder="Enter your phone number"
                              name="phone"
                              autoComplete="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-gray-700">
                              Message *
                            </label>
                            <Textarea
                              id="contact-message"
                              placeholder="Tell us how we can help you..."
                              name="message"
                              value={formData.message}
                              onChange={handleInputChange}
                              required
                              rows={6}
                              className="min-h-[160px] rounded-xl border-gray-200 bg-gray-50/80 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:border-[#0078b6] focus:bg-white focus:ring-[#0078b6] focus:shadow-[0_0_0_4px_rgba(0,120,182,0.12)] focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>

                          <AnimatePresence>
                            {errorMessage ? (
                              <motion.p
                                key="error"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                role="alert"
                                className="rounded-xl border border-[#e22837]/20 bg-[#e22837]/5 px-4 py-3 text-sm font-medium text-[#e22837]"
                              >
                                {errorMessage}
                              </motion.p>
                            ) : null}
                          </AnimatePresence>

                          <motion.div whileHover={reduce ? undefined : { scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              type="submit"
                              disabled={submitting}
                              className="shine relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#e22837] to-[#0078b6] text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-[#d41e2d] hover:to-[#005a8b] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader2 className="animate-spin" size={20} /> Sending…
                                </span>
                              ) : (
                                <span className="group flex items-center justify-center gap-2">
                                  <Send size={20} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                  Send Message
                                </span>
                              )}
                            </Button>
                          </motion.div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* MAP                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section id="map" className="relative h-[500px] scroll-mt-24 overflow-hidden">
        <Reveal direction="down" className="absolute left-4 right-4 top-6 z-10 sm:left-6 sm:right-auto" amount={0.1}>
          <div className="glass-light flex items-start gap-3 rounded-2xl p-4 shadow-lg">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#672e91] to-[#4b1f6b] text-white">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Filipino Homes Headquarters</h3>
              <p className="text-sm text-gray-600">Cebu City, Philippines</p>
            </div>
          </div>
        </Reveal>
        <iframe
          title="Map of Filipino Homes Headquarters, Cebu City"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1962.7364133508831!2d123.88903657855424!3d10.303992717286546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a99956c12817ef%3A0xa4da7decf55d8a26!2sFilipinoHomes!5e0!3m2!1sen!2sph!4v1737531717312!5m2!1sen!2sph&disableDefaultUI=true&maptype=roadmap&style=feature:poi|visibility:off&style=feature:transit|visibility:off"
          width="100%"
          height="500"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale transition-all duration-500 hover:grayscale-0"
        />
      </section>
    </div>
  )
}

export default ContactPage
