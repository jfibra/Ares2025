"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Check,
  Clock,
  Copy,
  Download,
  Facebook,
  Info,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  Search,
  Shirt,
  Ticket,
  TriangleAlert,
  Upload,
  User,
  UserCheck,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  POLO_SHIRT_SIZES,
  hasPaymentDetails,
  splitCouple,
  validateAgentDetails,
  resolvePartnerPoloSize,
  resolvePartnerBirthDate,
  type Attending,
  type TlPaymentDetails,
} from "@/lib/registrations"
import { PhotoField } from "@/components/photo-field"
import { isAdminTeam } from "@/lib/direct-teams"
import type { LeaderContact } from "@/lib/tl-contact"
import { GENERAL_REGISTRATION_NOTICE, generalRegistrationOpensAtMs } from "@/lib/registration-opening"
import { Particles, Reveal, staggerContainer, staggerItem } from "@/components/motion"
import {
  CornerFlourish,
  GoldRule,
  Lotus,
  PetalEdge,
  brownLattice,
  goldLattice,
  goldText,
} from "@/components/thai-ornaments"


const inputClass =
  "h-12 rounded-xl border-[#e3d3a8] bg-white px-4 text-base text-[#2a1a3d] placeholder:text-[#a89a7c] transition-all duration-300 focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)] focus-visible:ring-0 focus-visible:ring-offset-0"
const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"

/** Gold tick that pops into a field once its value is good. */
function FieldCheck({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.span
          aria-hidden
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          className="pointer-events-none absolute right-3 top-1/2 -mt-2.5 grid h-5 w-5 place-items-center rounded-full bg-[#d4a437] text-white"
        >
          <Check size={13} strokeWidth={3} />
        </motion.span>
      ) : null}
    </AnimatePresence>
  )
}

const steps = [
  { title: "Enter your LR email", text: "We look you up in our agent records." },
  { title: "Confirm it's you", text: "Check your details, upload a clear, formal photo, and register." },
  { title: "Pay your team leader", text: "They confirm your registration once they receive your fee." },
]

type Agent = { name: string; email: string; contact_number: string; team: string; team_leader: string }
type Stage = "email" | "confirm" | "done"
const emptyDetails = { birth_date: "", birth_date_2: "", whatsapp_number: "", polo_shirt_size: "", polo_shirt_size_2: "" }
type Notice = { tone: "info" | "warning"; title: string; text: string }

/** How to reach the team leader about the payment: their Facebook and contact number. Nothing when neither is known. */
function LeaderContactRow({ contact, leader }: { contact: LeaderContact | null | undefined; leader: string }) {
  if (!contact || (!contact.facebook_url && !contact.contact_number)) return null
  return (
    <div className="border-t border-[#e3d3a8] bg-white px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6a4a]">Questions? Contact {leader}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {contact.facebook_url ? (
          <a
            href={contact.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2a1458] px-4 text-sm font-bold text-[#fbe7a1] hover:bg-[#3a1f74]"
          >
            <Facebook size={16} /> Message on Facebook
          </a>
        ) : null}
        {contact.contact_number ? (
          <a
            href={`tel:${contact.contact_number.replace(/[^\d+]/g, "")}`}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e3d3a8] bg-white px-4 text-sm font-bold tabular-nums text-[#2a1458] hover:bg-[#fdf3d7]"
          >
            <Phone size={16} className="text-[#b8862b]" /> {contact.contact_number}
          </a>
        ) : null}
      </div>
    </div>
  )
}

/** Where to send the fee: every account and QR code the team leader listed, shown once the agent is registered. */
export function PaymentCard({
  payment,
  teamLeader,
  contact = null,
}: {
  payment: TlPaymentDetails | null
  teamLeader: string
  /** The team leader's Facebook and number. Left out when the admin handles the payment. */
  contact?: LeaderContact | null
}) {
  const [copied, setCopied] = useState<number | null>(null)
  const leader = teamLeader || "your team leader"

  if (!hasPaymentDetails(payment) || !payment) {
    return (
      <div className="mt-6 w-full max-w-md overflow-hidden rounded-2xl border border-[#e3d3a8] bg-[#fdf8ea] text-left text-sm text-[#4a3413]">
        <div className="flex gap-3 px-4 py-4">
          <Info size={18} className="mt-0.5 shrink-0 text-[#b8862b]" />
          <p className="leading-relaxed">
            <span className="font-semibold">
              {teamLeader ? teamLeader.charAt(0).toUpperCase() + teamLeader.slice(1) : "Your team leader"} has not added payment
              details yet.
            </span>{" "}
            Please ask them directly how to send your payment.
          </p>
        </div>
        <LeaderContactRow contact={contact} leader={leader} />
      </div>
    )
  }

  const copy = async (id: number, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(id)
      setTimeout(() => setCopied((current) => (current === id ? null : current)), 2000)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="mt-6 w-full max-w-md overflow-hidden rounded-2xl border border-[#d4a437]/60 bg-[#fdf8ea] text-left">
      <div className="bg-[#2a1458] px-4 py-3">
        <p className="text-sm font-bold text-[#fbe7a1]">How to pay {leader}</p>
        {payment.length > 1 ? <p className="mt-0.5 text-xs text-white/75">Choose any one of these {payment.length} accounts.</p> : null}
      </div>
      <ul className="divide-y divide-[#e3d3a8]">
        {payment.map((account) => (
          <li key={account.id} className="space-y-3 p-4">
            <p className="break-words text-lg font-black text-[#2a1458]">{account.bank}</p>

            {account.account_number ? (
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6a4a]">Account name</dt>
                  <dd className="break-words font-semibold text-[#2a1458]">{account.account_name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6a4a]">Account number</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <span className="break-all text-lg font-black tabular-nums text-[#2a1458]">{account.account_number}</span>
                    <button
                      type="button"
                      onClick={() => copy(account.id, account.account_number ?? "")}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e3d3a8] bg-white px-2.5 text-xs font-semibold text-[#6b4a12] hover:bg-[#fdf3d7]"
                    >
                      {copied === account.id ? <Check size={14} /> : <Copy size={14} />} {copied === account.id ? "Copied" : "Copy"}
                    </button>
                  </dd>
                </div>
              </dl>
            ) : null}

            {account.qr_url ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6a4a]">
                  {account.account_number ? "Or scan this QR code" : "Scan this QR code to pay"}
                </p>
                <div className="w-full max-w-[14rem] rounded-xl border border-[#e3d3a8] bg-white p-2">
                  <img src={account.qr_url} alt={`${account.bank} payment QR code of ${leader}`} className="h-auto w-full" />
                </div>
                <a
                  href={account.qr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6b4a12] underline-offset-2 hover:underline"
                >
                  <Download size={15} /> Open or save the QR code
                </a>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <LeaderContactRow contact={contact} leader={leader} />
    </div>
  )
}

const receiptDateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" })

/** After paying: the agent uploads their receipt, with an optional note, for their team leader to check. */
export function ReceiptUpload({
  email,
  teamLeader,
  sentAt,
  onSent,
}: {
  email: string
  teamLeader: string
  sentAt: string | null
  onSent: (sentAt: string) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // After a receipt is sent the form is tucked away; the agent can open it again to replace the receipt.
  const [open, setOpen] = useState(!sentAt)
  const leader = teamLeader || "your team leader"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    if (!file) return setError("Attach a photo or screenshot of your receipt.")
    if (file.size > 5 * 1024 * 1024) return setError("The receipt file is larger than 5 MB.")
    const form = new FormData()
    form.set("email", email.trim())
    form.set("note", note)
    form.set("receipt", file)
    setSending(true)
    setError(null)
    try {
      const response = await fetch("/api/registration/receipt", { method: "POST", body: form })
      const result = (await response.json().catch(() => null)) as Record<string, unknown> | null
      if (!response.ok || !result?.success) {
        setError(typeof result?.message === "string" ? result.message : "We could not send your receipt. Please try again.")
        return
      }
      onSent(typeof result.receipt_sent_at === "string" ? result.receipt_sent_at : new Date().toISOString())
      setFile(null)
      setNote("")
      setOpen(false)
    } catch {
      setError("Please check your connection and try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-4 w-full max-w-md rounded-2xl border border-[#d4a437]/60 bg-white px-4 py-4 text-left text-sm text-[#4a3413]">
      {sentAt ? (
        <div role="status" className="flex gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-600 text-white">
            <Check size={13} strokeWidth={3} />
          </span>
          <div className="leading-relaxed">
            <p className="font-semibold text-green-800">Receipt sent to {leader}</p>
            <p>
              Sent {receiptDateFormat.format(new Date(sentAt))}. They will confirm your registration once they have checked it.
            </p>
            {!open ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-1 font-semibold text-[#6b4a12] underline-offset-2 hover:underline"
              >
                Send a different receipt
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Receipt size={18} className="mt-0.5 shrink-0 text-[#b8862b]" />
          <p className="leading-relaxed">
            <span className="font-semibold text-[#2a1458]">Already paid?</span> Upload your receipt or a screenshot of the
            payment here so {leader} knows you have paid and can confirm your registration.
          </p>
        </div>
      )}

      {open ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="receipt-file" className={labelClass}>
              Receipt photo or screenshot <span className="text-[#b3261e]">*</span>
            </label>
            <input
              id="receipt-file"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-xl border border-[#e3d3a8] bg-white text-sm text-[#2a1a3d] file:mr-3 file:h-11 file:cursor-pointer file:border-0 file:bg-[#2a1458] file:px-4 file:text-sm file:font-semibold file:text-[#fbe7a1]"
            />
            <p className="mt-1.5 text-xs text-[#7a6a4a]">JPG, PNG, WEBP, HEIC or PDF, up to 5 MB.</p>
          </div>
          <div>
            <label htmlFor="receipt-note" className={labelClass}>
              Note <span className="font-normal text-[#7a6a4a]">(optional)</span>
            </label>
            <textarea
              id="receipt-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="e.g. Paid through GCash, reference no. 1234 567 890"
              className="w-full rounded-xl border border-[#e3d3a8] bg-white px-4 py-3 text-base text-[#2a1a3d] outline-none transition-all placeholder:text-[#a89a7c] focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)]"
            />
          </div>
          {error ? (
            <p role="alert" className="rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={sending}
            className="h-12 w-full rounded-xl border border-[#2a1458] bg-[#2a1458] text-base font-bold text-[#fbe7a1] hover:bg-[#1a0d3d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sending ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} {sending ? "Sending…" : "Send receipt"}
          </Button>
        </form>
      ) : null}
    </div>
  )
}

/** Turns a lookup or register answer that is not a plain success into a message for the agent. */
function noticeFor(result: Record<string, unknown> | null): Notice {
  switch (result?.status) {
    case "not_found":
      return {
        tone: "warning",
        title: "We couldn't find that email",
        text: "It is not in our agent records. Check the spelling, and make sure it is your LR email, not a personal one.",
      }
    case "general_only":
      return {
        tone: "info",
        title: "Pre-registration is for ARES 2025 attendees",
        text: GENERAL_REGISTRATION_NOTICE,
      }
    case "tl_not_registered":
      return {
        tone: "warning",
        title: "Your team leader hasn't registered yet",
        text: `${result.teamLeaderName ? `${result.teamLeaderName} (${result.team})` : `The leader of ${result.team}`} needs to register first. Please ask them, then come back.`,
      }
    case "full":
      return {
        tone: "warning",
        title: "Registration is full",
        text: "All available slots have been taken for now. Please ask your team leader or the ARES admin if more slots will open.",
      }
    case "already_registered":
      return result.confirmed
        ? { tone: "info", title: "You're already registered", text: "Your payment has been confirmed. See you in Bangkok!" }
        : {
            tone: "info",
            title: "You're already registered",
            text: `Your registration is waiting for ${result.admin_managed ? "the ARES admin" : result.teamLeaderName || "your team leader"} to confirm it.`,
          }
    case "unavailable":
      return {
        tone: "warning",
        title: "We can't check your details right now",
        text: "Our agent records are not reachable at the moment. Please try again later.",
      }
    default:
      return {
        tone: "warning",
        title: "Something went wrong",
        text: typeof result?.message === "string" ? result.message : "Please try again.",
      }
  }
}

const RegistrationPage = ({ slots = null }: { slots?: { limit: number; left: number } | null }) => {
  const reduce = useReducedMotion()

  const [stage, setStage] = useState<Stage>("email")
  const [email, setEmail] = useState("")
  const [agent, setAgent] = useState<Agent | null>(null)
  // True when this agent attended ARES 2025: they are welcomed back.
  const [pastAttendee, setPastAttendee] = useState(false)
  // Until general registration opens, only ARES 2025 attendees may register. Set after mount, from the device clock.
  const [preRegistration, setPreRegistration] = useState(false)
  useEffect(() => {
    const wait = generalRegistrationOpensAtMs - Date.now()
    if (wait <= 0) return
    setPreRegistration(true)
    // setTimeout cannot wait longer than about 24 days.
    const timer = setTimeout(() => setPreRegistration(false), Math.min(wait, 2_000_000_000))
    return () => clearTimeout(timer)
  }, [])
  const [form, setForm] = useState(emptyDetails)
  // For a couple's record: who is joining. Both means two people and double the fee.
  const [attending, setAttending] = useState<Attending | "">("")
  // Formal photos for the posters: the first is the agent (or the first person on a couple's record), the second their partner.
  const [photos, setPhotos] = useState<[File | null, File | null]>([null, null])
  const [people, setPeople] = useState(1)
  const [teamLeader, setTeamLeader] = useState("")
  // True when the agent's team leader is not joining: the ARES admin takes their payment and confirms it instead.
  const [adminManaged, setAdminManaged] = useState(false)
  const [fee, setFee] = useState<number | null>(null)
  const [payment, setPayment] = useState<TlPaymentDetails | null>(null)
  // The team leader's Facebook and number, shown with the payment details.
  const [leaderContact, setLeaderContact] = useState<LeaderContact | null>(null)
  // The named person who takes the payment for a team the admin handles; null means "the ARES admin".
  const [payee, setPayee] = useState<string | null>(null)
  // True when someone who registered earlier came back to see how to pay.
  const [returning, setReturning] = useState(false)
  // The fee changed after they registered and they have not paid yet.
  const [feeChanged, setFeeChanged] = useState(false)
  // When this agent uploaded proof of payment, if they have.
  const [receiptSentAt, setReceiptSentAt] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim())
  const activeStep = stage === "email" ? 0 : stage === "confirm" ? 1 : 2

  const post = async (url: string, extra: Record<string, string> = {}) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: email.trim(), ...extra }),
    })
    return (await response.json().catch(() => null)) as Record<string, unknown> | null
  }

  /** Step 1: look the agent up. */
  const findAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setNotice(null)
    try {
      const result = await post("/api/registration/lookup")
      if (result?.success && result.status === "found") {
        setAgent(result.agent as Agent)
        setPastAttendee(result.past_attendee === true)
        setAdminManaged(result.admin_managed === true)
        setAttending("")
        setFee(typeof result.fee === "number" ? result.fee : null)
        setStage("confirm")
      } else if (result?.success && result.status === "already_registered" && !result.confirmed) {
        // Registered but not yet paid: show again where to send the fee.
        setAgent(null)
        setAdminManaged(result.admin_managed === true)
        setTeamLeader(typeof result.teamLeaderName === "string" ? result.teamLeaderName : "")
        setFee(typeof result.fee === "number" ? result.fee : null)
        setPayment((result.payment as TlPaymentDetails | null) ?? null)
        setLeaderContact((result.leader_contact as LeaderContact | null) ?? null)
        setPayee(typeof result.payee === "string" ? result.payee : null)
        setPeople(result.attendee_count === 2 ? 2 : 1)
        setReceiptSentAt(typeof result.receipt_sent_at === "string" ? result.receipt_sent_at : null)
        setFeeChanged(result.fee_changed === true)
        setReturning(true)
        setStage("done")
      } else {
        setNotice(noticeFor(result))
      }
    } catch {
      setNotice(noticeFor({ message: "Please check your connection and try again." }))
    } finally {
      setBusy(false)
    }
  }

  const couple = agent ? splitCouple(agent.name) : null
  // Their team has no team leader for ARES: the admin handles it.
  const adminTeam = agent ? isAdminTeam(agent.team) : false
  // Whose photo is needed: everyone joining. A couple chooses who is joining first.
  const photoSlots: { index: 0 | 1; label: string }[] = !couple
    ? [{ index: 0, label: "Upload your photo" }]
    : ([0, 1] as const)
        .filter((index) => attending === "both" || attending === (index === 0 ? "first" : "second"))
        .map((index) => ({ index, label: `Formal photo of ${couple[index]}` }))
  const setPhoto = (index: 0 | 1, file: File | null) =>
    setPhotos((current) => (index === 0 ? [file, current[1]] : [current[0], file]))
  const money = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value)

  /** Step 2: "Yes, this is me", plus the details only the agent can give. */
  const register = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    const checked = validateAgentDetails(form)
    if (!checked.ok) {
      setNotice({ tone: "warning", title: "Please check your details", text: checked.message })
      return
    }
    if (couple && !attending) {
      setNotice({ tone: "warning", title: "Please check your details", text: "Please tell us who is joining." })
      return
    }
    const partnerBirth = resolvePartnerBirthDate(couple && attending === "both" ? 2 : 1, form.birth_date_2)
    if (!partnerBirth.ok) {
      setNotice({ tone: "warning", title: "Please check your details", text: partnerBirth.message })
      return
    }
    // Two people joining means two shirts.
    const partnerSize = resolvePartnerPoloSize(couple && attending === "both" ? 2 : 1, form.polo_shirt_size_2)
    if (!partnerSize.ok) {
      setNotice({ tone: "warning", title: "Please check your details", text: partnerSize.message })
      return
    }
    if (photoSlots.some((slot) => !photos[slot.index])) {
      setNotice({
        tone: "warning",
        title: "Please check your details",
        text:
          photoSlots.length === 2
            ? "Please upload a clear, formal photo of each of you."
            : "Please upload a clear, formal photo of yourself.",
      })
      return
    }
    const body = new FormData()
    body.set("email", email.trim())
    Object.entries(checked.details).forEach(([key, value]) => body.set(key, value))
    if (attending) body.set("attending", attending)
    if (partnerSize.polo_shirt_size_2) body.set("polo_shirt_size_2", partnerSize.polo_shirt_size_2)
    if (partnerBirth.birth_date_2) body.set("birth_date_2", partnerBirth.birth_date_2)
    photoSlots.forEach((slot) => body.append("photo", photos[slot.index] as File))
    setBusy(true)
    setNotice(null)
    try {
      const response = await fetch("/api/registration", { method: "POST", headers: { Accept: "application/json" }, body })
      const result = (await response.json().catch(() => null)) as Record<string, unknown> | null
      if (result?.success) {
        setAdminManaged(result.admin_managed === true)
        setTeamLeader(typeof result.team_leader === "string" ? result.team_leader : agent?.team_leader ?? "")
        setFee(typeof result.fee === "number" ? result.fee : null)
        setPayment((result.payment as TlPaymentDetails | null) ?? null)
        setLeaderContact((result.leader_contact as LeaderContact | null) ?? null)
        setPayee(typeof result.payee === "string" ? result.payee : null)
        setPeople(result.attendee_count === 2 ? 2 : 1)
        setReceiptSentAt(null)
        setFeeChanged(false)
        setReturning(false)
        setStage("done")
      } else if (result?.status === "invalid_details") {
        // A field was rejected: stay on this step so nothing typed is lost.
        setNotice(noticeFor(result))
      } else {
        setStage("email")
        setNotice(noticeFor(result))
      }
    } catch {
      setNotice(noticeFor({ message: "Please check your connection and try again." }))
    } finally {
      setBusy(false)
    }
  }

  const notMe = () => {
    setAgent(null)
    setPastAttendee(false)
    setAdminManaged(false)
    setForm(emptyDetails)
    setPhotos([null, null])
    setStage("email")
    setNotice({
      tone: "info",
      title: "No problem",
      text: "Check your LR email address and try again. If your details in our records are wrong, please contact us.",
    })
  }

  const startOver = () => {
    setAgent(null)
    setPastAttendee(false)
    setAdminManaged(false)
    setReceiptSentAt(null)
    setAttending("")
    setPeople(1)
    setFee(null)
    setPayment(null)
    setLeaderContact(null)
    setPayee(null)
    setReturning(false)
    setForm(emptyDetails)
    setPhotos([null, null])
    setEmail("")
    setNotice(null)
    setStage("email")
  }

  // ---- Hero: photo and glow drift with the pointer ----------------------------
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 60, damping: 18 })
  const smoothY = useSpring(pointerY, { stiffness: 60, damping: 18 })
  const bgX = useTransform(smoothX, (v) => v * -18)
  const bgY = useTransform(smoothY, (v) => v * -12)
  const glowX = useTransform(smoothX, (v) => v * 240)
  const glowY = useTransform(smoothY, (v) => v * 130)
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

  // ---- Welcome panel: gold spotlight under the pointer ------------------------
  const spotX = useMotionValue(-400)
  const spotY = useMotionValue(-400)
  const spotlight = useMotionTemplate`radial-gradient(280px circle at ${spotX}px ${spotY}px, rgba(243,210,122,0.24), transparent 70%)`
  const onPanelPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch") return
    const rect = e.currentTarget.getBoundingClientRect()
    spotX.set(e.clientX - rect.left)
    spotY.set(e.clientY - rect.top)
  }
  const onPanelPointerLeave = () => {
    spotX.set(-400)
    spotY.set(-400)
  }

  const ease = [0.22, 1, 0.36, 1] as const
  const panelMotion = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.35, ease },
  }
  const goldButtonClass =
    "shine group relative h-14 w-full overflow-hidden rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] text-lg font-bold text-[#2a1408] shadow-[0_12px_30px_-10px_rgba(184,134,43,0.8)] transition-all duration-300 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"

  const today = new Date().toISOString().slice(0, 10)
  const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }))

  const details = agent
    ? [
        { icon: User, label: "Name", value: agent.name },
        { icon: Mail, label: "Email", value: agent.email },
        { icon: Phone, label: "Contact number", value: agent.contact_number || "Not on record" },
        { icon: Users, label: "Team", value: agent.team },
        {
          icon: UserCheck,
          label: "Team leader",
          value: adminTeam ? "Handled by the ARES admin" : adminManaged ? `${agent.team_leader ? `${agent.team_leader} ` : ""}(not joining ARES 2027)` : agent.team_leader,
        },
      ]
    : []

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen font-sans">
        {/* ------------------------------------------------------------------ */}
        {/* HERO                                                                 */}
        {/* ------------------------------------------------------------------ */}
        <section
          onPointerMove={onHeroPointerMove}
          onPointerLeave={onHeroPointerLeave}
          className="relative flex min-h-[58vh] items-center overflow-hidden bg-[#120a2e] text-white"
        >
          <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ x: bgX, y: bgY, scale: 1.08 }}>
            <img src="/bangkok.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#120a2e]/85 via-[#3a0d2a]/70 to-[#120a2e]" />
          <div aria-hidden className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: goldLattice }} />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
            <motion.div className="h-[28rem] w-[28rem] rounded-full bg-[#d4a437]/25 blur-[130px]" style={{ x: glowX, y: glowY }} />
          </div>
          {/* Drifting gold dust */}
          <Particles count={45} color="243,210,122" />

          <div className="container relative z-10 mx-auto px-4 pb-24 pt-36 text-center sm:px-6 md:pt-44">
            <motion.div variants={staggerContainer} initial="hidden" animate="show">
              <div className="motion-safe:animate-float-slow">
                <Lotus bloom className="mx-auto h-12 w-20 text-[#f0c24b]" />
              </div>
              <motion.p variants={staggerItem} className="mt-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#f3d27a]">
                <span lang="th" className="align-middle text-xl tracking-normal">
                  สวัสดี
                </span>
                <span className="mx-3 text-[#d4a437]/70">◆</span>
                Sawasdee
              </motion.p>
              <motion.h1
                variants={staggerItem}
                className={`mt-4 pb-2 text-5xl font-black uppercase leading-[1.05] tracking-tight md:text-7xl ${goldText}`}
              >
                Registration
              </motion.h1>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.5, ease }}
                className="mx-auto mt-5 max-w-xs"
              >
                <GoldRule />
              </motion.div>
              <motion.p variants={staggerItem} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
                Reserve your seat at the Asian Real Estate Summit 2027 in the City of Angels.
              </motion.p>
              <motion.div variants={staggerItem} className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d4a437]/50 bg-[#120a2e]/60 px-4 py-2 text-[#fbe7a1] backdrop-blur">
                  <MapPin size={16} /> Bangkok, Thailand
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d4a437]/50 bg-[#120a2e]/60 px-4 py-2 text-[#fbe7a1] backdrop-blur">
                  <CalendarDays size={16} /> July 13, 2027
                </span>
              </motion.div>
              {slots && slots.limit > 0 ? (
                <motion.div variants={staggerItem} className="mt-6 flex justify-center">
                  <p className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl border border-[#f0c24b]/70 bg-[#d4a437]/15 px-5 py-3 text-sm text-white backdrop-blur sm:text-base">
                    <Ticket size={18} className="shrink-0 text-[#f0c24b]" />
                    {slots.left > 0 ? (
                      <>
                        <span>
                          Only <span className={`text-lg font-black sm:text-xl ${goldText}`}>{slots.limit.toLocaleString()} slots</span>{" "}
                          available
                          {slots.left < slots.limit ? (
                            <>
                              , <span className="font-bold text-[#fbe7a1]">{slots.left.toLocaleString()} left</span>
                            </>
                          ) : null}
                          .
                        </span>
                        <span className="font-semibold text-[#fbe7a1]">Reserve your slot now.</span>
                      </>
                    ) : (
                      <span className="font-semibold text-[#fbe7a1]">
                        All {slots.limit.toLocaleString()} slots have been taken. Registration is full for now.
                      </span>
                    )}
                  </p>
                </motion.div>
              ) : null}
            </motion.div>
          </div>

          <PetalEdge fill="#fbf5e6" className="absolute inset-x-0 bottom-0 z-10" />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* REGISTRATION                                                         */}
        {/* ------------------------------------------------------------------ */}
        <section className="relative bg-[#fbf5e6] py-16 md:py-24">
          <div aria-hidden className="absolute inset-0 opacity-[0.09]" style={{ backgroundImage: brownLattice }} />

          <div className="container relative mx-auto px-4 sm:px-6">
            <Reveal className="mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-[28px] border border-[#d4a437]/60 bg-white shadow-[0_30px_80px_-30px_rgba(58,13,42,0.45)] lg:grid lg:grid-cols-5">
                {/* Welcome panel */}
                <aside
                  onPointerMove={onPanelPointerMove}
                  onPointerLeave={onPanelPointerLeave}
                  className="relative overflow-hidden bg-gradient-to-br from-[#2a1458] via-[#1a0d3d] to-[#3a0d2a] p-8 text-white sm:p-10 lg:col-span-2"
                >
                  <div aria-hidden className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: goldLattice }} />
                  <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />
                  <div className="relative">
                    <Lotus className="h-10 w-16 text-[#f0c24b]" />
                    <p lang="th" className="mt-5 text-lg font-medium text-[#f3d27a]">
                      ยินดีต้อนรับ
                    </p>
                    <h2 className={`pb-1 text-3xl font-black leading-tight ${goldText}`}>Welcome to Bangkok</h2>
                    <p className="mt-4 leading-relaxed text-white/75">
                      Agents register in three steps. Your team leader must already be registered.
                    </p>

                    <GoldRule className="my-8" />

                    <ol className="space-y-6">
                      {steps.map((step, i) => {
                        const done = i < activeStep
                        const active = i === activeStep
                        return (
                          <li
                            key={step.title}
                            aria-current={active ? "step" : undefined}
                            className={`flex gap-4 transition-opacity duration-500 ${done || active ? "" : "opacity-55"}`}
                          >
                            <span className="relative mt-1 h-9 w-9 shrink-0">
                              {active && !reduce ? (
                                <motion.span
                                  aria-hidden
                                  className="absolute inset-0 rotate-45 border border-[#f3d27a]"
                                  animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
                                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                                />
                              ) : null}
                              <span
                                className={`absolute inset-0 grid rotate-45 place-items-center border border-[#d4a437] transition-colors duration-500 ${
                                  done ? "bg-[#d4a437]" : "bg-[#d4a437]/10"
                                }`}
                              >
                                <span className="-rotate-45 text-sm font-bold text-[#f3d27a]">
                                  {done ? <Check size={16} strokeWidth={3} className="text-[#2a1408]" /> : i + 1}
                                </span>
                              </span>
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-white">{step.title}</p>
                              <p className="mt-1 text-sm leading-relaxed text-white/65">{step.text}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                </aside>

                {/* Flow panel */}
                <div className="relative p-6 sm:p-10 lg:col-span-3">
                  <CornerFlourish className="right-2 top-2 rotate-90" />
                  <CornerFlourish className="bottom-2 right-2 hidden rotate-180 sm:block" />

                  <AnimatePresence mode="wait">
                    {stage === "email" ? (
                      <motion.div key="email" {...panelMotion}>
                        <div className="mb-8 pr-10">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Step 1 of 3</p>
                          <h2 className="mt-2 text-3xl font-black text-[#2a1458]">Find your details</h2>
                          <p className="mt-2 text-sm text-[#7a6a4a]">
                            Enter your <strong className="text-[#2a1458]">LR email</strong>, the one on your agent record. We will fill
                            in the rest for you.
                          </p>
                        </div>

                        {preRegistration ? (
                          <div className="mb-6 flex gap-3 rounded-xl border border-[#d4a437]/60 bg-[#fdf3d7] px-4 py-3 text-sm text-[#4a3413]">
                            <Info size={18} className="mt-0.5 shrink-0 text-[#b8862b]" />
                            <p className="leading-relaxed">
                              <span className="font-semibold text-[#2a1458]">Pre-registration is open for ARES 2025 attendees.</span>{" "}
                              {GENERAL_REGISTRATION_NOTICE}
                            </p>
                          </div>
                        ) : null}

                        <form onSubmit={findAgent} className="space-y-6">
                          <div>
                            <label htmlFor="reg-email" className={labelClass}>
                              LR email
                            </label>
                            <div className="relative">
                              <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
                              <Input
                                id="reg-email"
                                type="email"
                                inputMode="email"
                                name="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder="Your LR email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={`${inputClass} pl-11 pr-10`}
                              />
                              <FieldCheck show={emailValid} />
                            </div>
                          </div>

                          <AnimatePresence>
                            {notice ? (
                              <motion.div
                                key={notice.title}
                                role={notice.tone === "warning" ? "alert" : "status"}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${
                                  notice.tone === "warning"
                                    ? "border-[#b3261e]/25 bg-[#b3261e]/5 text-[#7d1812]"
                                    : "border-[#e3d3a8] bg-[#fdf8ea] text-[#4a3413]"
                                }`}
                              >
                                {notice.tone === "warning" ? (
                                  <TriangleAlert size={18} className="mt-0.5 shrink-0" />
                                ) : (
                                  <Info size={18} className="mt-0.5 shrink-0 text-[#b8862b]" />
                                )}
                                <div>
                                  <p className="font-semibold">{notice.title}</p>
                                  <p className="mt-0.5 leading-relaxed">{notice.text}</p>
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>

                          <motion.div whileHover={reduce || busy ? undefined : { scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                            <Button type="submit" disabled={busy} className={goldButtonClass}>
                              {busy ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader2 className="animate-spin" size={20} /> Checking…
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  <Search size={20} className="transition-transform duration-300 group-hover:scale-125" /> Find my
                                  details
                                </span>
                              )}
                            </Button>
                          </motion.div>
                        </form>

                        <p className="mt-8 border-t border-dashed border-[#d4a437]/60 pt-5 text-sm text-[#7a6a4a]">
                          Are you a team leader?{" "}
                          <Link href="/tl/login" className="font-semibold text-[#6b4a12] underline-offset-2 hover:underline">
                            Sign in to confirm your agents
                          </Link>
                        </p>
                      </motion.div>
                    ) : stage === "confirm" && agent ? (
                      <motion.div key="confirm" {...panelMotion}>
                        <div className="mb-6 pr-10">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Step 2 of 3</p>
                          <h2 className="mt-2 text-3xl font-black text-[#2a1458]">Is this you?</h2>
                          <p className="mt-2 text-sm text-[#7a6a4a]">These details come from your agent record.</p>
                        </div>

                        {adminManaged ? (
                          <div className="mb-6 flex gap-3 rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] px-4 py-3 text-sm text-[#4a3413]">
                            <Info size={18} className="mt-0.5 shrink-0 text-[#b8862b]" />
                            <p className="leading-relaxed">
                              <span className="font-semibold text-[#2a1458]">
                                {adminTeam ? `${agent?.team ?? "Your team"} is handled by the ARES admin.` : "Your team leader is not joining ARES 2027."}
                              </span>{" "}
                              {adminTeam ? "The" : "You can still register: the"} ARES admin will receive your payment and confirm your
                              registration.
                            </p>
                          </div>
                        ) : null}

                        {pastAttendee ? (
                          <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-[#d4a437] bg-gradient-to-r from-[#2a1458] to-[#3a0d2a] px-4 py-3.5 text-[#fbe7a1]">
                            <Lotus className="h-7 w-11 shrink-0 text-[#f0c24b]" />
                            <p className="leading-snug">
                              <span className="block text-base font-black text-white">Welcome back to ARES!</span>
                              <span className="text-sm">Proceed to register.</span>
                            </p>
                          </div>
                        ) : null}

                        <motion.dl
                          variants={staggerContainer}
                          initial="hidden"
                          animate="show"
                          className="overflow-hidden rounded-2xl border border-[#e3d3a8] bg-[#fdf8ea]"
                        >
                          {details.map(({ icon: Icon, label, value }) => (
                            <motion.div
                              key={label}
                              variants={staggerItem}
                              className="flex items-center gap-4 border-b border-[#f1e6c8] px-4 py-3.5 last:border-0"
                            >
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#b8862b] shadow-sm">
                                <Icon size={18} />
                              </span>
                              <div className="min-w-0">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6a4a]">{label}</dt>
                                <dd className="break-words font-semibold text-[#2a1458]">{value}</dd>
                              </div>
                            </motion.div>
                          ))}
                        </motion.dl>

                        <form onSubmit={register}>
                        {couple ? (
                          <div className="mt-6">
                            <label htmlFor="reg-attending" className={labelClass}>
                              Who is joining? <span className="text-[#b3261e]">*</span>
                            </label>
                            <p className="-mt-1 mb-2 text-sm text-[#7a6a4a]">
                              This record is for two people. Each person joining pays the registration fee.
                            </p>
                            <div className="relative">
                              <Users size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
                              <select
                                id="reg-attending"
                                name="attending"
                                value={attending}
                                onChange={(e) => {
                                  setAttending(e.target.value as Attending)
                                  setForm((current) => ({ ...current, polo_shirt_size_2: "", birth_date_2: "" }))
                                }}
                                required
                                className={`${inputClass} w-full border pl-11 outline-none ${attending ? "font-bold text-[#2a1458]" : "text-[#a89a7c]"}`}
                              >
                                <option value="" disabled>
                                  Choose who is joining
                                </option>
                                <option value="first" className="font-bold text-[#2a1458]">{`${couple[0]} only`}</option>
                                <option value="second" className="font-bold text-[#2a1458]">{`${couple[1]} only`}</option>
                                <option value="both" className="font-bold text-[#2a1458]">Both of us</option>
                              </select>
                            </div>
                            {attending ? (
                              <p className="mt-2 text-sm text-[#5c4a2a]">
                                {attending === "both" ? "2 people" : "1 person"}
                                {fee !== null ? (
                                  <>
                                    {" · "}Registration fee:{" "}
                                    <span className="font-bold tabular-nums text-[#2a1458]">{money(fee * (attending === "both" ? 2 : 1))}</span>
                                  </>
                                ) : null}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                        <div className="mt-6">
                          <p className="text-sm font-bold text-[#2a1458]">A few more details</p>
                          <p className="mt-1 text-sm text-[#7a6a4a]">All of these are required to register.</p>
                          <div className="mt-4 grid items-end gap-5 sm:grid-cols-2">
                            <div>
                              <label htmlFor="reg-birth-date" className={labelClass}>
                                {couple && attending === "both" ? `Birth date of ${couple[0]}` : "Birth date"}{" "}
                                <span className="text-[#b3261e]">*</span>
                              </label>
                              <div className="relative">
                                <CalendarDays size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
                                <Input
                                  id="reg-birth-date"
                                  type="date"
                                  name="birth_date"
                                  autoComplete="bday"
                                  min="1900-01-01"
                                  max={today}
                                  value={form.birth_date}
                                  onChange={updateForm}
                                  required
                                  className={`${inputClass} pl-11`}
                                />
                              </div>
                            </div>
                            {couple && attending === "both" ? (
                              <div>
                                <label htmlFor="reg-birth-date-2" className={labelClass}>
                                  Birth date of {couple[1]} <span className="text-[#b3261e]">*</span>
                                </label>
                                <div className="relative">
                                  <CalendarDays size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
                                  <Input
                                    id="reg-birth-date-2"
                                    type="date"
                                    name="birth_date_2"
                                    min="1900-01-01"
                                    max={today}
                                    value={form.birth_date_2}
                                    onChange={updateForm}
                                    required
                                    className={`${inputClass} pl-11`}
                                  />
                                </div>
                              </div>
                            ) : null}
                            <div className={couple && attending === "both" ? "sm:col-span-2" : undefined}>
                              <label htmlFor="reg-whatsapp" className={labelClass}>
                                WhatsApp number <span className="text-[#b3261e]">*</span>
                              </label>
                              <div className="relative">
                                <MessageCircle size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
                                <Input
                                  id="reg-whatsapp"
                                  type="tel"
                                  inputMode="tel"
                                  name="whatsapp_number"
                                  autoComplete="tel"
                                  placeholder="+63 917 123 4567"
                                  value={form.whatsapp_number}
                                  onChange={updateForm}
                                  required
                                  maxLength={25}
                                  className={`${inputClass} pl-11`}
                                />
                              </div>
                            </div>
                            <div className={couple && attending === "both" ? undefined : "sm:col-span-2"}>
                              <label htmlFor="reg-polo-size" className={labelClass}>
                                {couple && attending === "both" ? `Polo shirt size of ${couple[0]}` : "Polo shirt size"}{" "}
                                <span className="text-[#b3261e]">*</span>
                              </label>
                              <div className="relative">
                                <Shirt size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
                                <select
                                  id="reg-polo-size"
                                  name="polo_shirt_size"
                                  value={form.polo_shirt_size}
                                  onChange={updateForm}
                                  required
                                  className={`${inputClass} w-full border pl-11 outline-none ${form.polo_shirt_size ? "" : "text-[#a89a7c]"}`}
                                >
                                  <option value="" disabled>
                                    Choose a size
                                  </option>
                                  {POLO_SHIRT_SIZES.map((size) => (
                                    <option key={size} value={size} className="text-[#2a1a3d]">
                                      {size}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {couple && attending === "both" ? (
                              <div>
                                <label htmlFor="reg-polo-size-2" className={labelClass}>
                                  Polo shirt size of {couple[1]} <span className="text-[#b3261e]">*</span>
                                </label>
                                <div className="relative">
                                  <Shirt size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
                                  <select
                                    id="reg-polo-size-2"
                                    name="polo_shirt_size_2"
                                    value={form.polo_shirt_size_2}
                                    onChange={updateForm}
                                    required
                                    className={`${inputClass} w-full border pl-11 outline-none ${form.polo_shirt_size_2 ? "" : "text-[#a89a7c]"}`}
                                  >
                                    <option value="" disabled>
                                      Choose a size
                                    </option>
                                    {POLO_SHIRT_SIZES.map((size) => (
                                      <option key={size} value={size} className="text-[#2a1a3d]">
                                        {size}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-6">
                          <p className="text-sm font-bold text-[#2a1458]">
                            Your formal photo <span className="text-[#b3261e]">*</span>
                          </p>
                          <p className="mt-1 text-sm text-[#7a6a4a]">
                            Upload a <strong className="text-[#2a1458]">clear, formal photo</strong> of yourself. We will use it for verification purposes, so it is required to register.
                          </p>
                          <ul className="mt-3 space-y-1.5 rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] px-4 py-3 text-sm text-[#4a3413]">
                            {[
                              "Formal or business attire",
                              "Clear and sharp, with good lighting: not blurry, dark or pixelated",
                              "Only you in the photo, facing the camera, from the chest or waist up",
                              "Plain background, with no sunglasses, caps or filters",
                            ].map((rule) => (
                              <li key={rule} className="flex gap-2">
                                <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-[#b8862b]" /> {rule}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 space-y-4">
                            {photoSlots.length ? (
                              photoSlots.map((slot) => (
                                <PhotoField
                                  key={slot.index}
                                  id={`reg-photo-${slot.index + 1}`}
                                  label={slot.label}
                                  file={photos[slot.index]}
                                  onChange={(file) => setPhoto(slot.index, file)}
                                />
                              ))
                            ) : (
                              <p className="text-sm text-[#7a6a4a]">Choose who is joining above, then upload a photo of each person.</p>
                            )}
                          </div>
                        </div>

                        {notice ? (
                          <p role="alert" className="mt-4 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
                            {notice.text}
                          </p>
                        ) : null}

                        <div className="mt-6 space-y-3">
                          <motion.div whileHover={reduce || busy ? undefined : { scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                            <Button type="submit" disabled={busy} className={goldButtonClass}>
                              {busy ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader2 className="animate-spin" size={20} /> Registering…
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  <Ticket size={20} className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125" />{" "}
                                  Yes, register me
                                </span>
                              )}
                            </Button>
                          </motion.div>
                          <Button
                            type="button"
                            onClick={notMe}
                            disabled={busy}
                            className="h-12 w-full rounded-xl border border-[#e3d3a8] bg-white text-base font-semibold text-[#6b4a12] hover:bg-[#fdf3d7]"
                          >
                            <ArrowLeft size={18} /> No, this isn&apos;t me
                          </Button>
                        </div>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="done"
                        {...panelMotion}
                        className="flex h-full flex-col items-center justify-center py-6 text-center"
                        role="status"
                      >
                        <Lotus bloom className="h-16 w-28 text-[#c9972f]" />
                        <p lang="th" className="mt-5 text-lg font-medium text-[#b8862b]">
                          ขอบคุณ
                        </p>
                        <h2 className="text-3xl font-black text-[#2a1458]">{returning ? "You're already registered" : "Registration received"}</h2>
                        <GoldRule className="mt-4 w-48" />
                        <p className="mx-auto mt-5 max-w-md text-[#5c4a2a]">
                          {returning ? "Your payment has not been confirmed yet." : `Thank you${agent ? `, ${agent.name}` : ""}.`} To
                          complete your registration, pay{" "}
                          {fee !== null ? (
                            <strong className="text-[#2a1458]">
                              {money(fee)}
                              {people === 2 ? " (for 2 people)" : ""}
                            </strong>
                          ) : (
                            "the registration fee"
                          )}{" "}
                          {adminManaged
                            ? `to ${payee ?? "the ARES admin"}. ${payee ? "It" : "The admin"} will ${payee ? "be confirmed" : "confirm it"} once received.`
                            : `to your team leader${teamLeader ? `, ${teamLeader}` : ""}. They will confirm it once received.`}
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
                            Please pay and upload your receipt within 3 days of registering. A registration that is still
                            unpaid after 3 days is removed, and you would need to register again.
                          </p>
                        )}
                        <PaymentCard
                          payment={payment}
                          teamLeader={adminManaged ? (payee ?? "the ARES admin") : teamLeader}
                          contact={leaderContact}
                        />
                        <ReceiptUpload
                          email={email}
                          teamLeader={adminManaged ? (payee ?? "the ARES admin") : teamLeader}
                          sentAt={receiptSentAt}
                          onSent={setReceiptSentAt}
                        />
                        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e3d3a8] bg-[#fdf3d7] px-4 py-2 text-sm font-semibold text-[#8a5a00]">
                          <Clock size={16} /> {receiptSentAt
                            ? `Waiting for ${adminManaged ? "the ARES admin" : "your team leader"} to confirm`
                            : `Waiting for payment to ${adminManaged ? (payee ?? "the ARES admin") : "your team leader"}`}
                        </p>
                        <Button
                          type="button"
                          onClick={startOver}
                          className="mt-8 h-12 rounded-xl border border-[#c9972f] bg-white px-6 text-base font-semibold text-[#6b4a12] hover:bg-[#fdf3d7]"
                        >
                          Register another agent
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </MotionConfig>
  )
}

export default RegistrationPage
