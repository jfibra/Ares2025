"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { ArrowLeft, BadgeCheck, Camera, Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, ShieldCheck, TriangleAlert, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { staggerContainer, staggerItem } from "@/components/motion"
import { CornerFlourish, GoldRule, Lotus, brownLattice, goldLattice, goldText } from "@/components/thai-ornaments"
import { OwnTicketFields, appendOwnTicket, emptyOwnTicket, ownTicketDetailsProblem } from "@/components/own-ticket-fields"
import { noPhotos, photosProblem, type PhotoPair } from "@/components/photo-field"

const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"

const inputClass =
  "h-12 rounded-xl border-[#e3d3a8] bg-white pl-11 pr-4 text-base text-[#2a1a3d] placeholder:text-[#a89a7c] transition-all duration-300 focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)] focus-visible:ring-0 focus-visible:ring-offset-0"
const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"
const fieldIconClass = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]"

/**
 * For a team leader who is not joining: only the reason. Who they are is already known,
 * because their email was confirmed against the LR records in step 1.
 */
function DeclineForm({ invite, leader, onBack }: { invite: string; leader: VerifiedLeader; onBack: () => void }) {
  const [form, setForm] = useState({ reason: "" })
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
        body: JSON.stringify({ invite, name: leader.name, email: leader.email, team: leader.team, reason: form.reason }),
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
        <p className="mt-2 text-sm text-[#7a6a4a]">Sorry you can&apos;t make it! Mind sharing what&apos;s keeping you from joining?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            autoFocus
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

const STEPS = [
  { label: "Email", icon: Mail, hint: "Let us confirm you are a team leader." },
  { label: "Details", icon: User, hint: "Your details for your own registration." },
  { label: "Photo", icon: Camera, hint: "A clear, formal photo." },
  { label: "Password", icon: LockKeyhole, hint: "Create a password for your account." },
] as const

const emptyForm = { email: "", contact_number: "", password: "", confirm: "" }

/** The team leader as found in the LR records, once their email has passed the check. */
type VerifiedLeader = { name: string; email: string; team: string }

/**
 * Team leader sign-up, in two steps: first the LR email is checked against the LR records
 * to see that it belongs to a team leader, then they fill in their own registration (a team
 * leader attends too; a couple chooses who is joining) and add a contact number and password.
 * `invite` is null when the link's token is missing or no longer valid.
 */
export default function TeamLeaderRegister({ invite }: { invite: string | null }) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  // A team leader who is not joining switches to the decline form.
  const [declining, setDeclining] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // Set once the LR records confirm this email is a team leader.
  const [leader, setLeader] = useState<VerifiedLeader | null>(null)
  // The team leader's own ticket, and the fee per person shown next to it.
  const [ticket, setTicket] = useState(emptyOwnTicket)
  const [photos, setPhotos] = useState<PhotoPair>(noPhotos)
  // After the email check the form is split in three: 1 details, 2 photo, 3 password.
  const [part, setPart] = useState<1 | 2 | 3>(1)
  const [fee, setFee] = useState<number | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const update = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const passwordsDiffer = form.confirm.length > 0 && form.password !== form.confirm

  /** Step 1: ask the server whether this LR email belongs to a team leader. */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (verifying || !invite) return
    setVerifying(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/tl/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite, email: form.email }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success || !result.leader) {
        setErrorMessage(result?.message || "We could not check your details. Please try again.")
        return
      }
      setFee(typeof result.fee === "number" ? result.fee : null)
      setTicket(emptyOwnTicket)
      setPhotos(noPhotos)
      setPart(1)
      setLeader(result.leader)
    } catch {
      setErrorMessage("We could not check your details. Please check your connection and try again.")
    } finally {
      setVerifying(false)
    }
  }

  const useAnotherEmail = () => {
    setLeader(null)
    setErrorMessage(null)
    setForm(emptyForm)
    setTicket(emptyOwnTicket)
    setPhotos(noPhotos)
    setPart(1)
  }

  const goToPart = (next: 1 | 2 | 3) => {
    setErrorMessage(null)
    setPart(next)
    document.getElementById("tl-register-top")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || !invite || !leader) return
    // "Next" on the first two parts only checks that part and moves on.
    if (part === 1) {
      const detailsProblem = ownTicketDetailsProblem(leader.name, ticket)
      if (detailsProblem) return setErrorMessage(detailsProblem)
      return goToPart(2)
    }
    if (part === 2) {
      const photoProblem = photosProblem(leader.name, ticket.attending, photos)
      if (photoProblem) return setErrorMessage(photoProblem)
      return goToPart(3)
    }
    if (form.password.length < 8) return setErrorMessage("Your password must be at least 8 characters.")
    if (form.password !== form.confirm) return setErrorMessage("The two passwords do not match.")

    setSubmitting(true)
    setErrorMessage(null)
    try {
      // Sent as a form, because it carries the formal photo of each person joining.
      const body = new FormData()
      body.set("invite", invite)
      body.set("email", leader.email)
      body.set("contact_number", form.contact_number)
      body.set("password", form.password)
      appendOwnTicket(body, leader.name, ticket, photos)
      const response = await fetch("/api/tl/register", { method: "POST", body })
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

  // 0 is the email check; 1 to 3 are the parts of the form after it.
  const currentStep = leader ? part : 0

  return (
    <MotionConfig reducedMotion="user">
      <main className="grid min-h-screen font-sans lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative flex flex-col overflow-hidden bg-[#120a2e] px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:py-10">
          <img src="/bangkok.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#2a1458]/95 via-[#1a0d3d]/85 to-[#3a0d2a]/90" />
          <div aria-hidden className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: goldLattice }} />

          <Link href="/" aria-label="ARES 2027 home" className="relative flex items-center">
            <img src={LOGO_URL} alt="Asian Real Estate Summit" className="h-16 w-auto sm:h-20" />
            <span className="ml-4 border-l border-white/40 pl-4 text-4xl font-black leading-none tracking-tight sm:text-5xl">2027</span>
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
                Register first so the agents on your team can sign up. Your own registration is included, and you will
                confirm each agent from your team leader portal.
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
              ) : declining && leader ? (
                <DeclineForm invite={invite} leader={leader} onBack={() => setDeclining(false)} />
              ) : (
                <>
                  <div id="tl-register-top" className="mb-7 scroll-mt-6 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">ARES 2027</p>
                    <h2 className="mt-2 text-3xl font-black text-[#2a1458]">Register as team leader</h2>
                    <p className="mt-2 text-sm text-[#7a6a4a]">
                      {STEPS[currentStep].hint}
                    </p>
                    <div className="relative mt-6 rounded-2xl border border-[#e3d3a8] bg-gradient-to-b from-[#fffaf0] to-[#fdf3d7] px-2 pb-3 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                      {/* The track runs between the centres of the first and last circles; the gold part grows as steps are done. */}
                      <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[38px] h-1 -translate-y-1/2 rounded-full bg-[#eadcb6]">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#c9972f]"
                          initial={false}
                          animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                      </div>
                      <ol className="relative grid grid-cols-4" aria-label="Registration steps">
                        {STEPS.map((step, index) => {
                          const done = index < currentStep
                          const current = index === currentStep
                          const StepIcon = step.icon
                          return (
                            <li key={step.label} aria-current={current ? "step" : undefined} className="flex flex-col items-center">
                              <motion.span
                                initial={false}
                                animate={{ scale: current ? 1.1 : 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`grid h-11 w-11 place-items-center rounded-full border-2 transition-colors duration-300 ${
                                  done
                                    ? "border-[#8a6417] bg-gradient-to-br from-[#c9972f] to-[#f3d27a] text-[#2a1408] shadow-[0_6px_14px_-6px_rgba(184,134,43,0.9)]"
                                    : current
                                      ? "border-[#f3d27a] bg-[#2a1458] text-[#fbe7a1] shadow-[0_0_0_5px_rgba(212,164,55,0.25),0_10px_20px_-8px_rgba(42,20,88,0.8)]"
                                      : "border-[#e3d3a8] bg-white text-[#b9a981]"
                                }`}
                              >
                                {done ? <Check size={20} strokeWidth={3} /> : <StepIcon size={19} />}
                              </motion.span>
                              <span
                                className={`mt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                  current ? "text-[#b8862b]" : "text-[#b9a981]"
                                }`}
                              >
                                Step {index + 1}
                              </span>
                              <span className={`text-sm font-bold ${current ? "text-[#2a1458]" : done ? "text-[#6b4a12]" : "text-[#a89a7c]"}`}>
                                {step.label}
                              </span>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  </div>

                  {!leader ? (
                    <form onSubmit={handleVerify} className="space-y-5">
                      <div>
                        <label htmlFor="tl-email" className={labelClass}>
                          LR email
                        </label>
                        <div className="relative">
                          <Mail size={18} className={fieldIconClass} />
                          <Input
                            id="tl-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            autoFocus
                            value={form.email}
                            onChange={update}
                            required
                            maxLength={320}
                            placeholder="Your LR email address"
                            aria-describedby="tl-email-help"
                            className={inputClass}
                          />
                        </div>
                        <p id="tl-email-help" className="mt-1.5 text-xs text-[#7a6a4a]">
                          Enter the email on your LR record. We check it against our LR records to confirm you are a team
                          leader.
                        </p>
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

                      <motion.div whileHover={verifying ? undefined : { scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                        <Button
                          type="submit"
                          disabled={verifying}
                          className="shine relative h-14 w-full overflow-hidden rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] text-lg font-bold text-[#2a1408] shadow-[0_12px_30px_-10px_rgba(184,134,43,0.8)] transition-all duration-300 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {verifying ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="animate-spin" size={20} /> Checking our records…
                            </span>
                          ) : (
                            "Verify my LR email"
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {part === 1 ? (
                    <>
                    <div className="rounded-xl border border-[#2e7d4f]/30 bg-[#2e7d4f]/5 px-4 py-4" role="status">
                      <p className="flex items-center gap-2 text-sm font-semibold text-[#1f5c39]">
                        <BadgeCheck size={18} className="shrink-0" /> Verified team leader
                      </p>
                      <dl className="mt-3 space-y-2 text-sm text-[#2a1a3d]">
                        <div className="flex items-start gap-2">
                          <User size={16} className="mt-0.5 shrink-0 text-[#b8862b]" />
                          <dt className="sr-only">Name</dt>
                          <dd className="font-semibold">{leader.name}</dd>
                        </div>
                        <div className="flex items-start gap-2">
                          <Users size={16} className="mt-0.5 shrink-0 text-[#b8862b]" />
                          <dt className="sr-only">Team</dt>
                          <dd>{leader.team}</dd>
                        </div>
                        <div className="flex items-start gap-2">
                          <Mail size={16} className="mt-0.5 shrink-0 text-[#b8862b]" />
                          <dt className="sr-only">Email</dt>
                          <dd className="break-all">{leader.email}</dd>
                        </div>
                      </dl>
                      <button
                        type="button"
                        onClick={useAnotherEmail}
                        className="mt-3 text-xs font-semibold text-[#6b4a12] underline-offset-2 hover:underline"
                      >
                        Not you? Use a different email
                      </button>
                    </div>

                    <div>
                      <label htmlFor="tl-contact" className={labelClass}>
                        Contact number
                      </label>
                      <div className="relative">
                        <Phone size={18} className={fieldIconClass} />
                        <Input id="tl-contact" type="tel" name="contact_number" autoComplete="tel" autoFocus value={form.contact_number} onChange={update} required minLength={5} maxLength={40} className={inputClass} />
                      </div>
                    </div>

                    <div className="border-t border-dashed border-[#e3d3a8] pt-5">
                      <p className="text-sm font-bold text-[#2a1458]">Your own registration</p>
                      <p className="mb-4 mt-1 text-xs text-[#7a6a4a]">
                        Your registration is listed with your team&apos;s and paid the same way.
                      </p>
                      <OwnTicketFields name={leader.name} fee={fee} value={ticket} onChange={setTicket} photos={photos} onPhotosChange={setPhotos} section="details" idPrefix="tl-own" />
                    </div>
                    </>
                    ) : null}

                    {part === 2 ? (
                      <OwnTicketFields name={leader.name} fee={fee} value={ticket} onChange={setTicket} photos={photos} onPhotosChange={setPhotos} section="photo" idPrefix="tl-own" />
                    ) : null}

                    {part === 3 ? (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="tl-password" className={labelClass}>
                          Create a password
                        </label>
                        <div className="relative">
                          <LockKeyhole size={18} className={fieldIconClass} />
                          <Input
                            id="tl-password"
                            autoFocus
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
                    ) : null}

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
                        ) : part === 3 ? (
                          "Register"
                        ) : (
                          "Next"
                        )}
                      </Button>
                    </motion.div>

                    {part > 1 ? (
                      <button
                        type="button"
                        onClick={() => goToPart(part === 3 ? 2 : 1)}
                        disabled={submitting}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e3d3a8] bg-white text-sm font-semibold text-[#6b4a12] hover:bg-[#fdf8ea] disabled:opacity-60"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                    ) : null}
                  </form>
                  )}

                  <p className="mt-6 text-center text-sm text-[#7a6a4a]">
                    Already registered?{" "}
                    <Link href="/tl/login" className="font-semibold text-[#6b4a12] underline-offset-2 hover:underline">
                      Sign in
                    </Link>
                  </p>

                  {leader && part === 1 ? (
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
                  ) : null}
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
