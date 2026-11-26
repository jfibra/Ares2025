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
import { PaymentCountdown } from "@/components/payment-countdown"
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
type Tab = "pending" | "confirmed" | "remittances" | "leaders" | "assign" | "declined" | "guests" | "settings" | "payment" | "payadmin"
type Row = Record<string, unknown> & { id: number }
type Column = { key: string; label: string; render?: (row: Row) => React.ReactNode }
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
  initialSlotLimit = 300,
  initialTeamLeaders = [],
  initialInviteToken = null,
  initialGuestInviteToken = null,
  initialPaymentDetails = null,
  initialAdminAccounts = [],
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
  initialSlotLimit?: number
  initialTeamLeaders?: TeamLeader[]
  initialInviteToken?: string | null
  /** Admin: the code in the guest registration link. */
  initialGuestInviteToken?: string | null
  initialPaymentDetails?: TlPaymentDetails | null
  initialAdminAccounts?: TlPaymentAccount[]
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
  // Admin: how many people can register in total.
  const [slotLimit, setSlotLimit] = useState(initialSlotLimit)
  const [leaders, setLeaders] = useState(initialTeamLeaders)
  // Admin: team leaders who said they are not joining.
  const [declines, setDeclines] = useState(initialDeclines)
  // Team leader: where their agents send the registration fee.
  const [paymentDetails, setPaymentDetails] = useState(initialPaymentDetails)
  // The organizer's accounts: the admin manages them, team leaders send their collections there.
  const [adminAccounts, setAdminAccounts] = useState(initialAdminAccounts)
  // Team leader: agents ticked to send to the admin in one remittance.
  const [selected, setSelected] = useState<Set<number>>(() => new Set())
  const [remitOpen, setRemitOpen] = useState(false)
  const [rejecting, setRejecting] = useState<Remittance | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [inviteToken, setInviteToken] = useState(initialInviteToken)
  const [guestInviteToken, setGuestInviteToken] = useState(initialGuestInviteToken)
  const [tab, setTab] = useState<Tab>("pending")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<Sort>({ key: "registration_date", direction: "desc" })
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(loadFailed ? "Could not load everything. Try Refresh." : null)

  // Admin: agents whose team leader is not joining have no team leader on their registration. The admin
  // looks after them on the "Not joining" tab, so they are kept out of the Pending and Confirmed lists.
  // Guests (special registration through the admin's guest link) also pay the admin; they have their own tab.
  const adminManaged = useMemo(() => (isAdmin ? rows.filter((r) => r.team_leader_id === null && !r.guest_type) : []), [isAdmin, rows])
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
      render: (r) => (
        <span className="font-semibold text-[#2a1458]">
          {String(r.name)}
          {isLeaderRow(r) ? (
            <>
              {" "}
              <Badge label={isAdmin ? "Team leader" : "You"} className="border-amber-300 bg-amber-50 text-amber-900" />
            </>
          ) : null}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (r) => (
        <a href={`mailto:${r.email}`} className="text-[#0078b6] hover:underline">
          {String(r.email)}
        </a>
      ),
    },
    { key: "contact_number", label: "Contact Number" },
    { key: "whatsapp_number", label: "WhatsApp" },
    { key: "birth_date", label: "Birth Date", render: (r: Row) => formatDay(r.birth_date) },
    { key: "polo_shirt_size", label: "Polo Size" },
    {
      key: "attendee_count",
      label: "Joining",
      render: (r: Row) =>
        Number(r.attendee_count) === 2 ? (
          <Badge label="Both · 2 people" className="border-violet-200 bg-violet-50 text-violet-800" />
        ) : r.attendees ? (
          `${String(r.attendees)} only`
        ) : (
          "1 person"
        ),
    },
    { key: "team", label: "Team" },
    ...(isAdmin ? [{ key: "team_leader_name", label: "Team Leader" }] : []),
    { key: "registration_date", label: "Registered", render: (r: Row) => formatDate(r.registration_date) },
    {
      key: "photo_count",
      label: "Uploaded Photo",
      render: (r: Row) => {
        const count = Number(r.photo_count) || 0
        if (!count) return <span className="text-xs text-[#7a6a4a]">No photo</span>
        // Two photos means both people on a couple's record are joining, in the order of their names.
        const names = count === 2 ? splitCouple(String(r.attendees ?? "")) : null
        return (
          <div className="min-w-[8rem] space-y-1">
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
      label: "Agent Receipt",
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
            <p className="text-xs text-[#7a6a4a]">Sent {formatDate(r.agent_receipt_at)}</p>
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
          { key: "amount_due", label: "To Pay", render: (r: Row) => formatMoney(r.amount_due) },
          {
            // The 48 hours an agent has to pay. A team leader's own registration is not on the clock.
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
          { key: "amount", label: "Amount", render: (r: Row) => formatMoney(r.amount) },
          { key: "payment_status", label: "Payment", render: (r: Row) => <Badge {...paymentBadge[r.payment_status as PaymentStatus]} /> },
        ]
      : []),
  ]
  const remittanceColumns: Column[] = [
    { key: "submitted_at", label: "Sent", render: (r) => formatDate(r.submitted_at) },
    ...(isAdmin ? [{ key: "team_leader_name", label: "Team Leader" }] : []),
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
    { key: "amount", label: "Amount", render: (r) => <span className="font-semibold tabular-nums">{formatMoney(r.amount)}</span> },
    { key: "method", label: "Method" },
    { key: "reference_no", label: "Reference No." },
    {
      key: "status",
      label: "Status",
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
    { key: "name", label: "Name", render: (l) => <span className="font-semibold text-[#2a1458]">{String(l.name)}</span> },
    {
      key: "email",
      label: "Email",
      render: (l) => (
        <a href={`mailto:${l.email}`} className="text-[#0078b6] hover:underline">
          {String(l.email)}
        </a>
      ),
    },
    { key: "contact_number", label: "Contact Number" },
    { key: "team", label: "Team" },
    { key: "pending_agents", label: "Pending Agents" },
    { key: "confirmed_agents", label: "Confirmed Agents" },
    { key: "created_at", label: "Registered", render: (l) => formatDate(l.created_at) },
  ]

  const declineColumns: Column[] = [
    { key: "name", label: "Name", render: (d) => <span className="font-semibold text-[#2a1458]">{String(d.name)}</span> },
    {
      key: "email",
      label: "Email",
      render: (d) => (
        <a href={`mailto:${d.email}`} className="text-[#0078b6] hover:underline">
          {String(d.email)}
        </a>
      ),
    },
    { key: "team", label: "Team" },
    {
      key: "reason",
      label: "Reason for not joining",
      render: (d) => <p className="min-w-[16rem] max-w-md whitespace-pre-wrap break-words">{String(d.reason)}</p>,
    },
    { key: "declined_at", label: "Declined", render: (d) => formatDate(d.declined_at) },
  ]

  const isLeaderTab = tab === "leaders"
  const isDeclinedTab = tab === "declined"
  const isRemittanceTab = tab === "remittances"
  const columns = isLeaderTab ? leaderColumns : isDeclinedTab ? declineColumns : isRemittanceTab ? remittanceColumns : registrationColumns
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
    if (tab === "confirmed") return confirmed as unknown as Row[]
    // What each waiting registration owes: the fee for every person joining.
    return pending.map((r) => ({ ...r, amount_due: fee === null ? null : fee * r.attendee_count }))
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
    const key = { pending: "registration_date", confirmed: "registration_date", remittances: "submitted_at", leaders: "created_at", declined: "declined_at", guests: "", settings: "", assign: "", payment: "", payadmin: "" }[next]
    setSort({ key, direction: "desc" })
  }

  const toggleSort = (key: string) =>
    setSort((current) =>
      current.key === key ? { key, direction: current.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" },
    )

  const exportCsv = () => {
    const names: Record<Tab, string> = {
      pending: "pending-agents",
      confirmed: "confirmed-agents",
      remittances: "remittances",
      leaders: "team-leaders",
      declined: "team-leaders-not-joining",
      guests: "",
      settings: "",
      assign: "",
      payment: "",
      payadmin: "",
    }
    const exportValue = (r: Row, key: string) => {
      if (key === "birth_date") return r[key] ?? ""
      if (key === "time_left") {
        if (isLeaderRow(r)) return ""
        return isOnPaymentClock(r) ? `Pay by ${formatDate(new Date(paymentDeadlineMs(String(r.registration_date))).toISOString())}` : "Receipt sent"
      }
      if (key === "agent_receipt_at") {
        return r[key] ? `Sent ${formatDate(r[key])}${r.agent_receipt_note ? ` - ${r.agent_receipt_note}` : ""}` : "No"
      }
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
  const verifiedTotal = sum(remittances.filter((r) => r.status === "verified")) + sum([...adminManaged, ...guests].filter((r) => r.payment_status === "verified"))
  const statCards: { label: string; icon: typeof Users; count?: number; money?: number; hint?: string }[] = isAdmin
    ? [
        { label: "Team leaders", icon: UserCog, count: leaders.length },
        {
          label: "Agents registered",
          icon: Users,
          count: rows.length,
          hint: `${slotsTaken.toLocaleString()} of ${slotLimit.toLocaleString()} slots taken · ${rows.filter((r) => !r.confirmed_by_tl).length.toLocaleString()} not paid yet`,
        },
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
    { id: "pending", label: "Pending", count: pending.length },
    { id: "confirmed", label: "Confirmed", count: confirmed.length },
    { id: "remittances", label: "Remittances", count: isAdmin ? waiting.length : remittances.length },
    ...(isAdmin
      ? [
          { id: "leaders" as Tab, label: "Team leaders", count: leaders.length },
          { id: "assign" as Tab, label: "Assign TL", icon: UserCog },
          { id: "declined" as Tab, label: "Not joining", count: declines.length + adminManaged.length },
          { id: "guests" as Tab, label: "Guests", count: guests.length, icon: Sparkles },
          { id: "settings" as Tab, label: "Settings", icon: Settings },
        ]
      : [
          { id: "payadmin" as Tab, label: "Pay admin", icon: Send, count: toSend.length },
          { id: "payment" as Tab, label: "Payment details", icon: QrCode },
        ]),
  ]

  const emptyText: Record<Exclude<Tab, "settings" | "payment" | "payadmin" | "assign" | "guests">, [string, string]> = {
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
        <header className="relative overflow-hidden border-b-2 border-[#d4a437] bg-gradient-to-r from-[#2a1458] via-[#1a0d3d] to-[#3a0d2a] pb-24 text-white">
          <div aria-hidden className="absolute inset-0 opacity-[0.13]" style={{ backgroundImage: goldLattice }} />
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#d4a437]/20 blur-[110px]" />

          <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
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
            className="relative mx-auto mt-6 flex max-w-[1400px] items-end gap-5 px-4 sm:px-6"
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

        <main className="relative mx-auto -mt-16 max-w-[1400px] px-4 pb-12 sm:px-6">
          {/* Summary cards overlap the header band */}
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
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

          {needsOwnTicket && ownName ? <OwnTicketCard name={ownName} fee={fee} onSaved={refresh} declinedReason={ownDeclineReason} /> : null}

          {/* Tabs */}
          <div role="tablist" aria-label="Lists" className="mt-8 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((item) => {
              const active = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeTab(item.id)}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                    active
                      ? "border-[#2a1458] bg-[#2a1458] text-[#fbe7a1]"
                      : "border-[#e3d3a8] bg-white text-[#6b4a12] hover:border-[#c9972f] hover:bg-[#fdf3d7]"
                  }`}
                >
                  {item.icon ? <item.icon size={16} /> : null}
                  {item.label}
                  {item.count !== undefined ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                        active ? "bg-[#f3d27a] text-[#2a1408]" : "bg-[#f1e6c8] text-[#6b4a12]"
                      }`}
                    >
                      {item.count.toLocaleString()}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {errorMessage ? (
            <p role="alert" className="mt-4 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
              {errorMessage}
            </p>
          ) : null}

          {tab === "payment" ? (
            <PaymentDetailsPanel
              accounts={paymentDetails ?? []}
              fee={fee}
              onAdd={(form) => changePaymentAccounts("/api/tl/payment-details", { method: "POST", body: form })}
              onUpdate={(id, form) => changePaymentAccounts(`/api/tl/payment-details/${id}`, { method: "PUT", body: form })}
              onDelete={(id) => changePaymentAccounts(`/api/tl/payment-details/${id}`, { method: "DELETE" })}
            />
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
          ) : tab === "guests" ? (
            <>
              <InvitePanel
                audience="guest"
                token={guestInviteToken}
                busy={busyKey === "guest-invite"}
                onRegenerate={() => setPendingAction({ kind: "regenerateGuest" })}
              />
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={refresh} disabled={refreshing} className={outlineButton}>
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
                </button>
              </div>
              <AdminManagedAgents
                variant="guests"
                agents={guests}
                fee={fee}
                busyKey={busyKey}
                onConfirm={setConfirmed}
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

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#d4a437]/50 bg-white shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#2a1458] to-[#1a0d3d] text-left text-[#fbe7a1]">
                        <th scope="col" className="w-12 px-4 py-3.5 text-right font-semibold text-[#f3d27a]/70">
                          {selectable ? <span className="sr-only">Select</span> : "#"}
                        </th>
                        {columns.map((column) => {
                          const active = sort.key === column.key
                          const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown
                          return (
                            <th
                              key={column.key}
                              scope="col"
                              aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                              className="px-3 py-3.5 font-semibold"
                            >
                              <button
                                type="button"
                                onClick={() => toggleSort(column.key)}
                                className={`inline-flex w-full items-center justify-between gap-2 whitespace-nowrap transition-colors hover:text-white ${
                                  active ? "text-white" : ""
                                }`}
                              >
                                {column.label}
                                <Icon size={14} className={active ? "text-[#f3d27a]" : "text-[#f3d27a]/40"} />
                              </button>
                            </th>
                          )
                        })}
                        <th scope="col" className="px-3 py-3.5 font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length + 2} className="px-3 py-16 text-center">
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
                              className="border-b border-[#f1e6c8] transition-colors last:border-0 odd:bg-white even:bg-[#fdfaf1] hover:bg-[#fdf3d7]"
                            >
                              <td className="px-4 py-3.5 text-right tabular-nums text-[#a89a7c]">
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
                              {columns.map((column) => {
                                const value = row[column.key]
                                return (
                                  <td key={column.key} className="px-3 py-3.5">
                                    {column.render ? column.render(row) : value === null || value === "" ? dash : String(value)}
                                  </td>
                                )
                              })}
                              <td className="px-3 py-3.5">
                                <div className="flex items-center gap-2">
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
                                      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
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
                              </td>
                            </motion.tr>
                            {isRemittanceTab && expanded === row.id && remitted.length > 0 ? (
                              <tr className="border-b border-[#f1e6c8] bg-[#fdf8ea]">
                                <td />
                                <td colSpan={columns.length + 1} className="px-3 py-3 text-sm text-[#4a3413]">
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
                  onDelete={(row) => setPendingAction({ kind: "registration", row })}
                />
              ) : null}
            </>
          )}

          <GoldRule className="mx-auto mt-10 max-w-xs" />
        </main>

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
