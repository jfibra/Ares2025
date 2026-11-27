"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { staggerContainer, staggerItem } from "@/components/motion"
import { CornerFlourish, GoldRule, Lotus, brownLattice, goldLattice, goldText } from "@/components/thai-ornaments"

const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"

const inputClass =
  "h-12 rounded-xl border-[#e3d3a8] bg-white pl-11 text-base text-[#2a1a3d] placeholder:text-[#a89a7c] transition-all duration-300 focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)] focus-visible:ring-0 focus-visible:ring-offset-0"
const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"
const fieldIconClass = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]"

const copy = {
  admin: {
    title: "Admin Portal",
    blurb: "Review registrations, manage team leaders and keep track of every agent for the Asian Real Estate Summit in Bangkok.",
    footnote: "Authorised team members only",
    hint: "Use your admin email and password.",
  },
  tl: {
    title: "Team Leader Portal",
    blurb: "See the agents on your team who registered for the Asian Real Estate Summit and confirm them.",
    footnote: "For registered team leaders",
    hint: "Use the email and password you registered with.",
  },
}

export default function PortalLogin({ variant }: { variant: "admin" | "tl" }) {
  const text = copy[variant]
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Bumped on every failed attempt so the card shakes again even for the same message.
  const [attempt, setAttempt] = useState(0)

  const fail = (message: string) => {
    setErrorMessage(message)
    setAttempt((n) => n + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        fail(result?.message || "Could not sign in. Please try again.")
        setSubmitting(false)
        return
      }
      // Keep the button in its loading state until the dashboard takes over.
      router.replace(result.role === "tl" ? "/tl" : result.role === "team" ? "/team" : "/admin")
      router.refresh()
    } catch {
      fail("Could not sign in. Please check your connection and try again.")
      setSubmitting(false)
    }
  }

  const trackCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState("CapsLock"))

  return (
    <MotionConfig reducedMotion="user">
      <main className="grid min-h-screen font-sans lg:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        {/* Brand panel                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative flex flex-col overflow-hidden bg-[#120a2e] px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:py-10">
          <img src="/bangkok.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#2a1458]/95 via-[#1a0d3d]/85 to-[#3a0d2a]/90" />
          <div aria-hidden className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: goldLattice }} />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#d4a437]/20 blur-[120px]"
          />

          <div className="relative flex items-center justify-between">
            <Link href="/" aria-label="ARES 2027 home" className="flex items-center">
              <img src={LOGO_URL} alt="Asian Real Estate Summit" className="h-16 w-auto sm:h-20" />
              <span className="ml-4 border-l border-white/40 pl-4 text-4xl sm:text-5xl font-black leading-none tracking-tight">2027</span>
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="relative mt-8 max-w-md lg:my-auto lg:pb-16"
          >
            <Lotus bloom className="h-10 w-16 text-[#f0c24b] lg:h-14 lg:w-24" />
            <motion.p variants={staggerItem} lang="th" className="mt-4 text-lg font-medium text-[#f3d27a]">
              ยินดีต้อนรับ
            </motion.p>
            <motion.h1
              variants={staggerItem}
              className={`pb-1 text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl ${goldText}`}
            >
              {text.title}
            </motion.h1>
            <motion.div variants={staggerItem} className="hidden lg:block">
              <GoldRule className="my-6 max-w-[14rem]" />
              <p className="text-lg leading-relaxed text-white/80">
                {text.blurb}
              </p>
            </motion.div>
          </motion.div>

          <p className="relative hidden items-center gap-2 text-sm text-white/60 lg:flex">
            <ShieldCheck size={16} className="text-[#f3d27a]" /> {text.footnote}
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Sign-in panel                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative flex items-center justify-center bg-[#fbf5e6] px-4 py-10 sm:px-8 lg:min-h-screen">
          <div aria-hidden className="absolute inset-0 opacity-[0.09]" style={{ backgroundImage: brownLattice }} />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md"
          >
            <motion.div
              key={attempt}
              animate={attempt ? { x: [0, -10, 10, -7, 7, -3, 0] } : undefined}
              transition={{ duration: 0.45 }}
              className="relative rounded-[28px] border border-[#d4a437]/60 bg-white p-7 shadow-[0_30px_80px_-30px_rgba(58,13,42,0.45)] sm:p-10"
            >
              <CornerFlourish className="left-2 top-2" />
              <CornerFlourish className="right-2 top-2 rotate-90" />

              <div className="mb-8 text-center">
                <span className="mx-auto mb-4 grid h-14 w-14 rotate-45 place-items-center border border-[#d4a437] bg-[#2a1458] text-[#f3d27a] shadow-lg">
                  <LockKeyhole size={24} className="-rotate-45" />
                </span>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">ARES 2027</p>
                <h2 className="mt-2 text-3xl font-black text-[#2a1458]">Sign in</h2>
                <p className="mt-2 text-sm text-[#7a6a4a]">{text.hint}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
                <div>
                  <label htmlFor="admin-email" className={labelClass}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={18} className={fieldIconClass} />
                    <Input
                      id="admin-email"
                      type="email"
                      inputMode="email"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      autoFocus
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-invalid={errorMessage ? true : undefined}
                      className={`${inputClass} pr-4`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole size={18} className={fieldIconClass} />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={trackCapsLock}
                      onKeyUp={trackCapsLock}
                      onBlur={() => setCapsLock(false)}
                      required
                      aria-invalid={errorMessage ? true : undefined}
                      aria-describedby={capsLock ? "admin-caps-lock" : undefined}
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#7a6a4a] transition-colors hover:bg-[#fdf3d7] hover:text-[#6b4a12]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {capsLock ? (
                      <motion.p
                        id="admin-caps-lock"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 overflow-hidden pt-2 text-xs font-medium text-[#8a5a00]"
                      >
                        <TriangleAlert size={14} /> Caps Lock is on
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {errorMessage ? (
                    <motion.p
                      key="error"
                      role="alert"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]"
                    >
                      <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {errorMessage}
                    </motion.p>
                  ) : null}
                </AnimatePresence>

                <motion.div whileHover={submitting ? undefined : { scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="shine relative h-14 w-full overflow-hidden rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] text-lg font-bold text-[#2a1408] shadow-[0_12px_30px_-10px_rgba(184,134,43,0.8)] transition-all duration-300 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} /> Signing in…
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {variant === "tl" ? (
              <p className="mt-6 text-center text-sm text-[#7a6a4a]">
                Not registered yet? Ask the admin for the team leader registration link.
              </p>
            ) : null}

            <Link
              href="/"
              className="group mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#6b4a12] hover:text-[#2a1458]"
            >
              <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
              Back to the website
            </Link>
          </motion.div>
        </section>
      </main>
    </MotionConfig>
  )
}
