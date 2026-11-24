"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { ArrowLeft, Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, ShieldCheck, TriangleAlert, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { staggerContainer, staggerItem } from "@/components/motion"
import { CornerFlourish, GoldRule, Lotus, brownLattice, goldLattice, goldText } from "@/components/thai-ornaments"

const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"

const inputClass =
  "h-12 rounded-xl border-[#e3d3a8] bg-white pl-11 pr-4 text-base text-[#2a1a3d] placeholder:text-[#a89a7c] transition-all duration-300 focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)] focus-visible:ring-0 focus-visible:ring-offset-0"
const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"
const fieldIconClass = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]"

const emptyDecline = { name: "", email: "", team: "", reason: "" }

/** For a team leader who is not joining: who they are and why. Shown in place of the registration form. */
function DeclineForm({ invite, onBack }: { invite: string; onBack: () => void }) {
  const [form, setForm] = useState(emptyDecline)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!form.reason.trim()) return setErrorMessage("Please tell us why you are not joining.")
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/tl/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite, ...form }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        setErrorMessage(result?.message || "We could not save your answer. Please try again.")
        return
      }
      setDone(true)
    } catch {
      setErrorMessage("We could not save your answer. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="py-6 text-center" role="status">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#fdf3d7] text-[#8a5a00]">
          <Check size={26} />
        </span>
        <h2 className="text-2xl font-black text-[#2a1458]">Thank you for letting us know</h2>
        <p className="mx-auto mt-3 max-w-sm text-[#5c4a2a]">
          We have recorded that you are not joining ARES 2027, together with your reason. If your plans change, open this
          same link again and register.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex h-12 items-center rounded-xl border border-[#c9972f] bg-white px-6 text-base font-semibold text-[#6b4a12] hover:bg-[#fdf3d7]"
        >
          I can join after all
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-7 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">ARES 2027</p>
        <h2 className="mt-2 text-3xl font-black text-[#2a1458]">Not joining?</h2>
        <p className="mt-2 text-sm text-[#7a6a4a]">Tell us who you are and why you cannot join. All fields are required.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="decline-name" className={labelClass}>
            Full name
          </label>
          <div className="relative">
            <User size={18} className={fieldIconClass} />
            <Input id="decline-name" name="name" autoComplete="name" autoFocus value={form.name} onChange={update} required maxLength={200} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="decline-email" className={labelClass}>
            Email
          </label>
          <div className="relative">
            <Mail size={18} className={fieldIconClass} />
            <Input id="decline-email" type="email" name="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={form.email} onChange={update} required className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="decline-team" className={labelClass}>
            Team
          </label>
          <div className="relative">
            <Users size={18} className={fieldIconClass} />
            <Input id="decline-team" name="team" autoComplete="organization" value={form.team} onChange={update} required maxLength={200} aria-describedby="decline-team-help" className={inputClass} />
          </div>
          <p id="decline-team-help" className="mt-1.5 text-xs text-[#7a6a4a]">
            Use your team&apos;s official name, so your agents are told you are not joining.
          </p>
        </div>
        <div>
          <label htmlFor="decline-reason" className={labelClass}>
            Reason for not joining
          </label>
          <textarea
            id="decline-reason"
            name="reason"
            value={form.reason}
            onChange={update}
            required
            maxLength={1000}
            rows={4}
            placeholder="e.g. I have a schedule conflict on those dates."
            className="w-full rounded-xl border border-[#e3d3a8] bg-white px-4 py-3 text-base text-[#2a1a3d] outline-none transition-all duration-300 placeholder:text-[#a89a7c] focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)]"
          />
        </div>

        {errorMessage ? (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          className="h-14 w-full rounded-xl border border-[#2a1458] bg-[#2a1458] text-lg font-bold text-[#fbe7a1] hover:bg-[#1a0d3d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={20} /> Sending…
            </span>
          ) : (
            "Submit: I am not joining"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#7a6a4a]">
        Joining after all?{" "}
        <button type="button" onClick={onBack} className="font-semibold text-[#6b4a12] underline-offset-2 hover:underline">
          Back to registration
        </button>
      </p>
    </>
  )
}

const emptyForm = { name: "", email: "", contact_number: "", team: "", password: "", confirm: "" }

/** Team leader sign-up. `invite` is null when the link's token is missing or no longer valid. */
export default function TeamLeaderRegister({ invite }: { invite: string | null }) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  // A team leader who is not joining switches to the decline form.
  const [declining, setDeclining] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const update = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const passwordsDiffer = form.confirm.length > 0 && form.password !== form.confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || !invite) return
    if (form.password.length < 8) return setErrorMessage("Your password must be at least 8 characters.")
    if (form.password !== form.confirm) return setErrorMessage("The two passwords do not match.")

    setSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/tl/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite,
          name: form.name,
          email: form.email,
          contact_number: form.contact_number,
          team: form.team,
          password: form.password,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        setErrorMessage(result?.message || "We could not complete your registration. Please try again.")
        setSubmitting(false)
        return
      }
      // Registered and signed in: keep the button loading until the dashboard takes over.
      router.replace("/tl")
      router.refresh()
    } catch {
      setErrorMessage("We could not complete your registration. Please check your connection and try again.")
      setSubmitting(false)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="grid min-h-screen font-sans lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative flex flex-col overflow-hidden bg-[#120a2e] px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:py-10">
          <img src="/bangkok.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#2a1458]/95 via-[#1a0d3d]/85 to-[#3a0d2a]/90" />
          <div aria-hidden className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: goldLattice }} />

          <Link href="/" aria-label="ARES 2027 home" className="relative flex items-center">
            <img src={LOGO_URL} alt="Asian Real Estate Summit" className="h-11 w-auto sm:h-12" />
            <span className="ml-3 border-l border-white/40 pl-3 text-2xl font-black leading-none tracking-tight">2027</span>
          </Link>

          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="relative mt-8 max-w-md lg:my-auto lg:pb-16">
            <Lotus bloom className="h-10 w-16 text-[#f0c24b] lg:h-14 lg:w-24" />
            <motion.p variants={staggerItem} lang="th" className="mt-4 text-lg font-medium text-[#f3d27a]">
              ยินดีต้อนรับ
            </motion.p>
            <motion.h1
              variants={staggerItem}
              className={`pb-1 text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl ${goldText}`}
            >
              Team Leader Registration
            </motion.h1>
            <motion.div variants={staggerItem} className="hidden lg:block">
              <GoldRule className="my-6 max-w-[14rem]" />
              <p className="text-lg leading-relaxed text-white/80">
                Register first so the agents on your team can sign up. You will then confirm each of them from your team
                leader portal.
              </p>
            </motion.div>
          </motion.div>

          <p className="relative hidden items-center gap-2 text-sm text-white/60 lg:flex">
            <ShieldCheck size={16} className="text-[#f3d27a]" /> By invitation from the ARES admin
          </p>
        </section>

        {/* Form panel */}
        <section className="relative flex items-center justify-center bg-[#fbf5e6] px-4 py-10 sm:px-8 lg:min-h-screen">
          <div aria-hidden className="absolute inset-0 opacity-[0.09]" style={{ backgroundImage: brownLattice }} />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg"
          >
            <div className="relative rounded-[28px] border border-[#d4a437]/60 bg-white p-7 shadow-[0_30px_80px_-30px_rgba(58,13,42,0.45)] sm:p-10">
              <CornerFlourish className="left-2 top-2" />
              <CornerFlourish className="right-2 top-2 rotate-90" />

              {!invite ? (
                <div className="py-6 text-center" role="alert">
                  <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#b3261e]/10 text-[#9a1c15]">
                    <TriangleAlert size={26} />
                  </span>
                  <h2 className="text-2xl font-black text-[#2a1458]">This link is not valid</h2>
                  <p className="mx-auto mt-3 max-w-sm text-[#5c4a2a]">
                    Team leader registration needs the private link or QR code from the ARES admin. Please ask the admin
                    for the current one.
                  </p>
                  <Link
                    href="/tl/login"
                    className="mt-6 inline-flex h-12 items-center rounded-xl border border-[#c9972f] bg-white px-6 text-base font-semibold text-[#6b4a12] hover:bg-[#fdf3d7]"
                  >
                    Already registered? Sign in
                  </Link>
                </div>
              ) : declining ? (
                <DeclineForm invite={invite} onBack={() => setDeclining(false)} />
              ) : (
                <>
                  <div className="mb-7 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">ARES 2027</p>
                    <h2 className="mt-2 text-3xl font-black text-[#2a1458]">Register as team leader</h2>
                    <p className="mt-2 text-sm text-[#7a6a4a]">All fields are required.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="tl-name" className={labelClass}>
                        Full name
                      </label>
                      <div className="relative">
                        <User size={18} className={fieldIconClass} />
                        <Input id="tl-name" name="name" autoComplete="name" autoFocus value={form.name} onChange={update} required maxLength={200} className={inputClass} />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="tl-email" className={labelClass}>
                          Email
                        </label>
                        <div className="relative">
                          <Mail size={18} className={fieldIconClass} />
                          <Input id="tl-email" type="email" name="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={form.email} onChange={update} required className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="tl-contact" className={labelClass}>
                          Contact number
                        </label>
                        <div className="relative">
                          <Phone size={18} className={fieldIconClass} />
                          <Input id="tl-contact" type="tel" name="contact_number" autoComplete="tel" value={form.contact_number} onChange={update} required minLength={5} maxLength={40} className={inputClass} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="tl-team" className={labelClass}>
                        Team
                      </label>
                      <div className="relative">
                        <Users size={18} className={fieldIconClass} />
                        <Input id="tl-team" name="team" autoComplete="organization" value={form.team} onChange={update} required maxLength={200} aria-describedby="tl-team-help" className={inputClass} />
                      </div>
                      <p id="tl-team-help" className="mt-1.5 text-xs text-[#7a6a4a]">
                        Use your team&apos;s official name, so your agents are matched to you.
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="tl-password" className={labelClass}>
                          Create a password
                        </label>
                        <div className="relative">
                          <LockKeyhole size={18} className={fieldIconClass} />
                          <Input
                            id="tl-password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={update}
                            required
                            minLength={8}
                            maxLength={72}
                            aria-describedby="tl-password-help"
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
                        <p id="tl-password-help" className="mt-1.5 text-xs text-[#7a6a4a]">
                          At least 8 characters.
                        </p>
                      </div>
                      <div>
                        <label htmlFor="tl-confirm" className={labelClass}>
                          Repeat password
                        </label>
                        <div className="relative">
                          <LockKeyhole size={18} className={fieldIconClass} />
                          <Input
                            id="tl-confirm"
                            type={showPassword ? "text" : "password"}
                            name="confirm"
                            autoComplete="new-password"
                            value={form.confirm}
                            onChange={update}
                            required
                            aria-invalid={passwordsDiffer || undefined}
                            className={inputClass}
                          />
                        </div>
                        {passwordsDiffer ? <p className="mt-1.5 text-xs font-medium text-[#9a1c15]">Passwords do not match.</p> : null}
                      </div>
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
                            <Loader2 className="animate-spin" size={20} /> Registering…
                          </span>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  <p className="mt-6 text-center text-sm text-[#7a6a4a]">
                    Already registered?{" "}
                    <Link href="/tl/login" className="font-semibold text-[#6b4a12] underline-offset-2 hover:underline">
                      Sign in
                    </Link>
                  </p>

                  <div className="mt-6 rounded-xl border border-dashed border-[#d4a437]/70 bg-[#fdf8ea] px-4 py-4 text-center text-sm text-[#5c4a2a]">
                    <p className="font-semibold text-[#2a1458]">Can't make it to ARES 2027?</p>
                    <p className="mt-1">No worries at all! Your account may still be used to monitor your team's registration. Thank you!</p>
                    <button
                      type="button"
                      onClick={() => setDeclining(true)}
                      className="mt-3 inline-flex h-11 items-center rounded-xl border border-[#c9972f] bg-white px-5 text-sm font-semibold text-[#6b4a12] hover:bg-[#fdf3d7]"
                    >
                      I am not joining
                    </button>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/"
              className="group mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#6b4a12] hover:text-[#2a1458]"
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
