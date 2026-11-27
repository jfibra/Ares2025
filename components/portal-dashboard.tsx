"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MotionConfig, motion } from "framer-motion"
import QRCode from "qrcode"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ImageIcon,
  KeyRound,
  UserPlus,
  UserX,
  LayoutDashboard,
  Building2,
  Ticket,
  Info,
  Link2,
  Loader2,
  LogOut,
  QrCode,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Undo2,
  UserCog,
  Users,
  X,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Counter } from "@/components/motion"
import AdminManagedAgents from "@/components/admin-managed-agents"
import AdminGuestForm from "@/components/admin-guest-form"
import AgentQrPanel from "@/components/agent-qr-panel"
import PersonDetail, { type PersonTarget } from "@/components/person-detail"
import AdminTeamAccounts, { type TeamAccount } from "@/components/admin-team-accounts"
import AdminOverview from "@/components/admin-overview"
import { PaymentCountdown } from "@/components/payment-countdown"
import { FacebookLinkForm } from "@/components/facebook-link-form"
import { ADMIN_TEAMS, adminTeamOf, isAdminTeam } from "@/lib/direct-teams"
import { isOnPaymentClock, paymentDeadlineMs } from "@/lib/unpaid-rule"
import { OwnTicketCard } from "@/components/own-ticket-fields"
import PastAttendeesPanel from "@/components/past-attendees-panel"
import TlAssignPanel from "@/components/tl-assign-panel"
import { GoldRule, Lotus, brownLattice, goldLattice, goldText } from "@/components/thai-ornaments"
import {
  CURRENCY,
  PAYMENT_METHODS,
  MAX_PAYMENT_ACCOUNTS,
  hasPaymentDetails,
  splitCouple,
  poloSizesLabel,
  poloQuantity,
  type PaymentStatus,
  type Registration,
  type Remittance,
  type TeamLeader,
  type TlDecline,
  type TlPaymentAccount,
  type TlPaymentDetails,
} from "@/lib/registrations"

const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"

type Role = "admin" | "tl"
type Tab = "overview" | "qr" | "pending" | "confirmed" | "remittances" | "leaders" | "assign" | "declined" | "guests" | "adminteam" | "settings" | "payment" | "payadmin"
type Row = Record<string, unknown> & { id: number }
type Column = {
  key: string
  label: string
  render?: (row: Row) => React.ReactNode
  /** In the spreadsheet export only: the table shows this value inside another column's cell. */
  hidden?: boolean
  /** Extra classes for the cell. Cells stay on one line unless this allows wrapping. */
  cell?: string
}
// Long text (names, teams, notes) wraps inside a sensible width instead of squeezing the other columns.
const wrapCell = "whitespace-normal break-words"
const subText = "mt-0.5 text-xs font-normal text-[#7a6a4a]"
type Sort = { key: string; direction: "asc" | "desc" }
type PendingAction =
  | { kind: "registration"; row: Registration }
  | { kind: "leader"; row: TeamLeader }
  | { kind: "decline"; row: TlDecline }
  | { kind: "regenerate" }
  | { kind: "regenerateGuest" }
  | { kind: "verify"; row: Remittance }
  | null

// A fixed time zone keeps the server-rendered and browser-rendered text identical.
const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" })
const formatDate = (value: unknown) => (typeof value === "string" && value ? dateFormat.format(new Date(value)) : "—")
const dateOnlyFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" })
const timeOnlyFormat = new Intl.DateTimeFormat("en-PH", { timeStyle: "short", timeZone: "Asia/Manila" })
/** A date with its time on a second, quieter line, so the column stays narrow and easy to scan. */
const DateCell = ({ value }: { value: unknown }) =>
  typeof value === "string" && value ? (
    <div>
      <p className="text-[#2a1a3d]">{dateOnlyFormat.format(new Date(value))}</p>
      <p className="mt-0.5 text-xs text-[#7a6a4a]">{timeOnlyFormat.format(new Date(value))}</p>
    </div>
  ) : (
    <span className="text-[#a89a7c]">—</span>
  )
/** A person: name on top, email underneath. */
const PersonCell = ({ name, email, badge }: { name: unknown; email: unknown; badge?: React.ReactNode }) => (
  <div>
    <p className="font-semibold leading-snug text-[#2a1458]">
      {String(name)}
      {badge ? <> {badge}</> : null}
    </p>
    {email ? (
      <a href={`mailto:${email}`} className="mt-0.5 block break-all text-xs text-[#0078b6] hover:underline">
        {String(email)}
      </a>
    ) : null}
  </div>
)
const personCell = `${wrapCell} min-w-[13rem] max-w-[19rem]`
// The action buttons stay in view while the rest of a wide table scrolls sideways.
const stickyAction = "sticky right-0 shadow-[-10px_0_14px_-12px_rgba(42,20,88,0.45)]"
// A birth date is a plain calendar day (YYYY-MM-DD), so it is formatted without a time or zone shift.
const dayFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "UTC" })
const formatDay = (value: unknown) => (typeof value === "string" && value ? dayFormat.format(new Date(`${value}T00:00:00Z`)) : "—")
const dash = <span className="text-[#a89a7c]">—</span>
const moneyFormat = new Intl.NumberFormat("en-PH", { style: "currency", currency: CURRENCY })
const formatMoney = (value: unknown) => (value === null || value === undefined || value === "" ? "—" : moneyFormat.format(Number(value)))

const paymentBadge: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid: { label: "Not paid", className: "border-[#e3d3a8] bg-[#fdf3d7] text-[#8a5a00]" },
  paid_to_tl: { label: "Paid to TL", className: "border-sky-200 bg-sky-50 text-sky-800" },
  remitted: { label: "Sent to admin", className: "border-violet-200 bg-violet-50 text-violet-800" },
  verified: { label: "Fully paid", className: "border-green-200 bg-green-50 text-green-800" },
}
const remittanceBadge: Record<Remittance["status"], { label: string; className: string }> = {
  submitted: { label: "Waiting for admin", className: "border-violet-200 bg-violet-50 text-violet-800" },
  verified: { label: "Received", className: "border-green-200 bg-green-50 text-green-800" },
  rejected: { label: "Rejected", className: "border-red-200 bg-red-50 text-red-800" },
}
const Badge = ({ label, className }: { label: string; className: string }) => (
  <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>
)

function compareValues(x: unknown, y: unknown) {
  const blankX = x === null || x === undefined || x === ""
  const blankY = y === null || y === undefined || y === ""
  if (blankX || blankY) return blankX === blankY ? 0 : blankX ? 1 : -1 // blanks last
  if (typeof x === "number" && typeof y === "number") return x - y
  if (typeof x === "boolean" && typeof y === "boolean") return Number(x) - Number(y)
  return String(x).localeCompare(String(y), undefined, { sensitivity: "base", numeric: true })
}

const csvCell = (value: unknown) => {
  let text = value === null || value === undefined ? "" : String(value)
  // Stop spreadsheet apps from running a cell that starts like a formula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

function downloadCsv(filename: string, header: string[], lines: unknown[][]) {
  const text = [header, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n")
  const link = document.createElement("a")
  link.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }))
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

const outlineButton =
  "inline-flex h-11 items-center gap-2 rounded-xl border border-[#e3d3a8] bg-white px-4 text-sm font-semibold text-[#6b4a12] transition-colors hover:border-[#c9972f] hover:bg-[#fdf3d7] disabled:cursor-not-allowed disabled:opacity-50"
const goldButton =
  "shine relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] px-4 text-sm font-bold text-[#2a1408] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
const fieldClass =
  "h-11 w-full rounded-xl border border-[#e3d3a8] bg-white px-3 text-sm text-[#2a1a3d] outline-none transition-all placeholder:text-[#a89a7c] focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)]"
const fieldLabel = "mb-1.5 block text-sm font-semibold text-[#4a3413]"
const dialogClass = "rounded-2xl border-[#d4a437]/60 bg-white font-sans text-[#2a1a3d] sm:rounded-2xl"
const iconButton =
  "grid h-9 w-9 place-items-center rounded-lg border border-[#e3d3a8] bg-white text-[#7a6a4a] transition-colors hover:border-[#b3261e]/40 hover:bg-[#b3261e]/5 hover:text-[#b3261e] disabled:cursor-not-allowed"

export default function PortalDashboard({
  role,
  userLabel,
  initialRegistrations,
  initialRemittances,
  initialFee,
  initialFeeChangedAt = null,
  initialSlotLimit = 300,
  initialTeamLeaders = [],
  initialInviteToken = null,
  initialGuestInviteToken = null,
  initialPaymentDetails = null,
  initialFacebookUrl = null,
  initialContactNumber = null,
  sharedWith = null,
  initialAdminAccounts = [],
  initialTeamLogins = [],
  initialDeclines = [],
  ownEmail,
  ownName,
  ownDeclineReason = null,
  loadFailed,
}: {
  role: Role
  userLabel: string
  initialRegistrations: Registration[]
  initialRemittances: Remittance[]
  initialFee: number | null
  /** When the fee last changed: unpaid registrations made before this now owe the new fee. */
  initialFeeChangedAt?: string | null
  initialSlotLimit?: number
  initialTeamLeaders?: TeamLeader[]
  initialInviteToken?: string | null
  /** Admin: the code in the guest registration link. */
  initialGuestInviteToken?: string | null
  initialPaymentDetails?: TlPaymentDetails | null
  /** Team leader only: the Facebook link their agents use to contact them. */
  initialFacebookUrl?: string | null
  /** Team leader: the contact number their agents are shown. */
  initialContactNumber?: string | null
  /** Team leader: the names of the team leaders who share this dashboard, when the team has several. */
  sharedWith?: string[] | null
  initialAdminAccounts?: TlPaymentAccount[]
  /** Admin only: the accounts and the contact person shown to the agents of the team the admin handles. */
  initialTeamLogins?: TeamAccount[]
  initialDeclines?: TlDecline[]
  /** Team leader: their email and LR record name, to pick out (or add) their own registration. */
  ownEmail?: string
  ownName?: string
  /** Team leader: the reason they gave when they registered as not attending. */
  ownDeclineReason?: string | null
  loadFailed: boolean
}) {
  const router = useRouter()
  const isAdmin = role === "admin"
  const [rows, setRows] = useState(initialRegistrations)
  const [remittances, setRemittances] = useState(initialRemittances)
  const [fee, setFee] = useState(initialFee)
  const [feeChangedAt, setFeeChangedAt] = useState(initialFeeChangedAt)
  // Admin: how many people can register in total.
  const [slotLimit, setSlotLimit] = useState(initialSlotLimit)
  const [leaders, setLeaders] = useState(initialTeamLeaders)
  // Admin: team leaders who said they are not joining.
  const [declines, setDeclines] = useState(initialDeclines)
  // Team leader: where their agents send the registration fee.
  const [paymentDetails, setPaymentDetails] = useState(initialPaymentDetails)
  const [facebookUrl, setFacebookUrl] = useState(initialFacebookUrl)
  const [contactNumber, setContactNumber] = useState(initialContactNumber ?? "")
  const [contactDraft, setContactDraft] = useState(initialContactNumber ?? "")
  const [contactBusy, setContactBusy] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)
  const [contactSaved, setContactSaved] = useState(false)
  // The organizer's accounts: the admin manages them, team leaders send their collections there.
  const [adminAccounts, setAdminAccounts] = useState(initialAdminAccounts)
  // Team leader: agents ticked to send to the admin in one remittance.
  const [selected, setSelected] = useState<Set<number>>(() => new Set())
  const [remitOpen, setRemitOpen] = useState(false)
  const [rejecting, setRejecting] = useState<Remittance | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [inviteToken, setInviteToken] = useState(initialInviteToken)
  const [guestInviteToken, setGuestInviteToken] = useState(initialGuestInviteToken)
  const [tab, setTab] = useState<Tab>(role === "admin" ? "overview" : "pending")
  // The person whose page is open (opened by clicking their row).
  const [detail, setDetail] = useState<PersonTarget | null>(null)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<Sort>({ key: "registration_date", direction: "desc" })
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(loadFailed ? "Could not load everything. Try Refresh." : null)

  // Admin: agents whose team leader is not joining have no team leader on their registration. The admin
  // looks after them on the "Not joining" tab, so they are kept out of the Pending and Confirmed lists.
  // Guests (special registration through the admin's guest link) also pay the admin; they have their own tab.
  // Agents of the teams the admin handles directly (no team leader), shown on their own tab.
  const adminTeamAgents = useMemo(
    () => (isAdmin ? rows.filter((r) => r.team_leader_id === null && !r.guest_type && isAdminTeam(r.team)) : []),
    [isAdmin, rows],
  )
  const adminManaged = useMemo(
    () => (isAdmin ? rows.filter((r) => r.team_leader_id === null && !r.guest_type && !isAdminTeam(r.team)) : []),
    [isAdmin, rows],
  )
  const guests = useMemo(() => (isAdmin ? rows.filter((r) => Boolean(r.guest_type)) : []), [isAdmin, rows])
  const withLeader = useMemo(() => (isAdmin ? rows.filter((r) => r.team_leader_id !== null) : rows), [isAdmin, rows])
  const pending = useMemo(() => withLeader.filter((r) => !r.confirmed_by_tl), [withLeader])
  const confirmed = useMemo(() => withLeader.filter((r) => r.confirmed_by_tl), [withLeader])
  const toSend = useMemo(() => rows.filter((r) => r.payment_status === "paid_to_tl"), [rows])
  const selectedRows = useMemo(() => toSend.filter((r) => selected.has(r.id)), [toSend, selected])
  const sum = (list: { amount: number | null }[]) => list.reduce((total, item) => total + Number(item.amount ?? 0), 0)
  const agentsByRemittance = useMemo(() => {
    const map = new Map<number, Registration[]>()
    for (const r of rows) if (r.remittance_id !== null) map.set(r.remittance_id, [...(map.get(r.remittance_id) ?? []), r])
    return map
  }, [rows])
  // A team leader attends too: their own registration sits in the same list as their agents'.
  const leaderEmails = useMemo(
    () => new Set(isAdmin ? leaders.map((l) => l.email.toLowerCase()) : ownEmail ? [ownEmail.toLowerCase()] : []),
    [isAdmin, leaders, ownEmail],
  )
  const isLeaderRow = (r: Row) => leaderEmails.has(String(r.email).toLowerCase())
  const needsOwnTicket = !isAdmin && Boolean(ownEmail && ownName) && !loadFailed && !rows.some((r) => isLeaderRow(r as unknown as Row))
  const agentCounts = useMemo(() => {
    const counts = new Map<number, { pending: number; confirmed: number }>()
    for (const r of rows) {
      if (r.team_leader_id === null) continue
      const entry = counts.get(r.team_leader_id) ?? { pending: 0, confirmed: 0 }
      entry[r.confirmed_by_tl ? "confirmed" : "pending"] += 1
      counts.set(r.team_leader_id, entry)
    }
    return counts
  }, [rows])

  // Unpaid registrations made before the fee last changed: they owe the new fee.
  const owingNewFee = useMemo(() => {
    if (!feeChangedAt) return 0
    const changed = new Date(feeChangedAt).getTime()
    return rows.filter((r) => r.payment_status === "unpaid" && new Date(r.registration_date).getTime() < changed).length
  }, [rows, feeChangedAt])

  // ---- Requests ----------------------------------------------------------------
  /** Runs a request; sends the visitor back to sign-in if the session has ended. */
  const call = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, init)
    if (response.status === 401) {
      router.replace(`/${role}/login`)
      return null
    }
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.success) throw new Error(result?.message || "Something went wrong.")
    return result
  }

  const run = async (key: string, fallback: string, task: () => Promise<void>) => {
    setBusyKey(key)
    setErrorMessage(null)
    try {
      await task()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : fallback)
    } finally {
      setBusyKey(null)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    setErrorMessage(null)
    try {
      const result = await call(`/api/${role}/registrations`, { cache: "no-store" })
      if (result) {
        setRows(result.registrations)
        setRemittances(result.remittances)
        setFee(result.fee)
        setFeeChangedAt(result.feeChangedAt ?? null)
        if (typeof result.slotLimit === "number") setSlotLimit(result.slotLimit)
        setSelected(new Set())
        if (result.adminAccounts) setAdminAccounts(result.adminAccounts)
      }
      if (isAdmin) {
        const leaderResult = await call("/api/admin/team-leaders", { cache: "no-store" })
        if (leaderResult) setLeaders(leaderResult.teamLeaders)
        const declineResult = await call("/api/admin/tl-declines", { cache: "no-store" })
        if (declineResult) setDeclines(declineResult.declines)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not refresh.")
    } finally {
      setRefreshing(false)
    }
  }

  const setConfirmed = (row: Registration, value: boolean) =>
    run(`registration-${row.id}`, "Could not update the registration.", async () => {
      const result = await call(`/api/${role}/registrations/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed_by_tl: value }),
      })
      if (result) setRows((all) => all.map((r) => (r.id === row.id ? result.registration : r)))
    })

  const confirmPendingAction = () => {
    const action = pendingAction
    setPendingAction(null)
    if (!action) return
    if (action.kind === "registration") {
      run(`registration-${action.row.id}`, "Could not delete the registration.", async () => {
        const result = await call(`/api/admin/registrations/${action.row.id}`, { method: "DELETE" })
        if (result) setRows((all) => all.filter((r) => r.id !== action.row.id))
      })
    } else if (action.kind === "leader") {
      run(`leader-${action.row.id}`, "Could not delete the team leader.", async () => {
        const result = await call(`/api/admin/team-leaders/${action.row.id}`, { method: "DELETE" })
        if (result) setLeaders((all) => all.filter((l) => l.id !== action.row.id))
      })
    } else if (action.kind === "decline") {
      run(`decline-${action.row.id}`, "Could not remove this entry.", async () => {
        const result = await call(`/api/admin/tl-declines/${action.row.id}`, { method: "DELETE" })
        if (result) setDeclines((all) => all.filter((d) => d.id !== action.row.id))
      })
    } else if (action.kind === "verify") {
      reviewRemittance(action.row, "verified", "")
    } else if (action.kind === "regenerateGuest") {
      run("guest-invite", "Could not create a new link.", async () => {
        const result = await call("/api/admin/guest-invite", { method: "POST" })
        if (result) setGuestInviteToken(result.token)
      })
    } else {
      run("invite", "Could not create a new link.", async () => {
        const result = await call("/api/admin/tl-invite", { method: "POST" })
        if (result) setInviteToken(result.token)
      })
    }
  }

  /** Admin: mark a remittance received, or reject it with a note. */
  const reviewRemittance = (row: Remittance, status: "verified" | "rejected", note: string) =>
    run(`remittance-${row.id}`, "Could not update the remittance.", async () => {
      const result = await call(`/api/admin/remittances/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      })
      if (!result) return
      setRemittances((all) => all.map((r) => (r.id === row.id ? result.remittance : r)))
      setRows((all) =>
        all.map((r) =>
          r.remittance_id !== row.id
            ? r
            : status === "verified"
              ? { ...r, payment_status: "verified" }
              : { ...r, payment_status: "paid_to_tl", remittance_id: null },
        ),
      )
    })

  /** Team leader: one remittance for every ticked agent. Throws so the dialog can show the reason. */
  const sendRemittance = async (form: FormData) => {
    form.set("registration_ids", JSON.stringify(selectedRows.map((r) => r.id)))
    const result = await call("/api/tl/remittances", { method: "POST", body: form })
    if (!result) return
    const ids = new Set(selectedRows.map((r) => r.id))
    setRemittances((all) => [result.remittance, ...all])
    setRows((all) => all.map((r) => (ids.has(r.id) ? { ...r, payment_status: "remitted", remittance_id: result.remittance.id } : r)))
    setSelected(new Set())
    setRemitOpen(false)
    changeTab("remittances")
  }

  /** Team leader: add, change or delete a payment account. Throws so the panel can show the reason. */
  const changePaymentAccounts = async (url: string, init: RequestInit) => {
    const result = await call(url, init)
    if (result) setPaymentDetails(result.accounts)
  }

  /** Admin: put a guest on a team, so its leader handles them, or take them back (null). */
  const assignGuest = (row: Registration, teamLeaderId: number | null) =>
    run(`registration-${row.id}`, "Could not change the team.", async () => {
      const result = await call(`/api/admin/registrations/${row.id}/team`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_leader_id: teamLeaderId }),
      })
      if (result) setRows((all) => all.map((r) => (r.id === row.id ? { ...r, ...result.registration } : r)))
    })

  /** Team leader: save the Facebook link agents use to contact them. Throws so the form can show the reason. */
  const saveFacebookUrl = async (value: string) => {
    const result = await call("/api/tl/facebook", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facebook_url: value }),
    })
    if (result) setFacebookUrl(result.facebook_url)
  }

  /** Team leader: save the contact number agents are shown. */
  const saveContactNumber = async (event: React.FormEvent) => {
    event.preventDefault()
    if (contactBusy) return
    setContactBusy(true)
    setContactError(null)
    setContactSaved(false)
    try {
      const result = await call("/api/tl/facebook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_number: contactDraft }),
      })
      if (result) {
        setContactNumber(result.contact_number)
        setContactDraft(result.contact_number)
        setContactSaved(true)
      }
    } catch (saveError) {
      setContactError(saveError instanceof Error ? saveError.message : "We could not save the contact number.")
    } finally {
      setContactBusy(false)
    }
  }

  /** Admin: add, change or delete one of the organizer's accounts. Throws so the panel can show the reason. */
  const changeAdminAccounts = async (url: string, init: RequestInit) => {
    const result = await call(url, init)
    if (result) setAdminAccounts(result.accounts)
  }

  const saveFee = (value: number) =>
    run("fee", "Could not save the fee.", async () => {
      const result = await call("/api/admin/fee", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee: value }),
      })
      if (result) setFee(result.fee)
    })

  const saveSlots = (value: number) =>
    run("slots", "Could not save the number of slots.", async () => {
      const result = await call("/api/admin/slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: value }),
      })
      if (result) setSlotLimit(result.slots)
    })

  const toggleSelected = (id: number) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
    router.replace(`/${role}/login`)
    router.refresh()
  }

  // ---- Table for the current tab -------------------------------------------------
  const registrationColumns: Column[] = [
    {
      key: "name",
      label: "Name",
      cell: personCell,
      render: (r) => (
        <PersonCell
          name={r.name}
          email={r.email}
          badge={isLeaderRow(r) ? <Badge label={isAdmin ? "Team leader" : "You"} className="border-amber-300 bg-amber-50 text-amber-900" /> : null}
        />
      ),
    },
    { key: "email", label: "Email", hidden: true },
    {
      key: "contact_number",
      label: "Contact Number",
      render: (r) => (
        <div>
          <p className="tabular-nums">{r.contact_number ? String(r.contact_number) : dash}</p>
          {r.whatsapp_number ? <p className={`${subText} tabular-nums`}>WhatsApp {String(r.whatsapp_number)}</p> : null}
        </div>
      ),
    },
    { key: "whatsapp_number", label: "WhatsApp", hidden: true },
    {
      key: "birth_date",
      label: "Birth Date",
      render: (r: Row) => (
        <div>
          <p>{formatDay(r.birth_date)}</p>
          {r.birth_date_2 ? <p className="mt-0.5">{formatDay(r.birth_date_2)}</p> : null}
        </div>
      ),
    },
    { key: "polo_shirt_size", label: "Polo Size", render: (r: Row) => poloSizesLabel(r as { polo_shirt_size?: unknown; polo_shirt_size_2?: unknown }) || "—" },
    {
      key: "polo_quantity",
      label: "Polo Qty",
      cell: "whitespace-nowrap text-center tabular-nums",
      render: (r: Row) => poloQuantity(r as { polo_shirt_size?: unknown; polo_shirt_size_2?: unknown }) || "—",
    },
    {
      key: "attendee_count",
      label: "Joining",
      cell: `${wrapCell} min-w-[9rem] max-w-[14rem]`,
      render: (r: Row) => {
        const both = Number(r.attendee_count) === 2
        const names = both ? splitCouple(String(r.attendees ?? "")) : null
        return (
          <div>
            <Badge label={both ? "2 people" : "1 person"} className={both ? "border-violet-200 bg-violet-50 text-violet-800" : "border-[#e3d3a8] bg-[#fdf8ea] text-[#6b4a12]"} />
            {names ? (
              names.map((name) => (
                <p key={name} className={subText}>
                  {name}
                </p>
              ))
            ) : r.attendees ? (
              <p className={subText}>{String(r.attendees)} only</p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: "team",
      label: "Team",
      cell: `${wrapCell} min-w-[9rem] max-w-[14rem]`,
      render: (r: Row) => (
        <div>
          <p className="font-medium text-[#2a1a3d]">{r.team ? String(r.team) : dash}</p>
          {isAdmin && r.team_leader_name ? <p className={subText}>TL: {String(r.team_leader_name)}</p> : null}
        </div>
      ),
    },
    ...(isAdmin ? [{ key: "team_leader_name", label: "Team Leader", hidden: true }] : []),
    { key: "registration_date", label: "Registered", render: (r: Row) => <DateCell value={r.registration_date} /> },
    {
      key: "photo_count",
      label: "Photo",
      cell: `${wrapCell} max-w-[14rem]`,
      render: (r: Row) => {
        const count = Number(r.photo_count) || 0
        if (!count) return <span className="text-xs text-[#7a6a4a]">No photo</span>
        // Two photos means both people on a couple's record are joining, in the order of their names.
        const names = count === 2 ? splitCouple(String(r.attendees ?? "")) : null
        return (
          <div className="min-w-[7rem] space-y-1">
            {Array.from({ length: count }, (_, index) => (
              <a
                key={index}
                href={`/api/registrations/${r.id}/photo?n=${index + 1}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-semibold text-[#0078b6] hover:underline"
              >
                <ImageIcon size={15} className="shrink-0" /> {names ? names[index] : "View photo"}
              </a>
            ))}
          </div>
        )
      },
    },
    {
      key: "agent_receipt_at",
      label: "Receipt",
      cell: `${wrapCell} min-w-[13rem] max-w-[17rem]`,
      render: (r: Row) =>
        r.agent_receipt_at ? (
          <div className="min-w-[10rem]">
            <a
              href={`/api/registrations/${r.id}/receipt`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-[#0078b6] hover:underline"
            >
              <Receipt size={15} /> View receipt
            </a>
            <p className="whitespace-nowrap text-xs text-[#7a6a4a]">Sent {formatDate(r.agent_receipt_at)}</p>
            {r.agent_receipt_note ? (
              <p className="mt-1 max-w-xs whitespace-pre-wrap break-words text-xs text-[#4a3413]">“{String(r.agent_receipt_note)}”</p>
            ) : null}
          </div>
        ) : (
          dash
        ),
    },
    ...(tab === "pending"
      ? [
          { key: "amount_due", label: "To Pay", render: (r: Row) => <span className="font-semibold tabular-nums text-[#2a1458]">{formatMoney(r.amount_due)}</span> },
          {
            // The 3 days an agent has to pay. A team leader's own registration is not on the clock.
            key: "time_left",
            label: "Time Left To Pay",
            render: (r: Row) =>
              isLeaderRow(r) ? (
                dash
              ) : isOnPaymentClock(r) ? (
                <PaymentCountdown registrationDate={String(r.registration_date)} />
              ) : (
                <Badge label="Receipt sent · timer stopped" className="border-green-200 bg-green-50 text-green-800" />
              ),
          },
        ]
      : []),
    ...(tab === "confirmed"
      ? [
          { key: "amount", label: "Amount", render: (r: Row) => <span className="font-semibold tabular-nums text-[#2a1458]">{formatMoney(r.amount)}</span> },
          { key: "payment_status", label: "Payment", render: (r: Row) => <Badge {...paymentBadge[r.payment_status as PaymentStatus]} /> },
        ]
      : []),
  ]
  const remittanceColumns: Column[] = [
    { key: "submitted_at", label: "Sent", render: (r) => <DateCell value={r.submitted_at} /> },
    ...(isAdmin
      ? [
          {
            key: "team_leader_name",
            label: "Team Leader",
            cell: `${wrapCell} min-w-[13rem] max-w-[18rem]`,
            render: (r: Row) => <span className="font-semibold text-[#2a1458]">{String(r.team_leader_name ?? "—")}</span>,
          },
        ]
      : []),
    {
      key: "agent_count",
      label: "Agents",
      render: (r) => {
        const agents = agentsByRemittance.get(r.id) ?? []
        if (agents.length === 0) return String(r.agent_count)
        return (
          <button
            type="button"
            onClick={() => setExpanded((current) => (current === r.id ? null : r.id))}
            aria-expanded={expanded === r.id}
            className="font-semibold text-[#0078b6] underline-offset-2 hover:underline"
          >
            {String(r.agent_count)} {expanded === r.id ? "(hide)" : "(show)"}
          </button>
        )
      },
    },
    { key: "amount", label: "Amount", render: (r) => <span className="font-semibold tabular-nums text-[#2a1458]">{formatMoney(r.amount)}</span> },
    { key: "method", label: "Method" },
    { key: "reference_no", label: "Reference No.", cell: `${wrapCell} max-w-[14rem] break-all tabular-nums` },
    {
      key: "status",
      label: "Status",
      cell: `${wrapCell} min-w-[10rem]`,
      render: (r) => (
        <div>
          <Badge {...remittanceBadge[r.status as Remittance["status"]]} />
          {r.admin_note ? <p className="mt-1.5 max-w-[16rem] text-xs text-[#5c4a2a]">Note: {String(r.admin_note)}</p> : null}
        </div>
      ),
    },
    {
      key: "has_receipt",
      label: "Receipt",
      render: (r) =>
        r.has_receipt ? (
          <a
            href={`/api/remittances/${r.id}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-[#0078b6] hover:underline"
          >
            <Receipt size={15} /> View
          </a>
        ) : (
          dash
        ),
    },
  ]
  const leaderColumns: Column[] = [
    { key: "name", label: "Name", cell: personCell, render: (l) => <PersonCell name={l.name} email={l.email} /> },
    { key: "email", label: "Email", hidden: true },
    { key: "contact_number", label: "Contact Number", render: (l) => <span className="tabular-nums">{l.contact_number ? String(l.contact_number) : "—"}</span> },
    { key: "team", label: "Team", cell: `${wrapCell} min-w-[9rem] max-w-[14rem]`, render: (l) => <span className="font-medium text-[#2a1a3d]">{String(l.team)}</span> },
    { key: "pending_agents", label: "Pending Agents", cell: "text-right tabular-nums" },
    { key: "confirmed_agents", label: "Confirmed Agents", cell: "text-right tabular-nums" },
    { key: "created_at", label: "Registered", render: (l) => <DateCell value={l.created_at} /> },
  ]

  const declineColumns: Column[] = [
    { key: "name", label: "Name", cell: personCell, render: (d) => <PersonCell name={d.name} email={d.email} /> },
    { key: "email", label: "Email", hidden: true },
    { key: "team", label: "Team", cell: `${wrapCell} min-w-[9rem] max-w-[14rem]`, render: (d) => <span className="font-medium text-[#2a1a3d]">{String(d.team)}</span> },
    {
      key: "reason",
      label: "Reason for not joining",
      cell: `${wrapCell} min-w-[18rem] max-w-[28rem]`,
      render: (d) => <p className="whitespace-pre-wrap leading-relaxed">{String(d.reason)}</p>,
    },
    { key: "declined_at", label: "Declined", render: (d) => <DateCell value={d.declined_at} /> },
  ]

  const isLeaderTab = tab === "leaders"
  const isDeclinedTab = tab === "declined"
  const isRemittanceTab = tab === "remittances"
  const columns = isLeaderTab ? leaderColumns : isDeclinedTab ? declineColumns : isRemittanceTab ? remittanceColumns : registrationColumns
  // The table leaves out the columns that are folded into another cell; the spreadsheet export keeps them all.
  const shownColumns = columns.filter((column) => !column.hidden)
  const selectable = !isAdmin && tab === "confirmed"
  const source: Row[] = useMemo(() => {
    if (tab === "leaders") {
      return leaders.map((l) => ({
        ...l,
        pending_agents: agentCounts.get(l.id)?.pending ?? 0,
        confirmed_agents: agentCounts.get(l.id)?.confirmed ?? 0,
      }))
    }
    if (tab === "declined") return declines as unknown as Row[]
    if (tab === "remittances") return remittances as unknown as Row[]
    if (tab === "confirmed") return confirmed.map((r) => ({ ...r, polo_quantity: poloQuantity(r) })) as unknown as Row[]
    // What each waiting registration owes: the fee for every person joining.
    return pending.map((r) => ({ ...r, polo_quantity: poloQuantity(r), amount_due: fee === null ? null : fee * r.attendee_count }))
  }, [tab, leaders, declines, agentCounts, confirmed, pending, remittances, fee])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const searchable = ["name", "email", "team", "reason", "contact_number", "whatsapp_number", "team_leader_name", "reference_no", "method"]
    const filtered = q ? source.filter((r) => searchable.some((k) => String(r[k] ?? "").toLowerCase().includes(q))) : source
    const factor = sort.direction === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => compareValues(a[sort.key], b[sort.key]) * factor || b.id - a.id)
  }, [source, query, sort])

  const changeTab = (next: Tab) => {
    setTab(next)
    setQuery("")
    setExpanded(null)
    const key = { overview: "", qr: "", pending: "registration_date", confirmed: "registration_date", remittances: "submitted_at", leaders: "created_at", declined: "declined_at", guests: "", adminteam: "", settings: "", assign: "", payment: "", payadmin: "" }[next]
    setSort({ key, direction: "desc" })
  }

  const toggleSort = (key: string) =>
    setSort((current) =>
      current.key === key ? { key, direction: current.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" },
    )

  const exportCsv = () => {
    const names: Record<Tab, string> = {
      overview: "",
      qr: "",
      pending: "pending-agents",
      confirmed: "confirmed-agents",
      remittances: "remittances",
      leaders: "team-leaders",
      declined: "team-leaders-not-joining",
      guests: "",
      adminteam: "",
      settings: "",
      assign: "",
      payment: "",
      payadmin: "",
    }
    const exportValue = (r: Row, key: string) => {
      if (key === "birth_date") return [r.birth_date, r.birth_date_2].filter(Boolean).join(" / ")
      if (key === "polo_quantity") return poloQuantity(r as { polo_shirt_size?: unknown; polo_shirt_size_2?: unknown })
      if (key === "polo_shirt_size") return poloSizesLabel(r as { polo_shirt_size?: unknown; polo_shirt_size_2?: unknown })
      if (key === "time_left") {
        if (isLeaderRow(r)) return ""
        return isOnPaymentClock(r) ? `Pay by ${formatDate(new Date(paymentDeadlineMs(String(r.registration_date))).toISOString())}` : "Receipt sent"
      }
      if (key === "agent_receipt_at") {
        return r[key] ? `Sent ${formatDate(r[key])}${r.agent_receipt_note ? ` - ${r.agent_receipt_note}` : ""}` : "No"
      }
      if (key === "amount_due" || key === "amount") return r[key] ?? ""
      if (key === "attendee_count") return Number(r[key]) === 2 ? `Both (2 people): ${r.attendees ?? ""}` : r.attendees ? `${r.attendees} only` : "1 person"
      if (/_at$|_date$/.test(key)) return r[key] ? formatDate(r[key]) : ""
      if (key === "payment_status") return paymentBadge[r[key] as PaymentStatus].label
      if (key === "status") return remittanceBadge[r[key] as Remittance["status"]].label
      if (key === "has_receipt") return r[key] ? "Yes" : "No"
      if (key === "photo_count") return Number(r[key]) ? "Yes" : "No"
      return r[key]
    }
    downloadCsv(
      `ares-2027-${names[tab]}.csv`,
      columns.map((c) => c.label),
      visible.map((r) => columns.map((c) => exportValue(r, c.key))),
    )
  }

  // ---- Header numbers and tabs -----------------------------------------------------
  const waiting = remittances.filter((r) => r.status === "submitted")
  // Every person registered takes a slot; a couple who are both joining takes two.
  const slotsTaken = rows.reduce((total, r) => total + (Number(r.attendee_count) || 1), 0)
  // Money that reached the admin: remittances marked received, plus agents who paid the admin directly.
  const verifiedTotal = sum(remittances.filter((r) => r.status === "verified")) + sum([...adminManaged, ...adminTeamAgents, ...guests].filter((r) => r.team_leader_id === null && r.payment_status === "verified"))
  // Team leaders and agents are counted apart: a team leader's own registration is not an agent.
  const leaderRowCount = rows.filter((r) => isLeaderRow(r as unknown as Row)).length
  const agentRowCount = rows.filter((r) => !isLeaderRow(r as unknown as Row) && !r.guest_type).length
  const teamCount = new Set(
    [...leaders.map((l) => l.team), ...rows.filter((r) => !(r.guest_type && r.team_leader_id === null)).map((r) => r.team)].map((team) =>
      team.trim().toLowerCase().replace(/\s+/g, " "),
    ),
  ).size
  const statCards: { label: string; icon: typeof Users; count?: number; money?: number; hint?: string }[] = isAdmin
    ? [
        {
          label: "Total registrants",
          icon: Ticket,
          count: slotsTaken,
          hint: `${rows.length.toLocaleString()} registrations · ${slotsTaken.toLocaleString()} of ${slotLimit.toLocaleString()} slots taken`,
        },
        {
          label: "Team leaders",
          icon: UserCog,
          count: leaders.length,
          hint: `${leaderRowCount.toLocaleString()} attending · ${(leaders.length - leaderRowCount).toLocaleString()} not attending`,
        },
        {
          label: "Agents",
          icon: Users,
          count: agentRowCount,
          hint: `Team leaders not counted · ${rows.filter((r) => !r.confirmed_by_tl).length.toLocaleString()} registrations not paid yet`,
        },
        { label: "Teams", icon: Building2, count: teamCount },
        { label: "Remittances to check", icon: Clock, money: sum(waiting), hint: `${waiting.length.toLocaleString()} waiting` },
        { label: "Received", icon: BadgeCheck, money: verifiedTotal },
      ]
    : [
        { label: "Agents registered", icon: Users, count: rows.length },
        { label: "Not paid yet", icon: Clock, count: pending.length },
        { label: "To send to admin", icon: Banknote, money: sum(toSend), hint: `${toSend.length.toLocaleString()} agents` },
        { label: "Received by admin", icon: BadgeCheck, money: verifiedTotal },
      ]
  const tabs: { id: Tab; label: string; count?: number; icon?: typeof Users }[] = [
    ...(isAdmin ? [{ id: "overview" as Tab, label: "Overview", icon: LayoutDashboard }] : []),
    { id: "pending", label: "Pending", count: pending.length, icon: Clock },
    { id: "confirmed", label: isAdmin ? "Confirmed by TL" : "Confirmed", count: confirmed.length, icon: BadgeCheck },
    { id: "remittances", label: isAdmin ? "Received Payment" : "Remittances", count: isAdmin ? waiting.length : remittances.length, icon: Banknote },
    ...(isAdmin
      ? [
          { id: "leaders" as Tab, label: "Team leaders", count: leaders.length, icon: UserCog },
          { id: "assign" as Tab, label: "Assign TL", icon: UserPlus },
          { id: "adminteam" as Tab, label: "Team accounts", count: adminTeamAgents.length, icon: KeyRound },
          { id: "guests" as Tab, label: "Guests", count: guests.length, icon: Sparkles },
          { id: "qr" as Tab, label: "Agent QR code", icon: QrCode },
          { id: "settings" as Tab, label: "Settings", icon: Settings },
        ]
      : [
          { id: "payadmin" as Tab, label: "Pay admin", icon: Send, count: toSend.length },
          { id: "payment" as Tab, label: "Payment details", icon: QrCode },
        ]),
  ]

  // "Not joining" is part of the Team leaders page: the menu shows one item for both.
  const navTab: Tab = tab === "declined" ? "leaders" : tab
  const activeTab = tabs.find((item) => item.id === navTab)
  const ActiveIcon = activeTab?.icon ?? LayoutDashboard

  /** The buttons for one row: confirm or undo a payment, review a remittance, delete. Used by the table and the phone cards. */
  const renderActions = (row: Row, busy: boolean) => {
    const status = row.payment_status as PaymentStatus | undefined
    return (
                                <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                                  {isRemittanceTab ? (
                                    isAdmin && row.status === "submitted" ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setPendingAction({ kind: "verify", row: row as unknown as Remittance })}
                                          disabled={busy}
                                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#8a6417] bg-gradient-to-r from-[#c9972f] to-[#f3d27a] px-3 text-xs font-bold text-[#2a1408] transition-all hover:brightness-105 disabled:cursor-not-allowed"
                                        >
                                          {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Received
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setRejecting(row as unknown as Remittance)}
                                          disabled={busy}
                                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e3d3a8] bg-white px-3 text-xs font-bold text-[#9a1c15] transition-colors hover:bg-[#b3261e]/5 disabled:cursor-not-allowed"
                                        >
                                          <X size={14} /> Reject
                                        </button>
                                      </>
                                    ) : (
                                      dash
                                    )
                                  ) : isLeaderTab || isDeclinedTab ? null : status === "unpaid" || status === "paid_to_tl" ? (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmed(row as unknown as Registration, status === "unpaid")}
                                      disabled={busy || (status === "unpaid" && fee === null)}
                                      className={`inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                        status === "unpaid" ? "w-[150px]" : "w-[84px]"
                                      } ${
                                        status === "unpaid"
                                          ? "border border-[#8a6417] bg-gradient-to-r from-[#c9972f] to-[#f3d27a] text-[#2a1408] hover:brightness-105"
                                          : "border border-[#e3d3a8] bg-white text-[#6b4a12] hover:bg-[#fdf3d7]"
                                      }`}
                                    >
                                      {busy ? (
                                        <Loader2 size={14} className="animate-spin" />
                                      ) : status === "unpaid" ? (
                                        <>
                                          <CheckCircle2 size={14} /> {!isAdmin && isLeaderRow(row) ? "I have paid" : "Payment received"}
                                        </>
                                      ) : (
                                        <>
                                          <Undo2 size={14} /> Undo
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    dash
                                  )}
                                  {selectable && status === "paid_to_tl" ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Send just this agent, without ticking boxes first.
                                        setSelected(new Set([row.id]))
                                        setRemitOpen(true)
                                      }}
                                      disabled={busy}
                                      aria-label={`Send ${String(row.name)}'s payment to admin`}
                                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#8a6417] bg-gradient-to-r from-[#c9972f] to-[#f3d27a] px-3 text-xs font-bold text-[#2a1408] transition-all hover:brightness-105 disabled:cursor-not-allowed"
                                    >
                                      <Send size={14} /> Send
                                    </button>
                                  ) : null}
                                  {isAdmin && !isRemittanceTab && (isLeaderTab || isDeclinedTab || status === "unpaid" || status === "paid_to_tl") ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingAction(
                                          isDeclinedTab
                                            ? { kind: "decline", row: row as unknown as TlDecline }
                                            : isLeaderTab
                                            ? { kind: "leader", row: row as unknown as TeamLeader }
                                            : { kind: "registration", row: row as unknown as Registration },
                                        )
                                      }
                                      disabled={busy}
                                      aria-label={`Delete ${String(row.name)}`}
                                      className={iconButton}
                                    >
                                      {(isLeaderTab || isDeclinedTab) && busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                    </button>
                                  ) : null}
                                </div>
    )
  }
  /** Opens the page of the person on a row. Clicks on a button, link or checkbox inside the row do their own thing. */
  const openRow = (event: React.MouseEvent, row: Row) => {
    if ((event.target as HTMLElement).closest("a,button,input,select,label,textarea")) return
    if (isLeaderTab) {
      const leader = leaders.find((l) => l.id === row.id)
      if (leader) setDetail({ kind: "leader", leader })
    } else if (!isDeclinedTab && !isRemittanceTab) {
      const registration = rows.find((r) => r.id === row.id)
      if (registration) setDetail({ kind: "registration", row: registration })
    }
  }
  const rowsOpen = !isDeclinedTab && !isRemittanceTab
  const rowKind = isLeaderTab ? "leader" : isDeclinedTab ? "decline" : isRemittanceTab ? "remittance" : "registration"
  // On a phone each row is a card: these values need the card's full width.
  const wideOnCard = new Set(["agent_receipt_at", "reason", "status", "time_left", "team", "team_leader_name", "reference_no"])

  const emptyText: Record<Exclude<Tab, "overview" | "qr" | "settings" | "payment" | "payadmin" | "assign" | "guests" | "adminteam">, [string, string]> = {
    pending: isAdmin
      ? ["No agents waiting to pay", "Agents appear here after they register, until their team leader confirms their payment."]
      : ["No one waiting for you", "Your own registration and your agents' appear here until the payment is confirmed. Check each receipt and confirm once they pay you."],
    confirmed: ["No confirmed agents yet", "Agents move here once their team leader confirms their payment."],
    remittances: isAdmin
      ? ["No remittances yet", "When a team leader sends collected payments, the remittance appears here for you to check."]
      : ["No remittances yet", "Open Pay admin to see where to send the money and record your payment."],
    leaders: ["No team leaders yet", "Share the TL registration link so team leaders can register."],
    declined: ["No team leader has declined", "A team leader who can't attend still registers from the TL registration link and gives their reason, which is listed here. They confirm their own agents from their portal."],
  }

  const dialog =
    pendingAction?.kind === "registration"
      ? {
          title: "Delete this registration?",
          body: `${pendingAction.row.name} (${pendingAction.row.email}) will be removed and can register again. This cannot be undone.`,
          action: "Delete",
        }
      : pendingAction?.kind === "leader"
        ? {
            title: "Delete this team leader?",
            body: `${pendingAction.row.name} (${pendingAction.row.team}) will lose their login. Their agents can no longer register until a team leader for that team registers again. This cannot be undone.`,
            action: "Delete",
          }
        : pendingAction?.kind === "decline"
          ? {
              title: "Remove this entry?",
              body: `${pendingAction.row.name} (${pendingAction.row.team}) will be removed from the "Not joining" list, along with their reason. If they have a team leader account, it is not affected. If they do not, agents of theirs who have not registered yet will again be told their team leader has not registered; those already registered stay with you.`,
              action: "Remove",
            }
          : pendingAction?.kind === "regenerateGuest"
          ? {
              title: "Create a new guest link?",
              body: "The current guest link and QR code will stop working straight away. Guests who already registered are not affected.",
              action: "Create new link",
            }
          : pendingAction?.kind === "regenerate"
          ? {
              title: "Create a new registration link?",
              body: "The current link and QR code will stop working straight away. Team leaders who already registered are not affected.",
              action: "Create new link",
            }
          : pendingAction?.kind === "verify"
            ? {
                title: "Mark this remittance as received?",
                body: `${formatMoney(pendingAction.row.amount)} from ${pendingAction.row.team_leader_name} for ${pendingAction.row.agent_count} agent${
                  pendingAction.row.agent_count === 1 ? "" : "s"
                } (${pendingAction.row.method}, ref ${pendingAction.row.reference_no}). Those agents become fully paid. This cannot be undone.`,
                action: "Yes, received",
              }
            : null

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen bg-[#fbf5e6] font-sans text-[#2a1a3d]">
        <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: brownLattice }} />

        {/* ---------------------------------------------------------------- */}
        {/* Header band                                                        */}
        {/* ---------------------------------------------------------------- */}
        <header className={`relative overflow-hidden border-b-2 border-[#d4a437] bg-gradient-to-r from-[#2a1458] via-[#1a0d3d] to-[#3a0d2a] pb-24 text-white ${isAdmin ? "hidden" : ""}`}>
          <div aria-hidden className="absolute inset-0 opacity-[0.13]" style={{ backgroundImage: goldLattice }} />
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#d4a437]/20 blur-[110px]" />

          <div className="relative mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Link href="/" aria-label="ARES 2027 home" className="flex items-center">
              <img src={LOGO_URL} alt="Asian Real Estate Summit" className="h-10 w-auto sm:h-11" />
              <span className="ml-3 border-l border-white/40 pl-3 text-xl font-black leading-none tracking-tight sm:text-2xl">2027</span>
              <span className="ml-3 whitespace-nowrap rounded-full border border-[#d4a437]/60 bg-[#d4a437]/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f3d27a]">
                {isAdmin ? "Admin" : "Team leader"}
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-white/70 md:inline">{userLabel}</span>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d4a437]/50 bg-white/10 px-3 text-sm font-semibold text-[#fbe7a1] transition-colors hover:bg-white/20"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-6 flex max-w-[1680px] items-end gap-5 px-4 sm:px-6"
          >
            <Lotus bloom className="hidden h-14 w-24 shrink-0 text-[#f0c24b] sm:block" />
            <div>
              <p lang="th" className="text-base font-medium text-[#f3d27a]">
                การลงทะเบียน
              </p>
              <h1 className={`pb-1 text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl ${goldText}`}>
                {isAdmin ? "Registrations" : "My Agents"}
              </h1>
            </div>
          </motion.div>
        </header>

        <main
          className={
            isAdmin
              ? "relative min-h-screen px-4 pb-12 sm:px-6 lg:pl-[19.5rem] lg:pr-8"
              : "relative mx-auto -mt-16 max-w-[1680px] px-4 pb-12 sm:px-6"
          }
        >
          {/* Admin: a top bar with the current section, who is signed in, and sign out. */}
          {isAdmin ? (
            <div className="sticky top-0 z-30 -mx-4 mb-6 flex h-[4.5rem] items-center justify-between gap-3 border-b-2 border-[#d4a437] bg-[#fffdf7]/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-ml-6 lg:-mr-8 lg:px-8">
              <div className="flex min-w-0 items-center gap-4">
                <span className="ml-1 grid h-9 w-9 shrink-0 rotate-45 place-items-center border border-[#d4a437] bg-[#2a1458] text-[#f3d27a] shadow-[0_8px_18px_-8px_rgba(42,20,88,0.8)]">
                  <ActiveIcon size={16} className="-rotate-45" />
                </span>
                <div className="min-w-0">
                  <p lang="th" className="text-xs font-medium leading-none text-[#b8862b]">
                    การลงทะเบียน <span className="font-semibold uppercase tracking-[0.2em] lg:hidden">· ARES 2027 Admin</span>
                  </p>
                  <h1 className="mt-1 truncate text-xl font-black uppercase leading-none tracking-tight text-[#2a1458] sm:text-2xl">
                    {activeTab?.label ?? "Dashboard"}
                  </h1>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden max-w-[16rem] truncate text-sm text-[#5c4a2a] md:inline">{userLabel}</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d4a437]/70 bg-white px-3 text-sm font-semibold text-[#6b4a12] transition-colors hover:border-[#c9972f] hover:bg-[#fdf3d7]"
                >
                  <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </div>
          ) : null}
          {/* Summary cards overlap the header band */}
          <dl className={`grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 ${isAdmin ? "hidden" : ""}`}>
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-[#d4a437]/50 bg-white p-4 shadow-[0_18px_40px_-24px_rgba(58,13,42,0.5)] sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6a4a]">{stat.label}</dt>
                  <span className="grid h-9 w-9 shrink-0 rotate-45 place-items-center border border-[#d4a437] bg-[#fdf3d7] text-[#b8862b]">
                    <stat.icon size={16} className="-rotate-45" />
                  </span>
                </div>
                <dd className="mt-2 text-2xl font-black tabular-nums text-[#2a1458] sm:text-3xl">
                  {stat.money !== undefined ? formatMoney(stat.money) : <Counter to={stat.count ?? 0} duration={1.2} />}
                </dd>
                {stat.hint ? <p className="mt-1 text-xs text-[#7a6a4a]">{stat.hint}</p> : null}
              </motion.div>
            ))}
          </dl>

          {fee === null ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e3d3a8] bg-[#fdf3d7] px-4 py-3 text-sm text-[#4a3413]">
              <p>
                <span className="font-semibold">The registration fee is not set yet.</span>{" "}
                {isAdmin
                  ? "Team leaders cannot confirm payments until you set it."
                  : "You cannot confirm payments until the admin sets it."}
              </p>
              {isAdmin ? (
                <button type="button" onClick={() => changeTab("settings")} className={goldButton}>
                  <Settings size={16} /> Set the fee
                </button>
              ) : null}
            </div>
          ) : !isAdmin ? (
            <p className="mt-6 text-sm text-[#5c4a2a]">
              Registration fee per person: <span className="font-bold text-[#2a1458]">{formatMoney(fee)}</span>. A couple who are
              both joining pays double.
            </p>
          ) : null}

          {isAdmin && tab !== "settings" && adminAccounts.length === 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e3d3a8] bg-[#fdf3d7] px-4 py-3 text-sm text-[#4a3413]">
              <p>
                <span className="font-semibold">Team leaders cannot see where to send the money yet.</span> Add your bank or
                e-wallet accounts and they will be shown when a team leader sends a payment.
              </p>
              <button type="button" onClick={() => changeTab("settings")} className={goldButton}>
                <QrCode size={16} /> Add payment details
              </button>
            </div>
          ) : null}

          {/* A team leader must say where their agents pay before using the portal: this cannot be closed. */}
          {!isAdmin && !hasPaymentDetails(paymentDetails) ? (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-first-title"
              className="fixed inset-0 z-[100] overflow-y-auto bg-[#120a2e]/80 px-4 py-8 backdrop-blur-sm"
            >
              <div className="mx-auto max-w-3xl rounded-2xl border border-[#d4a437]/60 bg-[#fffdf7] p-6 shadow-2xl sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">First step</p>
                <h2 id="payment-first-title" className="mt-2 text-2xl font-black text-[#2a1458]">
                  Add your payment details
                </h2>
                <p className="mt-2 text-[#5c4a2a]">
                  Before you continue, add the bank or e-wallet account where your agents will send their registration fee.
                  It is shown to them after they register. You can add more accounts or change this later under
                  &quot;Payment details&quot;.
                </p>
                <div className="mt-6">
                  <PaymentAccountForm
                    account={null}
                    onSubmit={(form) => changePaymentAccounts("/api/tl/payment-details", { method: "POST", body: form })}
                  />
                </div>
                <p className="mt-6 text-center text-sm text-[#7a6a4a]">
                  Not ready yet?{" "}
                  <button type="button" onClick={signOut} className="font-semibold text-[#6b4a12] underline-offset-2 hover:underline">
                    Sign out
                  </button>{" "}
                  and come back later.
                </p>
              </div>
            </div>
          ) : null}

          {/* Next, how agents reach them: asked right after the payment details, and cannot be closed either. */}
          {!isAdmin && hasPaymentDetails(paymentDetails) && !facebookUrl ? (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="facebook-first-title"
              className="fixed inset-0 z-[100] overflow-y-auto bg-[#120a2e]/80 px-4 py-8 backdrop-blur-sm"
            >
              <div className="mx-auto max-w-xl rounded-2xl border border-[#d4a437]/60 bg-[#fffdf7] p-6 shadow-2xl sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">One more step</p>
                <h2 id="facebook-first-title" className="mt-2 text-2xl font-black text-[#2a1458]">
                  Add your Facebook link
                </h2>
                <p className="mt-2 text-[#5c4a2a]">
                  Your agents see this link and your contact number next to your payment details, so they can message you
                  about their payment. You can change it later under &quot;Payment details&quot;.
                </p>
                <div className="mt-6">
                  <FacebookLinkForm current={null} onSave={saveFacebookUrl} submitLabel="Save and continue" />
                </div>
                <p className="mt-6 text-center text-sm text-[#7a6a4a]">
                  Not ready yet?{" "}
                  <button type="button" onClick={signOut} className="font-semibold text-[#6b4a12] underline-offset-2 hover:underline">
                    Sign out
                  </button>{" "}
                  and come back later.
                </p>
              </div>
            </div>
          ) : null}

          {/* The fee changed after some people registered: those who have not paid owe the new fee. */}
          {fee !== null && owingNewFee > 0 ? (
            <div role="status" className="mt-4 flex items-start gap-3 rounded-xl border border-[#d4a437]/60 bg-[#fdf3d7] px-4 py-3 text-sm text-[#4a3413]">
              <Info size={18} className="mt-0.5 shrink-0 text-[#b8862b]" />
              <p className="leading-relaxed">
                <span className="font-bold text-[#2a1458]">The registration fee is now {formatMoney(fee)} per person.</span>{" "}
                {owingNewFee === 1 ? "1 registration" : `${owingNewFee.toLocaleString()} registrations`} made before this change{" "}
                {owingNewFee === 1 ? "has" : "have"} not paid yet and now {owingNewFee === 1 ? "owes" : "owe"} the new fee
                {isAdmin ? "." : ". Please collect the new amount from them, and pay it for your own registration if you have not yet."}
              </p>
            </div>
          ) : null}

          {needsOwnTicket && ownName ? <OwnTicketCard name={ownName} fee={fee} onSaved={refresh} declinedReason={ownDeclineReason} /> : null}

          {/* Tabs */}
          {/* The admin's sections are a fixed sidebar on large screens; on small ones (and for team leaders) a row of tabs. */}
          <div className={isAdmin ? "" : "mt-8"}>
          <div
            role="tablist"
            aria-label="Sections"
            aria-orientation={isAdmin ? "vertical" : "horizontal"}
            className={`flex gap-2 overflow-x-auto pb-1 ${
              isAdmin
                ? "mb-4 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:mb-0 lg:w-72 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:overflow-x-hidden lg:border-r-2 lg:border-[#d4a437] lg:bg-gradient-to-b lg:from-[#2a1458] lg:via-[#1a0d3d] lg:to-[#3a0d2a] lg:pb-6"
                : ""
            }`}
          >
            {isAdmin ? (
              <>
                <div aria-hidden className="pointer-events-none absolute inset-0 hidden opacity-[0.12] lg:block" style={{ backgroundImage: goldLattice }} />
                <Link href="/" aria-label="ARES 2027 home" className="relative hidden h-[4.5rem] shrink-0 items-center gap-3 border-b border-[#d4a437]/40 px-6 lg:flex">
                  <img src={LOGO_URL} alt="Asian Real Estate Summit" className="h-9 w-auto" />
                  <span className="border-l border-white/40 pl-3 text-lg font-black leading-none text-white">2027</span>
                </Link>
                <div className="relative hidden flex-col items-center px-6 pb-2 pt-6 text-center lg:flex">
                  <Lotus bloom className="h-10 w-16 text-[#f0c24b]" />
                  <p lang="th" className="mt-2 text-sm font-medium text-[#f3d27a]">
                    ยินดีต้อนรับ
                  </p>
                  <p className="mt-1 max-w-full truncate text-sm font-bold text-white">{userLabel}</p>
                  <p className="mt-1 rounded-full border border-[#d4a437]/60 bg-[#d4a437]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f3d27a]">
                    Administrator
                  </p>
                  <GoldRule className="mt-5 w-40" />
                </div>
              </>
            ) : null}
            {tabs.map((item) => {
              const active = navTab === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeTab(item.id)}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                    isAdmin
                      ? "lg:relative lg:h-[3.25rem] lg:w-full lg:justify-between lg:rounded-none lg:border-y-0 lg:border-l-4 lg:border-r-0 lg:px-6 lg:font-medium"
                      : ""
                  } ${
                    active
                      ? `border-[#2a1458] bg-[#2a1458] text-[#fbe7a1] ${isAdmin ? "lg:border-[#f3d27a] lg:bg-gradient-to-r lg:from-[#d4a437]/30 lg:to-transparent lg:font-bold lg:text-[#fbe7a1]" : ""}`
                      : `border-[#e3d3a8] bg-white text-[#6b4a12] hover:border-[#c9972f] hover:bg-[#fdf3d7] ${
                          isAdmin ? "lg:border-transparent lg:bg-transparent lg:text-white/85 lg:hover:border-[#d4a437]/60 lg:hover:bg-white/10 lg:hover:text-white" : ""
                        }`
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {Icon ? <Icon size={16} className={isAdmin ? "lg:hidden" : ""} /> : null}
                    <span className="truncate">{item.label}</span>
                    {item.count !== undefined ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                          active
                            ? `bg-[#f3d27a] text-[#2a1408] ${isAdmin ? "lg:bg-[#f3d27a] lg:text-[#2a1408]" : ""}`
                            : `bg-[#f1e6c8] text-[#6b4a12] ${isAdmin ? "lg:bg-white/15 lg:text-[#fbe7a1]" : ""}`
                        }`}
                      >
                        {item.count.toLocaleString()}
                      </span>
                    ) : null}
                  </span>
                  {isAdmin && Icon ? <Icon size={18} className={`hidden shrink-0 lg:block ${active ? "text-[#f3d27a]" : "text-[#d4a437]/70"}`} /> : null}
                </button>
              )
            })}
          </div>

          <div>
          {errorMessage ? (
            <p role="alert" className="mt-4 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
              {errorMessage}
            </p>
          ) : null}

          {isAdmin && (tab === "leaders" || tab === "declined") ? (
            <div role="tablist" aria-label="Team leaders" className="mt-4 inline-flex flex-wrap gap-1 rounded-2xl border border-[#d4a437]/50 bg-white p-1.5">
              {[
                { id: "leaders" as Tab, label: "Registered team leaders", count: leaders.length, icon: UserCog },
                { id: "declined" as Tab, label: "Not joining", count: declines.length + adminManaged.length, icon: UserX },
              ].map((item) => {
                const active = tab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => changeTab(item.id)}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${
                      active ? "bg-[#2a1458] text-[#fbe7a1]" : "text-[#6b4a12] hover:bg-[#fdf3d7]"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                    <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${active ? "bg-[#f3d27a] text-[#2a1408]" : "bg-[#f1e6c8] text-[#6b4a12]"}`}>
                      {item.count.toLocaleString()}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null}

          {tab === "overview" ? (
            <div className="mt-6">
              <AdminOverview registrations={rows} leaders={leaders} declines={declines} slotLimit={slotLimit} fee={fee} />
            </div>
          ) : tab === "qr" ? (
            <AgentQrPanel />
          ) : tab === "payment" ? (
            <>
              {sharedWith ? (
                <p className="mb-4 flex items-start gap-2 rounded-2xl border border-[#d4a437]/60 bg-[#fdf3d7] px-5 py-4 text-sm leading-relaxed text-[#5c4a2a]">
                  <Info size={18} className="mt-0.5 shrink-0 text-[#b8862b]" />
                  <span>
                    <strong className="text-[#2a1458]">Your team shares this dashboard.</strong> {sharedWith.join(", ")} each sign in with
                    their own account and see the same agents. The payment details, Facebook link and contact number below are the same
                    for all of you, and they are what your agents see, so agree on one of each.
                  </span>
                </p>
              ) : null}
              <PaymentDetailsPanel
                accounts={paymentDetails ?? []}
                fee={fee}
                onAdd={(form) => changePaymentAccounts("/api/tl/payment-details", { method: "POST", body: form })}
                onUpdate={(id, form) => changePaymentAccounts(`/api/tl/payment-details/${id}`, { method: "PUT", body: form })}
                onDelete={(id) => changePaymentAccounts(`/api/tl/payment-details/${id}`, { method: "DELETE" })}
              />
              <section className="mt-4 rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">For your agents</p>
                <h2 className="mt-2 text-2xl font-black text-[#2a1458]">How agents contact you</h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-[#5c4a2a]">
                  Your agents see this Facebook link and contact number below your payment details, after they register.
                </p>
                <div className="mt-5 max-w-xl">
                  <FacebookLinkForm current={facebookUrl} onSave={saveFacebookUrl} />
                </div>
                <form onSubmit={saveContactNumber} noValidate className="mt-8 max-w-xl border-t border-[#e3d3a8] pt-6">
                  <label htmlFor="tl-agent-contact" className="block text-sm font-semibold text-[#2a1458]">
                    Contact number shown to your agents <span className="text-[#b3261e]">*</span>
                  </label>
                  <input
                    id="tl-agent-contact"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={contactDraft}
                    onChange={(event) => {
                      setContactDraft(event.target.value)
                      setContactSaved(false)
                    }}
                    placeholder="0917 123 4567"
                    className="mt-2 h-12 w-full rounded-xl border border-[#e3d3a8] bg-white px-4 text-[#2a1458] placeholder:text-[#a8997a] focus:border-[#c9972f] focus:outline-none focus:ring-2 focus:ring-[#c9972f]/30"
                  />
                  <p className="mt-2 text-sm text-[#7a6a4a]">The one number your agents should call or message about their registration.</p>
                  {contactError ? (
                    <p role="alert" className="mt-3 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
                      {contactError}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={contactBusy || contactDraft.trim() === contactNumber}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#f3d27a] to-[#c9972f] px-5 text-sm font-bold text-[#2a1408] shadow-sm hover:brightness-105 disabled:opacity-60"
                    >
                      {contactBusy ? <Loader2 size={16} className="animate-spin" /> : null}
                      Save contact number
                    </button>
                    {contactSaved ? (
                      <span role="status" className="text-sm font-semibold text-[#2f6b3a]">
                        Saved
                      </span>
                    ) : null}
                  </div>
                </form>
              </section>
            </>
          ) : tab === "payadmin" ? (
            <PayAdminPanel
              accounts={adminAccounts}
              agents={toSend}
              selected={selected}
              total={sum(selectedRows)}
              waiting={waiting}
              verifiedTotal={verifiedTotal}
              onToggle={toggleSelected}
              onSelectAll={(all) => setSelected(all ? new Set(toSend.map((r) => r.id)) : new Set())}
              onSend={() => setRemitOpen(true)}
              onViewHistory={() => changeTab("remittances")}
              onViewPending={() => changeTab("pending")}
            />
          ) : tab === "adminteam" ? (
            <>
              <section className="mt-4 rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">For your secretaries</p>
                    <h2 className="mt-2 text-2xl font-black text-[#2a1458]">Accounts for {new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(ADMIN_TEAMS)}</h2>
                    <p className="mt-3 leading-relaxed text-[#5c4a2a]">
                      These teams have no team leader for ARES 2027. Create an account for the person who will look after each
                      team. They sign in to a dashboard for that team only, where they add their name, contact number and
                      Facebook link and confirm the agents&apos; payments. The agents pay into your own payment details from
                      Settings.
                    </p>
                  </div>
                  <button type="button" onClick={refresh} disabled={refreshing} className={outlineButton}>
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>
                <div className="mt-6 max-w-3xl">
                  <AdminTeamAccounts initial={initialTeamLogins} teams={ADMIN_TEAMS} call={call} signInPath="/admin/login" />
                </div>
              </section>
              {ADMIN_TEAMS.map((team) => (
                <AdminManagedAgents
                  key={team}
                  variant="team"
                  title={`${team}: registered agents`}
                  agents={adminTeamAgents.filter((r) => adminTeamOf(r.team) === team)}
                  fee={fee}
                  busyKey={busyKey}
                  onConfirm={setConfirmed}
                onOpen={(row) => setDetail({ kind: "registration", row })}
                  onDelete={(row) => setPendingAction({ kind: "registration", row })}
                />
              ))}
            </>
          ) : tab === "guests" ? (
            <>
              <InvitePanel
                audience="guest"
                token={guestInviteToken}
                busy={busyKey === "guest-invite"}
                onRegenerate={() => setPendingAction({ kind: "regenerateGuest" })}
              />
              <AdminGuestForm invite={guestInviteToken} onRegistered={refresh} />
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={refresh} disabled={refreshing} className={outlineButton}>
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
                </button>
              </div>
              <AdminManagedAgents
                variant="guests"
                inviters={rows}
                leaders={leaders}
                onAssign={assignGuest}
                agents={guests}
                fee={fee}
                busyKey={busyKey}
                onConfirm={setConfirmed}
                onOpen={(row) => setDetail({ kind: "registration", row })}
                onDelete={(row) => setPendingAction({ kind: "registration", row })}
              />
            </>
          ) : tab === "assign" ? (
            <TlAssignPanel leaders={leaders} call={call} onOpenSettings={() => changeTab("settings")} />
          ) : tab === "settings" ? (
            <>
              <FeePanel fee={fee} busy={busyKey === "fee"} onSave={saveFee} />
              <SlotsPanel limit={slotLimit} taken={slotsTaken} busy={busyKey === "slots"} onSave={saveSlots} />
              <PastAttendeesPanel call={call} />
              <PaymentDetailsPanel
                audience="leaders"
                accounts={adminAccounts}
                fee={fee}
                onAdd={(form) => changeAdminAccounts("/api/admin/payment-details", { method: "POST", body: form })}
                onUpdate={(id, form) => changeAdminAccounts(`/api/admin/payment-details/${id}`, { method: "PUT", body: form })}
                onDelete={(id) => changeAdminAccounts(`/api/admin/payment-details/${id}`, { method: "DELETE" })}
              />
              <InvitePanel audience="tl" token={inviteToken} busy={busyKey === "invite"} onRegenerate={() => setPendingAction({ kind: "regenerate" })} />
            </>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <label className="relative block w-full sm:w-96">
                  <span className="sr-only">Search this list</span>
                  <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isDeclinedTab ? "Search name, email, team, reason" : "Search name, email, team, contact number"}
                    className="h-11 w-full rounded-xl border border-[#e3d3a8] bg-white pl-11 pr-3 text-sm text-[#2a1a3d] outline-none transition-all placeholder:text-[#a89a7c] focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)]"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={refresh} disabled={refreshing} className={outlineButton}>
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
                  </button>
                  <button type="button" onClick={exportCsv} disabled={visible.length === 0} className={goldButton}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {selectable && toSend.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d4a437]/60 bg-[#2a1458] px-4 py-3 text-[#fbe7a1]">
                  <p className="text-sm">
                    {selectedRows.length === 0 ? (
                      <>
                        <span className="font-semibold text-white">{toSend.length.toLocaleString()}</span> agent
                        {toSend.length === 1 ? " has" : "s have"} paid you. Tick the ones you are sending to the admin.
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-white">{selectedRows.length.toLocaleString()}</span> selected ·{" "}
                        <span className="font-bold text-white">{formatMoney(sum(selectedRows))}</span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelected(selectedRows.length === toSend.length ? new Set() : new Set(toSend.map((r) => r.id)))}
                      className="inline-flex h-10 items-center rounded-xl border border-[#d4a437]/50 bg-white/10 px-3 text-sm font-semibold transition-colors hover:bg-white/20"
                    >
                      {selectedRows.length === toSend.length ? "Clear selection" : `Select all ${toSend.length.toLocaleString()}`}
                    </button>
                    <button type="button" onClick={() => setRemitOpen(true)} disabled={selectedRows.length === 0} className={`${goldButton} h-10`}>
                      <Send size={16} /> Send to admin
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Phones: one card per row, so nothing has to be scrolled sideways. */}
              <div className="mt-4 space-y-3 md:hidden">
                {visible.length === 0 ? (
                  <div className="rounded-2xl border border-[#d4a437]/50 bg-white px-5 py-12 text-center">
                    <Lotus className="mx-auto h-12 w-20 text-[#d4a437]" />
                    <p className="mt-4 text-base font-semibold text-[#2a1458]">
                      {source.length === 0 ? emptyText[tab as keyof typeof emptyText][0] : "Nothing matches your search"}
                    </p>
                    <p className="mt-1 text-sm text-[#7a6a4a]">
                      {source.length === 0 ? emptyText[tab as keyof typeof emptyText][1] : "Try a different name, email or team."}
                    </p>
                  </div>
                ) : (
                  visible.map((row, index) => {
                    const busy = busyKey === `${rowKind}-${row.id}`
                    const [first, ...rest] = shownColumns
                    const remitted = isRemittanceTab ? (agentsByRemittance.get(row.id) ?? []) : []
                    const cell = (column: Column) => {
                      const value = row[column.key]
                      return column.render ? column.render(row) : value === null || value === "" ? dash : String(value)
                    }
                    return (
                      <article
                        key={`${tab}-card-${row.id}`}
                        onClick={rowsOpen ? (event: React.MouseEvent) => openRow(event, row) : undefined}
                        className={`rounded-2xl border border-[#d4a437]/50 bg-white p-4 text-sm text-[#2a1a3d] shadow-[0_18px_40px_-30px_rgba(58,13,42,0.5)] ${busy ? "opacity-55" : ""} ${rowsOpen ? "cursor-pointer" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          {selectable && row.payment_status === "paid_to_tl" ? (
                            <input
                              type="checkbox"
                              checked={selected.has(row.id)}
                              onChange={() => toggleSelected(row.id)}
                              aria-label={`Select ${String(row.name)} to send to admin`}
                              className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded accent-[#2a1458]"
                            />
                          ) : (
                            <span className="mt-0.5 grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-[#f1e6c8] px-1.5 text-xs font-semibold tabular-nums text-[#6b4a12]">
                              {index + 1}
                            </span>
                          )}
                          <div className="min-w-0 flex-1 break-words text-base">{cell(first)}</div>
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#f1e6c8] pt-4">
                          {rest.map((column) => (
                            <div key={column.key} className={`min-w-0 break-words ${wideOnCard.has(column.key) ? "col-span-2" : ""}`}>
                              <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#8a7a58]">{column.label}</dt>
                              <dd className="mt-1">{cell(column)}</dd>
                            </div>
                          ))}
                        </dl>
                        {isRemittanceTab && expanded === row.id && remitted.length > 0 ? (
                          <p className="mt-3 rounded-xl bg-[#fdf8ea] px-3 py-2.5 leading-relaxed text-[#4a3413]">
                            <span className="font-semibold">Agents in this remittance:</span>{" "}
                            {remitted.map((agent) => `${agent.name} (${formatMoney(agent.amount)})`).join(", ")}
                          </p>
                        ) : null}
                        <div className="mt-4 border-t border-[#f1e6c8] pt-3 empty:hidden">{renderActions(row, busy)}</div>
                      </article>
                    )
                  })
                )}
              </div>

              <div className="mt-4 hidden overflow-hidden rounded-2xl border border-[#d4a437]/50 bg-white shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm text-[#2a1a3d]">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#2a1458] to-[#1a0d3d] text-left text-[#fbe7a1]">
                        <th scope="col" className="w-12 px-4 py-3 text-right text-xs font-semibold text-[#f3d27a]/70">
                          {selectable ? <span className="sr-only">Select</span> : "#"}
                        </th>
                        {shownColumns.map((column) => {
                          const active = sort.key === column.key
                          const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown
                          return (
                            <th
                              key={column.key}
                              scope="col"
                              aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                            >
                              <button
                                type="button"
                                onClick={() => toggleSort(column.key)}
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap uppercase tracking-wider transition-colors hover:text-white ${
                                  active ? "text-white" : ""
                                }`}
                              >
                                {column.label}
                                <Icon size={14} className={active ? "text-[#f3d27a]" : "text-[#f3d27a]/40"} />
                              </button>
                            </th>
                          )
                        })}
                        <th scope="col" className={`${stickyAction} bg-[#1a0d3d] px-4 py-3 text-xs font-semibold uppercase tracking-wider`}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.length === 0 ? (
                        <tr>
                          <td colSpan={shownColumns.length + 2} className="px-3 py-16 text-center">
                            <Lotus className="mx-auto h-12 w-20 text-[#d4a437]" />
                            <p className="mt-4 text-base font-semibold text-[#2a1458]">
                              {source.length === 0 ? emptyText[tab as keyof typeof emptyText][0] : "Nothing matches your search"}
                            </p>
                            <p className="mt-1 text-sm text-[#7a6a4a]">
                              {source.length === 0 ? emptyText[tab as keyof typeof emptyText][1] : "Try a different name, email or team."}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        visible.map((row, index) => {
                          const busy = busyKey === `${isLeaderTab ? "leader" : isDeclinedTab ? "decline" : isRemittanceTab ? "remittance" : "registration"}-${row.id}`
                          const status = row.payment_status as PaymentStatus | undefined
                          const remitted = isRemittanceTab ? (agentsByRemittance.get(row.id) ?? []) : []
                          return (
                            <Fragment key={`${tab}-${row.id}`}>
                            <motion.tr
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: busy ? 0.55 : 1, y: 0 }}
                              transition={{ duration: 0.35, delay: Math.min(index, 12) * 0.03 }}
                              onClick={rowsOpen ? (event: React.MouseEvent) => openRow(event, row) : undefined}
                              title={rowsOpen ? "Click to open the full details" : undefined}
                              className={`border-b border-[#f1e6c8] align-top transition-colors last:border-0 odd:bg-white even:bg-[#fdfaf1] hover:bg-[#fdf3d7] ${rowsOpen ? "cursor-pointer" : ""}`}
                            >
                              <td className="px-4 py-4 text-right tabular-nums text-[#a89a7c]">
                                {selectable ? (
                                  status === "paid_to_tl" ? (
                                    <input
                                      type="checkbox"
                                      checked={selected.has(row.id)}
                                      onChange={() => toggleSelected(row.id)}
                                      aria-label={`Select ${String(row.name)} to send to admin`}
                                      className="h-5 w-5 cursor-pointer rounded accent-[#2a1458]"
                                    />
                                  ) : null
                                ) : (
                                  index + 1
                                )}
                              </td>
                              {shownColumns.map((column) => {
                                const value = row[column.key]
                                return (
                                  <td key={column.key} className={`px-4 py-4 ${column.cell ?? "whitespace-nowrap"}`}>
                                    {column.render ? column.render(row) : value === null || value === "" ? dash : String(value)}
                                  </td>
                                )
                              })}
                              <td className={`${stickyAction} whitespace-nowrap bg-inherit px-4 py-3.5`}>
                                {renderActions(row, busy)}
                              </td>
                            </motion.tr>
                            {isRemittanceTab && expanded === row.id && remitted.length > 0 ? (
                              <tr className="border-b border-[#f1e6c8] bg-[#fdf8ea]">
                                <td />
                                <td colSpan={shownColumns.length + 1} className="px-4 py-3 text-sm leading-relaxed text-[#4a3413]">
                                  <span className="font-semibold">Agents in this remittance:</span>{" "}
                                  {remitted.map((agent) => `${agent.name} (${formatMoney(agent.amount)})`).join(", ")}
                                </td>
                              </tr>
                            ) : null}
                            </Fragment>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="mt-3 text-xs text-[#7a6a4a]">
                Showing {visible.length.toLocaleString()} of {source.length.toLocaleString()}. Dates are in Philippine time.
              </p>

              {isAdmin && isDeclinedTab ? (
                <AdminManagedAgents
                  agents={adminManaged}
                  fee={fee}
                  busyKey={busyKey}
                  onConfirm={setConfirmed}
                onOpen={(row) => setDetail({ kind: "registration", row })}
                  onDelete={(row) => setPendingAction({ kind: "registration", row })}
                />
              ) : null}
            </>
          )}

          </div>
          </div>

          <GoldRule className="mx-auto mt-10 max-w-xs" />
        </main>

        <PersonDetail
          target={detail}
          registrations={rows}
          leaders={leaders}
          isAdmin={isAdmin}
          fee={fee}
          call={call}
          onOpen={setDetail}
          onLeaderChange={(leaderId, guestCode) => setLeaders((all) => all.map((l) => (l.id === leaderId ? { ...l, guest_code: guestCode } : l)))}
          onRegistrationEmailed={(registrationId, sentAt) => setRows((all) => all.map((r) => (r.id === registrationId ? { ...r, confirmation_emailed_at: sentAt } : r)))}
          onRegistrationChange={(registrationId, guestCode) => setRows((all) => all.map((r) => (r.id === registrationId ? { ...r, guest_code: guestCode } : r)))}
          onClose={() => setDetail(null)}
        />

        <AlertDialog open={pendingAction !== null} onOpenChange={(open) => (open ? null : setPendingAction(null))}>
          <AlertDialogContent className="rounded-2xl border-[#d4a437]/60 bg-white font-sans text-[#2a1a3d] sm:rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black text-[#2a1458]">{dialog?.title}</AlertDialogTitle>
              <AlertDialogDescription className="text-[#5c4a2a]">{dialog?.body}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-[#e3d3a8] bg-white text-[#6b4a12] hover:bg-[#fdf3d7] hover:text-[#6b4a12]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmPendingAction}
                className={`rounded-xl text-white ${
                  pendingAction?.kind === "verify" ? "bg-[#2a1458] hover:bg-[#1a0d3d]" : "bg-[#b3261e] hover:bg-[#9a1c15]"
                }`}
              >
                {dialog?.action}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <RemitDialog
          open={remitOpen}
          onOpenChange={setRemitOpen}
          agents={selectedRows}
          total={sum(selectedRows)}
          accounts={adminAccounts}
          onSubmit={sendRemittance}
        />
        <RejectDialog
          remittance={rejecting}
          onClose={() => setRejecting(null)}
          onReject={(row, note) => {
            setRejecting(null)
            reviewRemittance(row, "rejected", note)
          }}
        />
      </div>
    </MotionConfig>
  )
}

/** Team leader: record sending the ticked agents' payments to the organizer. */
function RemitDialog({
  open,
  onOpenChange,
  agents,
  total,
  accounts,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  agents: Registration[]
  total: number
  /** The organizer's accounts to send the money to. */
  accounts: TlPaymentAccount[]
  onSubmit: (form: FormData) => Promise<void>
}) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) setError(null)
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sending) return
    const form = new FormData(e.currentTarget)
    const receipt = form.get("receipt")
    if (receipt instanceof File && receipt.size > 5 * 1024 * 1024) return setError("The receipt file is larger than 5 MB.")
    setSending(true)
    setError(null)
    try {
      await onSubmit(form)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not record your remittance.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (sending ? null : onOpenChange(next))}>
      <DialogContent className={`${dialogClass} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-[#2a1458]">Send payment to admin</DialogTitle>
          <DialogDescription className="text-[#5c4a2a]">
            Send the money to the organizer first, then record it here so the admin can check it.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-[#4a3413]">
              {agents.length.toLocaleString()} agent{agents.length === 1 ? "" : "s"}
            </span>
            <span className="text-2xl font-black tabular-nums text-[#2a1458]">{formatMoney(total)}</span>
          </div>
          <p className="mt-2 max-h-20 overflow-y-auto text-xs leading-relaxed text-[#5c4a2a]">{agents.map((a) => a.name).join(", ")}</p>
        </div>

        <AdminAccountList accounts={accounts} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="remit-method" className={fieldLabel}>
                How did you send it?
              </label>
              <select id="remit-method" name="method" required defaultValue="" className={fieldClass}>
                <option value="" disabled>
                  Choose…
                </option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="remit-reference" className={fieldLabel}>
                Reference number
              </label>
              <input id="remit-reference" name="reference_no" required maxLength={120} autoComplete="off" className={fieldClass} />
            </div>
          </div>
          <div>
            <label htmlFor="remit-receipt" className={fieldLabel}>
              Receipt photo or screenshot
            </label>
            <input
              id="remit-receipt"
              name="receipt"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
              className="block w-full rounded-xl border border-[#e3d3a8] bg-white text-sm text-[#2a1a3d] file:mr-3 file:h-11 file:cursor-pointer file:border-0 file:bg-[#2a1458] file:px-4 file:text-sm file:font-semibold file:text-[#fbe7a1]"
            />
            <p className="mt-1.5 text-xs text-[#7a6a4a]">JPG, PNG, WEBP, HEIC or PDF, up to 5 MB.</p>
          </div>

          {error ? (
            <p role="alert" className="rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={() => onOpenChange(false)} disabled={sending} className={outlineButton}>
              Cancel
            </button>
            <button type="submit" disabled={sending || agents.length === 0} className={goldButton}>
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {sending ? "Sending…" : "Record remittance"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Admin: reject a remittance with a note for the team leader. */
function RejectDialog({
  remittance,
  onClose,
  onReject,
}: {
  remittance: Remittance | null
  onClose: () => void
  onReject: (remittance: Remittance, note: string) => void
}) {
  const [note, setNote] = useState("")
  useEffect(() => setNote(""), [remittance])

  return (
    <Dialog open={remittance !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-[#2a1458]">Reject this remittance?</DialogTitle>
          <DialogDescription className="text-[#5c4a2a]">
            {remittance
              ? `${formatMoney(remittance.amount)} from ${remittance.team_leader_name}. Its agents go back to "Paid to TL" so the team leader can send them again.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (remittance && note.trim()) onReject(remittance, note.trim())
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="reject-note" className={fieldLabel}>
              Reason (the team leader will see this)
            </label>
            <textarea
              id="reject-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              maxLength={500}
              rows={3}
              className={`${fieldClass} h-auto py-2`}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={onClose} className={outlineButton}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!note.trim()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#b3261e] px-4 text-sm font-bold text-white transition-colors hover:bg-[#9a1c15] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={16} /> Reject remittance
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Team leader only: the accounts and QR codes agents are shown after they register. */
/** Team leader: the admin's bank details, who to pay for, and the button that records the payment. */
function PayAdminPanel({
  accounts,
  agents,
  selected,
  total,
  waiting,
  verifiedTotal,
  onToggle,
  onSelectAll,
  onSend,
  onViewHistory,
  onViewPending,
}: {
  accounts: TlPaymentAccount[]
  /** Agents whose fee the team leader holds and has not sent on yet. */
  agents: Registration[]
  selected: Set<number>
  /** Sum for the ticked agents. */
  total: number
  /** Remittances the admin has not checked yet. */
  waiting: Remittance[]
  verifiedTotal: number
  onToggle: (id: number) => void
  onSelectAll: (all: boolean) => void
  onSend: () => void
  onViewHistory: () => void
  onViewPending: () => void
}) {
  const picked = agents.filter((agent) => selected.has(agent.id))
  const allPicked = agents.length > 0 && picked.length === agents.length
  const owed = agents.reduce((sum, agent) => sum + Number(agent.amount ?? 0), 0)
  const waitingTotal = waiting.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
  const panel = "rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8"

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className={panel}>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Step 1</p>
        <h2 className="mt-2 text-2xl font-black text-[#2a1458]">Send the money to the admin</h2>
        <p className="mb-5 mt-3 leading-relaxed text-[#5c4a2a]">
          Transfer the fees you collected from your agents to the organizer, then record the payment in step 2.
        </p>
        <AdminAccountList accounts={accounts} />
      </section>

      <section className={panel}>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Step 2</p>
        <h2 className="mt-2 text-2xl font-black text-[#2a1458]">Record your payment</h2>

        {agents.length === 0 ? (
          <div className="mt-4 rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] p-4 text-sm leading-relaxed text-[#4a3413]">
            <p className="font-semibold">Nothing to send right now.</p>
            <p className="mt-1">
              Agents appear here after you confirm that they paid you.{" "}
              <button type="button" onClick={onViewPending} className="font-semibold text-[#2a1458] underline underline-offset-2">
                See pending agents
              </button>
            </p>
          </div>
        ) : (
          <>
            <p className="mt-3 leading-relaxed text-[#5c4a2a]">
              You are holding <span className="font-bold text-[#2a1458]">{formatMoney(owed)}</span> from{" "}
              {agents.length.toLocaleString()} agent{agents.length === 1 ? "" : "s"}. Tick the agents this payment covers.
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-[#e3d3a8]">
              <label className="flex cursor-pointer items-center gap-3 border-b border-[#e3d3a8] bg-[#fdf3d7] px-4 py-2.5 text-sm font-semibold text-[#4a3413]">
                <input
                  type="checkbox"
                  checked={allPicked}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 accent-[#2a1458]"
                />
                Select all
              </label>
              <ul className="max-h-64 divide-y divide-[#f1e6c8] overflow-y-auto">
                {agents.map((agent) => (
                  <li key={agent.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[#fdf8ea]">
                      <input
                        type="checkbox"
                        checked={selected.has(agent.id)}
                        onChange={() => onToggle(agent.id)}
                        className="h-4 w-4 shrink-0 accent-[#2a1458]"
                      />
                      <span className="min-w-0 flex-1 break-words font-medium text-[#2a1a3d]">{agent.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-[#2a1458]">{formatMoney(agent.amount)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#2a1458] px-4 py-3 text-[#fbe7a1]">
              <p className="text-sm">
                {picked.length.toLocaleString()} selected ·{" "}
                <span className="text-xl font-black tabular-nums text-white">{formatMoney(total)}</span>
              </p>
              <button type="button" onClick={onSend} disabled={picked.length === 0} className={`${goldButton} h-10`}>
                <Send size={16} /> Record payment
              </button>
            </div>
          </>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] p-3">
            <dt className="text-[#7a6a4a]">Waiting for admin to check</dt>
            <dd className="mt-0.5 text-lg font-black tabular-nums text-[#2a1458]">{formatMoney(waitingTotal)}</dd>
          </div>
          <div className="rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] p-3">
            <dt className="text-[#7a6a4a]">Verified by admin</dt>
            <dd className="mt-0.5 text-lg font-black tabular-nums text-[#2a1458]">{formatMoney(verifiedTotal)}</dd>
          </div>
        </dl>
        <button type="button" onClick={onViewHistory} className={`${outlineButton} mt-4`}>
          <Receipt size={16} /> See payments you recorded
        </button>
      </section>
    </div>
  )
}

/** Where the money goes: the admin's accounts, shown to team leaders. */
function AdminAccountList({ accounts }: { accounts: TlPaymentAccount[] }) {
  const [copied, setCopied] = useState<number | null>(null)

  const copy = async (id: number, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(id)
      setTimeout(() => setCopied((current) => (current === id ? null : current)), 2000)
    } catch {
      setCopied(null)
    }
  }

  if (accounts.length === 0) {
    return (
      <p className="rounded-xl border border-[#e3d3a8] bg-[#fdf3d7] px-4 py-3 text-sm leading-relaxed text-[#4a3413]">
        <span className="font-semibold">The admin has not added payment details yet.</span> Ask the admin where to send the
        money, then record it here.
      </p>
    )
  }

  return (
    <div>
      <p className={fieldLabel}>Send the money to {accounts.length === 1 ? "this account" : "any one of these accounts"}</p>
      <ul className="space-y-2">
        {accounts.map((account) => (
          <li key={account.id} className="flex items-center gap-3 rounded-xl border border-[#e3d3a8] bg-white p-3">
            {account.qr_url ? (
              <a
                href={account.qr_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open the QR code full size"
                className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#e3d3a8] bg-white p-1"
              >
                <img src={account.qr_url} alt={`${account.bank} QR code`} className="h-full w-full object-contain" />
              </a>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="break-words font-black text-[#2a1458]">{account.bank}</p>
              {account.account_number ? (
                <>
                  <p className="break-all font-semibold tabular-nums text-[#2a1a3d]">{account.account_number}</p>
                  <p className="break-words text-sm text-[#5c4a2a]">{account.account_name}</p>
                </>
              ) : (
                <p className="text-sm text-[#5c4a2a]">Scan the QR code</p>
              )}
            </div>
            {account.account_number ? (
              <button
                type="button"
                onClick={() => copy(account.id, account.account_number ?? "")}
                className={`${outlineButton} h-9 shrink-0 px-3 text-xs`}
              >
                {copied === account.id ? <Check size={14} /> : <Copy size={14} />} {copied === account.id ? "Copied" : "Copy"}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PaymentDetailsPanel({
  audience = "agents",
  accounts,
  fee,
  onAdd,
  onUpdate,
  onDelete,
}: {
  /** Who pays into these accounts: a team leader's agents, or team leaders paying the admin. */
  audience?: "agents" | "leaders"
  accounts: TlPaymentAccount[]
  fee: number | null
  onAdd: (form: FormData) => Promise<void>
  onUpdate: (id: number, form: FormData) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  // Which form is open: an account being edited, a new one, or none.
  const [editing, setEditing] = useState<number | "new" | null>(accounts.length === 0 ? "new" : null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const full = accounts.length >= MAX_PAYMENT_ACCOUNTS
  const forLeaders = audience === "leaders"

  const remove = async (id: number) => {
    setDeleting(id)
    setError(null)
    try {
      await onDelete(id)
      setConfirmDelete(null)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "We could not delete this account.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">
        {forLeaders ? "For team leaders" : "For your agents"}
      </p>
      <h2 className="mt-2 text-2xl font-black text-[#2a1458]">{forLeaders ? "Where team leaders pay you" : "Where agents pay you"}</h2>
      {forLeaders ? (
        <p className="mt-3 max-w-2xl leading-relaxed text-[#5c4a2a]">
          When a team leader sends you the fees they collected from their agents, they are shown these accounts. Add as many as
          you accept, for example BDO, BPI and GCash. The team leader picks one.
        </p>
      ) : (
        <p className="mt-3 max-w-2xl leading-relaxed text-[#5c4a2a]">
          Right after an agent on your team registers, they are shown these accounts so they can send you the registration fee
          {fee !== null ? (
            <>
              {" "}
              of <span className="font-bold text-[#2a1458]">{formatMoney(fee)}</span> per person
            </>
          ) : null}
          . Add as many as you accept, for example BDO, BPI and GCash. The agent picks one.
        </p>
      )}

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
          {error}
        </p>
      ) : null}

      {accounts.length > 0 ? (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {accounts.map((account) =>
            editing === account.id ? (
              <li key={account.id} className="lg:col-span-2">
                <PaymentAccountForm
                  account={account}
                  onCancel={() => setEditing(null)}
                  onSubmit={async (form) => {
                    await onUpdate(account.id, form)
                    setEditing(null)
                  }}
                />
              </li>
            ) : (
              <li key={account.id} className="flex gap-4 rounded-2xl border border-[#e3d3a8] bg-[#fdf8ea] p-4">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#e3d3a8] bg-white p-1">
                  {account.qr_url ? (
                    <img src={account.qr_url} alt={`${account.bank} QR code`} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-center text-[11px] leading-tight text-[#a89a7c]">
                      <QrCode size={22} className="mx-auto mb-1" />
                      No QR code
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-lg font-black text-[#2a1458]">{account.bank}</p>
                  {account.account_number ? (
                    <>
                      <p className="break-all font-semibold tabular-nums text-[#2a1a3d]">{account.account_number}</p>
                      <p className="break-words text-sm text-[#5c4a2a]">{account.account_name}</p>
                    </>
                  ) : (
                    <p className="text-sm text-[#5c4a2a]">QR code only</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {confirmDelete === account.id ? (
                      <>
                        <span className="text-sm font-semibold text-[#9a1c15]">Delete this account?</span>
                        <button
                          type="button"
                          onClick={() => remove(account.id)}
                          disabled={deleting !== null}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#b3261e] px-3 text-xs font-bold text-white hover:bg-[#9a1c15] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleting === account.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Yes, delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          disabled={deleting !== null}
                          className={`${outlineButton} h-9 px-3 text-xs`}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(account.id)
                            setConfirmDelete(null)
                          }}
                          className={`${outlineButton} h-9 px-3 text-xs`}
                        >
                          <Settings size={14} /> Edit
                        </button>
                        <button type="button" onClick={() => setConfirmDelete(account.id)} className={`${outlineButton} h-9 px-3 text-xs`}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      ) : null}

      {editing === "new" ? (
        <div className="mt-6">
          <PaymentAccountForm
            account={null}
            onCancel={accounts.length > 0 ? () => setEditing(null) : undefined}
            onSubmit={async (form) => {
              await onAdd(form)
              setEditing(null)
            }}
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setEditing("new")} disabled={full} className={goldButton}>
            <Banknote size={16} /> Add {accounts.length > 0 ? "another" : "an"} account
          </button>
          <p className="text-sm text-[#7a6a4a]">
            {full
              ? `You have reached the limit of ${MAX_PAYMENT_ACCOUNTS} accounts.`
              : `${accounts.length.toLocaleString()} account${accounts.length === 1 ? "" : "s"} shown to ${forLeaders ? "team leaders" : "your agents"}.`}
          </p>
        </div>
      )}
    </section>
  )
}

/** Add or edit one payment account: bank, account details and/or its QR code. */
function PaymentAccountForm({
  account,
  onSubmit,
  onCancel,
}: {
  account: TlPaymentAccount | null
  onSubmit: (form: FormData) => Promise<void>
  onCancel?: () => void
}) {
  const [bank, setBank] = useState(account?.bank ?? "")
  const [accountName, setAccountName] = useState(account?.account_name ?? "")
  const [accountNumber, setAccountNumber] = useState(account?.account_number ?? "")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [removeQr, setRemoveQr] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const idPrefix = `pay-${account?.id ?? "new"}`

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const shownQr = preview ?? (removeQr ? null : (account?.qr_url ?? null))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (saving) return
    if (file && file.size > 5 * 1024 * 1024) return setError("The QR code image is larger than 5 MB.")
    if (!shownQr && !accountNumber.trim()) return setError("Add an account number or a QR code for this account.")
    const form = new FormData()
    form.set("bank", bank)
    form.set("account_name", accountName)
    form.set("account_number", accountNumber)
    if (file) form.set("qr", file)
    if (removeQr && !file) form.set("remove_qr", "1")
    setSaving(true)
    setError(null)
    try {
      await onSubmit(form)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "We could not save this account.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl border border-[#d4a437]/60 bg-[#fdfaf1] p-5 lg:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <h3 className="font-bold text-[#2a1458]">{account ? `Edit ${account.bank}` : "New account"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idPrefix}-bank`} className={fieldLabel}>
              Bank or e-wallet <span className="text-[#b3261e]">*</span>
            </label>
            <input
              id={`${idPrefix}-bank`}
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              required
              maxLength={80}
              placeholder="e.g. BDO, BPI, GCash"
              autoComplete="off"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-number`} className={fieldLabel}>
              Account number
            </label>
            <input
              id={`${idPrefix}-number`}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              maxLength={60}
              inputMode="numeric"
              placeholder="e.g. 0012 3456 7890"
              autoComplete="off"
              className={`${fieldClass} tabular-nums`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${idPrefix}-name`} className={fieldLabel}>
              Account name
            </label>
            <input
              id={`${idPrefix}-name`}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required={accountNumber.trim() !== ""}
              maxLength={120}
              placeholder="The name the account is under"
              autoComplete="off"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-qr`} className={fieldLabel}>
            {account?.qr_url ? "Replace the QR code image" : "QR code image (optional if you gave an account number)"}
          </label>
          <input
            id={`${idPrefix}-qr`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setRemoveQr(false)
            }}
            className="block w-full rounded-xl border border-[#e3d3a8] bg-white text-sm text-[#2a1a3d] file:mr-3 file:h-11 file:cursor-pointer file:border-0 file:bg-[#2a1458] file:px-4 file:text-sm file:font-semibold file:text-[#fbe7a1]"
          />
          <p className="mt-1.5 text-xs text-[#7a6a4a]">A screenshot of this account&apos;s QR code. JPG, PNG or WEBP, up to 5 MB.</p>
          {account?.qr_url && !file ? (
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-[#4a3413]">
              <input
                type="checkbox"
                checked={removeQr}
                onChange={(e) => setRemoveQr(e.target.checked)}
                className="h-4 w-4 rounded accent-[#b3261e]"
              />
              Remove the current QR code
            </label>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={saving} className={goldButton}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}{" "}
            {saving ? "Saving…" : account ? "Save changes" : "Save account"}
          </button>
          {onCancel ? (
            <button type="button" onClick={onCancel} disabled={saving} className={outlineButton}>
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="grid h-48 w-48 place-items-center overflow-hidden rounded-2xl border border-[#d4a437]/60 bg-white p-3">
          {shownQr ? (
            <img src={shownQr} alt="QR code for this account" className="h-full w-full object-contain" />
          ) : (
            <div className="text-center text-sm text-[#a89a7c]">
              <QrCode size={36} className="mx-auto" />
              <p className="mt-2">No QR code</p>
            </div>
          )}
        </div>
        <p className="text-xs text-[#7a6a4a]">{file ? "New image, not saved yet" : ""}</p>
      </div>
    </form>
  )
}

/** Admin only: the registration fee every agent pays their team leader. */
function FeePanel({ fee, busy, onSave }: { fee: number | null; busy: boolean; onSave: (fee: number) => void }) {
  const [value, setValue] = useState(fee === null ? "" : String(fee))
  useEffect(() => setValue(fee === null ? "" : String(fee)), [fee])
  const parsed = Number(value)
  const valid = value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0

  return (
    <section className="mt-4 rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Payments</p>
      <h2 className="mt-2 text-2xl font-black text-[#2a1458]">Registration fee per agent</h2>
      <p className="mt-3 max-w-xl leading-relaxed text-[#5c4a2a]">
        Each agent pays this amount to their team leader. Changing it only affects payments confirmed from now on; amounts
        already confirmed stay as they are.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) onSave(parsed)
        }}
        className="mt-5 flex flex-wrap items-end gap-3"
      >
        <div>
          <label htmlFor="fee-amount" className={fieldLabel}>
            Amount ({CURRENCY})
          </label>
          <input
            id="fee-amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            className={`${fieldClass} w-48 tabular-nums`}
          />
        </div>
        <button type="submit" disabled={!valid || busy || parsed === fee} className={goldButton}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save fee
        </button>
        <p className="pb-3 text-sm text-[#5c4a2a]">
          Current: <span className="font-bold text-[#2a1458]">{fee === null ? "not set" : formatMoney(fee)}</span>
        </p>
      </form>
    </section>
  )
}

/** Admin only: how many people can register before registration closes by itself. */
function SlotsPanel({ limit, taken, busy, onSave }: { limit: number; taken: number; busy: boolean; onSave: (limit: number) => void }) {
  const [value, setValue] = useState(String(limit))
  useEffect(() => setValue(String(limit)), [limit])
  const parsed = Number(value)
  const valid = value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= 100_000
  const left = Math.max(0, limit - taken)
  const percent = limit > 0 ? Math.min(100, Math.round((taken / limit) * 100)) : 100

  return (
    <section className="mt-4 rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Registration</p>
      <h2 className="mt-2 text-2xl font-black text-[#2a1458]">Available slots</h2>
      <p className="mt-3 max-w-xl leading-relaxed text-[#5c4a2a]">
        Agents can register until every slot is taken, then registration closes by itself. Each person takes one slot, so a
        couple who are both joining takes two. Raise the number at any time to open more.
      </p>

      <div className="mt-5 max-w-xl">
        <div className="flex items-baseline justify-between gap-3 text-sm text-[#5c4a2a]">
          <span>
            <span className="text-lg font-black tabular-nums text-[#2a1458]">{taken.toLocaleString()}</span> of{" "}
            {limit.toLocaleString()} taken
          </span>
          <span className={`font-semibold ${left === 0 ? "text-[#9a1c15]" : "text-[#2a1458]"}`}>
            {left === 0 ? "Registration is full" : `${left.toLocaleString()} left`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Slots taken"
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(taken, limit)}
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#f1e6c8]"
        >
          <div className={`h-full rounded-full ${left === 0 ? "bg-[#b3261e]" : "bg-[#d4a437]"}`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) onSave(parsed)
        }}
        className="mt-5 flex flex-wrap items-end gap-3"
      >
        <div>
          <label htmlFor="slot-limit" className={fieldLabel}>
            Total slots
          </label>
          <input
            id="slot-limit"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`${fieldClass} w-48 tabular-nums`}
          />
        </div>
        <button type="submit" disabled={!valid || busy || parsed === limit} className={goldButton}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save slots
        </button>
        {valid && parsed < taken ? (
          <p className="pb-3 text-sm text-[#9a1c15]">Lower than the {taken.toLocaleString()} already registered: nobody else can register.</p>
        ) : null}
      </form>
    </section>
  )
}

const INVITE_COPY = {
  tl: {
    path: "join",
    eyebrow: "For team leaders only",
    title: "Team leader registration link",
    intro: "Team leaders can only register through this private link or its QR code. Send it to the team leaders yourself. It is not shown anywhere on the public site.",
    regenerate: "Create a new link. The current link and QR code stop working at once; team leaders who already registered keep their accounts.",
    qrAlt: "QR code for the team leader registration link",
    qrFile: "ares-2027-team-leader-registration-qr.png",
  },
  guest: {
    path: "guest",
    eyebrow: "Special registration",
    title: "Guest registration link",
    intro: "Give this private link or its QR code to a guest you want to invite to ARES 2027. They can register whether or not they are in the LR records: their email is checked first, and each guest below is marked as an LR agent or not. Guests pay you directly, using your payment details in Settings.",
    regenerate: "Create a new link. The current link and QR code stop working at once; guests who already registered are not affected.",
    qrAlt: "QR code for the guest registration link",
    qrFile: "ares-2027-guest-registration-qr.png",
  },
} as const

/** Admin only: a private registration link and its QR code, for team leaders or for guests. */
function InvitePanel({
  audience,
  token,
  busy,
  onRegenerate,
}: {
  audience: keyof typeof INVITE_COPY
  token: string | null
  busy: boolean
  onRegenerate: () => void
}) {
  const copyText = INVITE_COPY[audience]
  const [origin, setOrigin] = useState("")
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => setOrigin(window.location.origin), [])
  const link = token && origin ? `${origin}/${copyText.path}/${encodeURIComponent(token)}` : ""

  useEffect(() => {
    if (!link) return setQr(null)
    let cancelled = false
    QRCode.toDataURL(link, { width: 640, margin: 2, errorCorrectionLevel: "M", color: { dark: "#1a0d3d", light: "#ffffff" } })
      .then((url) => (cancelled ? null : setQr(url)))
      .catch(() => (cancelled ? null : setQr(null)))
    return () => {
      cancelled = true
    }
  }, [link])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (!token) {
    return (
      <p role="alert" className="mt-4 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
        The registration link could not be loaded. Reload the page to try again.
      </p>
    )
  }

  return (
    <section className="mt-4 grid gap-6 rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">{copyText.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black text-[#2a1458]">{copyText.title}</h2>
        <p className="mt-3 max-w-xl leading-relaxed text-[#5c4a2a]">{copyText.intro}</p>

        <label htmlFor={`${audience}-invite-link`} className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#4a3413]">
          <Link2 size={16} className="text-[#b8862b]" /> Registration link
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id={`${audience}-invite-link`}
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#e3d3a8] bg-[#fdfaf1] px-3 font-mono text-xs text-[#2a1a3d] outline-none focus:border-[#c9972f]"
          />
          <button type="button" onClick={copy} disabled={!link} className={goldButton}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        <div className="mt-8 border-t border-dashed border-[#d4a437]/60 pt-6">
          <h3 className="font-bold text-[#2a1458]">Link shared with the wrong people?</h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#5c4a2a]">{copyText.regenerate}</p>
          <button type="button" onClick={onRegenerate} disabled={busy} className={`${outlineButton} mt-4`}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Create new link
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="grid h-60 w-60 place-items-center rounded-2xl border border-[#d4a437]/60 bg-white p-3">
          {qr ? (
            <img src={qr} alt={copyText.qrAlt} className="h-full w-full" />
          ) : (
            <Loader2 className="animate-spin text-[#b8862b]" />
          )}
        </div>
        {qr ? (
          <a href={qr} download={copyText.qrFile} className={outlineButton}>
            <Download size={16} /> Download QR code
          </a>
        ) : null}
      </div>
    </section>
  )
}
