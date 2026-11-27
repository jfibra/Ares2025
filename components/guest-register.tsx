"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { ArrowLeft, BadgeCheck, Check, Clock, Loader2, Mail, Phone, ShieldCheck, Sparkles, TriangleAlert, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { staggerContainer, staggerItem } from "@/components/motion"
import { CornerFlourish, GoldRule, Lotus, brownLattice, goldLattice, goldText } from "@/components/thai-ornaments"
import { OwnTicketFields, appendOwnTicket, emptyOwnTicket, ownTicketProblem } from "@/components/own-ticket-fields"
import { noPhotos, type PhotoPair } from "@/components/photo-field"
import { PaymentCard, ReceiptUpload } from "@/components/registration-page"
import type { TlPaymentDetails } from "@/lib/registrations"
import type { LeaderContact } from "@/lib/tl-contact"
import { UNPAID_WINDOW } from "@/lib/unpaid-rule"

const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"

const inputClass =
  "h-12 rounded-xl border-[#e3d3a8] bg-white pl-11 pr-4 text-base text-[#2a1a3d] placeholder:text-[#a89a7c] transition-all duration-300 focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)] focus-visible:ring-0 focus-visible:ring-offset-0"
const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"
const fieldIconClass = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]"
const goldButtonClass =
  "shine relative h-14 w-full overflow-hidden rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] text-lg font-bold text-[#2a1408] shadow-[0_12px_30px_-10px_rgba(184,134,43,0.8)] transition-all duration-300 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"

const money = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value)

type Stage = "email" | "details" | "done" | "elsewhere" | "full"
/** The guest's LR record, when their email is in the LR records. */
type LrAgent = { name: string; team: string }

/**
 * Special registration for a guest, opened from the admin's private link. The email is checked
 * first, to note whether the guest is an LR agent; either way they may register, and they pay
 * the ARES admin. `invite` is null when the link's code is missing or no longer valid.
 */
export default function GuestRegister({ invite }: { invite: string | null }) {
  const [stage, setStage] = useState<Stage>("email")
  const [email, setEmail] = useState("")
  const [agent, setAgent] = useState<LrAgent | null>(null)
  const [form, setForm] = useState({ name: "", contact_number: "" })
  const [ticket, setTicket] = useState(emptyOwnTicket)
  const [photos, setPhotos] = useState<PhotoPair>(noPhotos)
  // Per person while filling in the form; the total owed once registered.
  const [fee, setFee] = useState<number | null>(null)
  const [people, setPeople] = useState(1)
  const [payment, setPayment] = useState<TlPaymentDetails | null>(null)
  // Set when the admin put this guest on a team: they then pay that team leader, not the admin.
  const [teamLeader, setTeamLeader] = useState<string | null>(null)
  const [leaderContact, setLeaderContact] = useState<LeaderContact | null>(null)
  const [receiptSentAt, setReceiptSentAt] = useState<string | null>(null)
  const [registeredName, setRegisteredName] = useState("")
  const [returning, setReturning] = useState(false)
  // The fee changed after they registered and they have not paid yet.
  const [feeChanged, setFeeChanged] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Only an LR record can be for a couple; a guest who types their name is one person.
  const recordName = agent?.name ?? ""
  // Who takes this guest's payment and confirms it.
  const payee = teamLeader ?? "the ARES admin"

  const update = (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const startOver = () => {
    setStage("email")
    setEmail("")
    setAgent(null)
    setForm({ name: "", contact_number: "" })
    setTicket(emptyOwnTicket)
    setPhotos(noPhotos)
    setReceiptSentAt(null)
    setTeamLeader(null)
    setLeaderContact(null)
    setReturning(false)
    setFeeChanged(false)
    setConfirmed(false)
    setErrorMessage(null)
  }

  /** Step 1: check the email against the LR records and the registrations we already have. */
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !invite) return
    setBusy(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/guest/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite, email }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        setErrorMessage(result?.message || "We could not check your details. Please try again.")
        return
      }
      if (result.status === "full") return setStage("full")
      if (result.status === "already_registered") {
        if (!result.guest) return setStage("elsewhere")
        setReturning(true)
        setConfirmed(Boolean(result.confirmed))
        setFee(typeof result.fee === "number" ? result.fee : null)
        setPeople(result.attendee_count === 2 ? 2 : 1)
        setPayment(result.payment ?? null)
        setTeamLeader(typeof result.team_leader === "string" ? result.team_leader : null)
        setLeaderContact(result.leader_contact ?? null)
        setFeeChanged(result.fee_changed === true)
        setReceiptSentAt(typeof result.receipt_sent_at === "string" ? result.receipt_sent_at : null)
        return setStage("done")
      }
      setAgent(result.agent ?? null)
      setFee(typeof result.fee === "number" ? result.fee : null)
      setTicket(emptyOwnTicket)
      setPhotos(noPhotos)
      setStage("details")
    } catch {
      setErrorMessage("We could not check your details. Please check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  /** Step 2: register. */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !invite) return
    if (!agent && form.name.trim().length < 2) return setErrorMessage("Please enter your full name.")
    const problem = ownTicketProblem(recordName, ticket, photos)
    if (problem) return setErrorMessage(problem)
    setBusy(true)
    setErrorMessage(null)
    try {
      const body = new FormData()
      body.set("invite", invite)
      body.set("email", email)
      body.set("name", form.name)
      body.set("contact_number", form.contact_number)
      appendOwnTicket(body, recordName, ticket, photos)
      const response = await fetch("/api/guest/register", { method: "POST", body })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        if (result?.status === "full") return setStage("full")
        setErrorMessage(result?.message || "We could not save your registration. Please try again.")
        return
      }
      setRegisteredName(typeof result.name === "string" ? result.name : "")
      setFee(typeof result.fee === "number" ? result.fee : null)
      setPeople(result.attendee_count === 2 ? 2 : 1)
      setPayment(result.payment ?? null)
      setTeamLeader(null)
      setLeaderContact(null)
      setReceiptSentAt(null)
      setStage("done")
      document.getElementById("guest-register-top")?.scrollIntoView({ behavior: "smooth", block: "start" })
    } catch {
      setErrorMessage("We could not save your registration. Please check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  const errorBox = (
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
  )

  const messagePanel = (title: string, text: string, action?: React.ReactNode) => (
    <div className="py-6 text-center" role="status">
      <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#fdf3d7] text-[#8a5a00]">
        <TriangleAlert size={26} />
      </span>
      <h2 className="text-2xl font-black text-[#2a1458]">{title}</h2>
      <p className="mx-auto mt-3 max-w-sm text-[#5c4a2a]">{text}</p>
      {action}
    </div>
  )

  const outlineLink = "mt-6 inline-flex h-12 items-center rounded-xl border border-[#c9972f] bg-white px-6 text-base font-semibold text-[#6b4a12] hover:bg-[#fdf3d7]"

  return (
    <MotionConfig reducedMotion="user">
      <main className="grid min-h-screen font-sans lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative flex flex-col overflow-hidden bg-[#120a2e] px-6 py-8 text-white sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:py-10">
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
              Special Guest Registration
            </motion.h1>
            <motion.div variants={staggerItem} className="hidden lg:block">
              <GoldRule className="my-6 max-w-[14rem]" />
              <p className="text-lg leading-relaxed text-white/80">
                You have been invited to ARES 2027 as a guest. Register here, pay the ARES admin, and your slot is confirmed
                once your payment is received.
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
            <div id="guest-register-top" className="relative scroll-mt-6 rounded-[28px] border border-[#d4a437]/60 bg-white p-7 shadow-[0_30px_80px_-30px_rgba(58,13,42,0.45)] sm:p-10">
              <CornerFlourish className="left-2 top-2" />
              <CornerFlourish className="right-2 top-2 rotate-90" />

              {!invite ? (
                <div className="py-6 text-center" role="alert">
                  <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#b3261e]/10 text-[#9a1c15]">
                    <TriangleAlert size={26} />
                  </span>
                  <h2 className="text-2xl font-black text-[#2a1458]">This link is not valid</h2>
                  <p className="mx-auto mt-3 max-w-sm text-[#5c4a2a]">
                    Guest registration needs the private link or QR code from the ARES admin. Please ask the admin for the
                    current one.
                  </p>
                </div>
              ) : stage === "full" ? (
                messagePanel("All slots have been taken", "ARES 2027 is fully booked, so we cannot register you right now. Please contact the ARES admin.")
              ) : stage === "elsewhere" ? (
                messagePanel(
                  "This email is already registered",
                  "This email already has an ARES 2027 registration as an agent. You can check its status on the registration page.",
                  <div className="flex flex-col items-center">
                    <Link href="/registration" className={outlineLink}>
                      Go to the registration page
                    </Link>
                    <button type="button" onClick={startOver} className="mt-4 text-sm font-semibold text-[#6b4a12] underline-offset-2 hover:underline">
                      Use a different email
                    </button>
                  </div>,
                )
              ) : stage === "done" ? (
                <div className="flex flex-col items-center py-2 text-center" role="status">
                  <Lotus bloom className="h-14 w-24 text-[#c9972f]" />
                  <p lang="th" className="mt-4 text-lg font-medium text-[#b8862b]">
                    ขอบคุณ
                  </p>
                  <h2 className="text-3xl font-black text-[#2a1458]">
                    {confirmed ? "You're confirmed" : returning ? "You're already registered" : "Registration received"}
                  </h2>
                  <GoldRule className="mt-4 w-48" />
                  {confirmed ? (
                    <p className="mx-auto mt-5 max-w-md text-[#5c4a2a]">
                      Your payment has been confirmed. Your slot for ARES 2027 is secured. See you there!
                    </p>
                  ) : (
                    <>
                      <p className="mx-auto mt-5 max-w-md text-[#5c4a2a]">
                        {returning ? "Your payment has not been confirmed yet." : `Thank you${registeredName ? `, ${registeredName}` : ""}.`} To
                        complete your registration, pay{" "}
                        {fee !== null ? (
                          <strong className="text-[#2a1458]">
                            {money(fee)}
                            {people === 2 ? " (for 2 people)" : ""}
                          </strong>
                        ) : (
                          "the registration fee"
                        )}{" "}
                        to {teamLeader ? `your team leader, ${teamLeader}` : "the ARES admin"}. They will confirm it once received.
                      </p>
{feeChanged && fee !== null ? (
                        <p className="mx-auto mt-4 max-w-md rounded-xl border border-[#d4a437]/60 bg-[#fdf3d7] px-4 py-3 text-sm font-medium text-[#4a3413]">
                          <span className="font-bold text-[#2a1458]">Updated registration fee.</span> The fee is now{" "}
                          <span className="font-bold text-[#2a1458]">{money(fee / people)} per person</span>. Because your payment has not been
                          received yet, this is the amount to pay.
                        </p>
                      ) : null}
                      {receiptSentAt ? null : (
                        <p className="mx-auto mt-4 max-w-md rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
                          Please pay and upload your receipt within {UNPAID_WINDOW} of registering. A registration that is
                          still unpaid after {UNPAID_WINDOW} is removed, and you would need to register again.
                        </p>
                      )}
                      <PaymentCard payment={payment} teamLeader={payee} contact={leaderContact} />
                      <ReceiptUpload email={email} teamLeader={payee} sentAt={receiptSentAt} onSent={setReceiptSentAt} />
                      <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e3d3a8] bg-[#fdf3d7] px-4 py-2 text-sm font-semibold text-[#8a5a00]">
                        <Clock size={16} /> {receiptSentAt ? `Waiting for ${payee} to confirm` : `Waiting for payment to ${payee}`}
                      </p>
                    </>
                  )}
                  <button type="button" onClick={startOver} className={outlineLink}>
                    Register another guest
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-7 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">ARES 2027</p>
                    <h2 className="mt-2 text-3xl font-black text-[#2a1458]">Register as a guest</h2>
                    <p className="mt-2 text-sm text-[#7a6a4a]">
                      {stage === "email" ? "Step 1 of 2: enter your email so we can check our records." : "Step 2 of 2: your details and a formal photo."}
                    </p>
                  </div>

                  {stage === "email" ? (
                    <form onSubmit={handleLookup} className="space-y-5">
                      <div>
                        <label htmlFor="guest-email" className={labelClass}>
                          Email address
                        </label>
                        <div className="relative">
                          <Mail size={18} className={fieldIconClass} />
                          <Input
                            id="guest-email"
                            type="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            maxLength={320}
                            placeholder="you@example.com"
                            aria-describedby="guest-email-help"
                            className={inputClass}
                          />
                        </div>
                        <p id="guest-email-help" className="mt-1.5 text-xs text-[#7a6a4a]">
                          If you are an LR agent, use your LR email. Notices about your registration are sent to this address.
                        </p>
                      </div>
                      {errorBox}
                      <motion.div whileHover={busy ? undefined : { scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                        <Button type="submit" disabled={busy} className={goldButtonClass}>
                          {busy ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="animate-spin" size={20} /> Checking our records…
                            </span>
                          ) : (
                            "Continue"
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-5">
                      {agent ? (
                        <div className="rounded-xl border border-[#2e7d4f]/30 bg-[#2e7d4f]/5 px-4 py-4" role="status">
                          <p className="flex items-center gap-2 text-sm font-semibold text-[#1f5c39]">
                            <BadgeCheck size={18} className="shrink-0" /> We found you in the LR records
                          </p>
                          <dl className="mt-3 space-y-2 text-sm text-[#2a1a3d]">
                            <div className="flex items-start gap-2">
                              <User size={16} className="mt-0.5 shrink-0 text-[#b8862b]" />
                              <dt className="sr-only">Name</dt>
                              <dd className="font-semibold">{agent.name}</dd>
                            </div>
                            <div className="flex items-start gap-2">
                              <Users size={16} className="mt-0.5 shrink-0 text-[#b8862b]" />
                              <dt className="sr-only">Team</dt>
                              <dd>{agent.team}</dd>
                            </div>
                            <div className="flex items-start gap-2">
                              <Mail size={16} className="mt-0.5 shrink-0 text-[#b8862b]" />
                              <dt className="sr-only">Email</dt>
                              <dd className="break-all">{email.trim().toLowerCase()}</dd>
                            </div>
                          </dl>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-[#d4a437]/60 bg-[#fdf8ea] px-4 py-4 text-sm text-[#5c4a2a]" role="status">
                          <p className="flex items-center gap-2 font-semibold text-[#2a1458]">
                            <Sparkles size={18} className="shrink-0 text-[#b8862b]" /> Welcome, guest
                          </p>
                          <p className="mt-1 break-all">
                            Registering with <span className="font-semibold text-[#2a1458]">{email.trim().toLowerCase()}</span>
                          </p>
                        </div>
                      )}
                      <button type="button" onClick={startOver} className="!mt-2 text-xs font-semibold text-[#6b4a12] underline-offset-2 hover:underline">
                        Not you? Use a different email
                      </button>

                      {agent ? null : (
                        <div>
                          <label htmlFor="guest-name" className={labelClass}>
                            Full name
                          </label>
                          <div className="relative">
                            <User size={18} className={fieldIconClass} />
                            <Input id="guest-name" name="name" autoComplete="name" autoFocus value={form.name} onChange={update} required minLength={2} maxLength={200} placeholder="As it should appear on your ID" className={inputClass} />
                          </div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="guest-contact" className={labelClass}>
                          Contact number
                        </label>
                        <div className="relative">
                          <Phone size={18} className={fieldIconClass} />
                          <Input id="guest-contact" type="tel" name="contact_number" autoComplete="tel" value={form.contact_number} onChange={update} required minLength={5} maxLength={40} className={inputClass} />
                        </div>
                      </div>

                      <div className="border-t border-dashed border-[#e3d3a8] pt-5">
                        <OwnTicketFields name={recordName} fee={fee} value={ticket} onChange={setTicket} photos={photos} onPhotosChange={setPhotos} idPrefix="guest" />
                      </div>

                      {errorBox}

                      <motion.div whileHover={busy ? undefined : { scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                        <Button type="submit" disabled={busy} className={goldButtonClass}>
                          {busy ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="animate-spin" size={20} /> Registering…
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Check size={20} strokeWidth={3} /> Register
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  )}
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
