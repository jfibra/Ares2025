"use client"

import { useEffect, useState } from "react"
import { Check, Copy, Facebook, ImageIcon, Link2, Loader2, Mail, Phone, Receipt, RefreshCw, Sparkles, TriangleAlert } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GoldRule } from "@/components/thai-ornaments"
import { poloSizesLabel, splitCouple, type Registration, type TeamLeader } from "@/lib/registrations"

// The page that opens when a row is clicked: everything about one agent, guest or team
// leader. For a team leader the admin can also make that leader's own guest link here, so
// guests who register through it are recorded as theirs.

export type PersonTarget = { kind: "registration"; row: Registration } | { kind: "leader"; leader: TeamLeader }
type Call = (url: string, init?: RequestInit) => Promise<Record<string, any> | null>

const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" })
const dayFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeZone: "UTC" })
const moneyFormat = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })
const day = (value: string | null) => (value ? dayFormat.format(new Date(`${value}T00:00:00Z`)) : "—")
const PAYMENT_LABEL: Record<Registration["payment_status"], string> = {
  unpaid: "Not paid",
  paid_to_tl: "Paid to team leader",
  remitted: "Sent to admin",
  verified: "Fully paid",
}
const linkClass = "inline-flex items-center gap-1.5 font-semibold text-[#0078b6] hover:underline"
const sectionTitle = "text-xs font-semibold uppercase tracking-[0.25em] text-[#b8862b]"

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`min-w-0 break-words ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#8a7a58]">{label}</dt>
      <dd className="mt-1 text-sm text-[#2a1a3d]">{children}</dd>
    </div>
  )
}

function StatusPill({ status }: { status: Registration["payment_status"] }) {
  const paid = status !== "unpaid"
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
        paid ? "border-green-200 bg-green-50 text-green-800" : "border-[#e3d3a8] bg-[#fdf3d7] text-[#8a5a00]"
      }`}
    >
      {PAYMENT_LABEL[status]}
    </span>
  )
}

/** A short list of people (a leader's agents or guests): name, how many, and payment. Each opens its own page. */
function PeopleList({ people, empty, onOpen }: { people: Registration[]; empty: string; onOpen: (row: Registration) => void }) {
  if (people.length === 0) return <p className="mt-3 rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] px-4 py-3 text-sm text-[#5c4a2a]">{empty}</p>
  return (
    <ul className="mt-3 divide-y divide-[#f1e6c8] overflow-hidden rounded-xl border border-[#e3d3a8]">
      {people.map((person) => (
        <li key={person.id}>
          <button
            type="button"
            onClick={() => onOpen(person)}
            className="flex w-full flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 text-left transition-colors hover:bg-[#fdf3d7]"
          >
            <span className="min-w-0">
              <span className="block break-words font-semibold text-[#2a1458]">{person.name}</span>
              <span className="block break-all text-xs text-[#7a6a4a]">
                {person.email} · {person.attendee_count === 2 ? "2 people" : "1 person"}
              </span>
            </span>
            <StatusPill status={person.payment_status} />
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function PersonDetail({
  target,
  registrations,
  leaders,
  isAdmin,
  fee,
  call,
  onOpen,
  onLeaderChange,
  onClose,
}: {
  /** Who to show; null closes the page. */
  target: PersonTarget | null
  registrations: Registration[]
  leaders: TeamLeader[]
  isAdmin: boolean
  fee: number | null
  /** The dashboard's request helper: null when the session ended, throws with the reason on failure. */
  call: Call
  /** Opens another person from inside this page (an agent or guest of a team leader). */
  onOpen: (next: PersonTarget) => void
  /** Called with the team leader's new guest code after the admin makes or replaces the link. */
  onLeaderChange: (leaderId: number, guestCode: string) => void
  onClose: () => void
}) {
  const [origin, setOrigin] = useState("")
  useEffect(() => setOrigin(window.location.origin), [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmReplace, setConfirmReplace] = useState(false)
  // A fresh page for each person.
  const targetKey = target ? `${target.kind}-${target.kind === "leader" ? target.leader.id : target.row.id}` : ""
  useEffect(() => {
    setError(null)
    setCopied(false)
    setConfirmReplace(false)
  }, [targetKey])

  const row = target?.kind === "registration" ? target.row : null
  // The freshest copy of the leader, so a link made a moment ago shows at once.
  const leader = target?.kind === "leader" ? (leaders.find((l) => l.id === target.leader.id) ?? target.leader) : null

  const makeLink = async (replace: boolean) => {
    if (!leader || busy) return
    setBusy(true)
    setError(null)
    try {
      const result = await call(`/api/admin/team-leaders/${leader.id}/guest-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replace }),
      })
      if (result) onLeaderChange(leader.id, result.guest_code)
      setConfirmReplace(false)
    } catch (linkError) {
      setError(linkError instanceof Error ? linkError.message : "We could not create the link.")
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  let body: React.ReactNode = null
  let title = ""
  let subtitle = ""

  if (row) {
    const couple = row.attendee_count === 2 ? splitCouple(row.attendees ?? "") : null
    const invitedBy = row.guest_of_team_leader_id !== null ? leaders.find((l) => l.id === row.guest_of_team_leader_id) : null
    const ownLeader = leaders.find((l) => l.email.toLowerCase() === row.email.toLowerCase())
    title = row.name
    subtitle = ownLeader ? "Team leader's own registration" : row.guest_type ? "Guest registration" : "Agent registration"
    body = (
      <>
        <section>
          <h3 className={sectionTitle}>Contact</h3>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <a href={`mailto:${row.email}`} className={`${linkClass} break-all`}>
                <Mail size={14} className="shrink-0" /> {row.email}
              </a>
            </Field>
            <Field label="Contact number">{row.contact_number || "—"}</Field>
            <Field label="WhatsApp">{row.whatsapp_number || "—"}</Field>
            <Field label="Team">{row.team}</Field>
            <Field label="Team leader">{row.team_leader_name || (row.team_leader_id === null ? "Handled by the ARES admin" : "—")}</Field>
            {row.guest_type ? (
              <Field label="Guest">
                {row.guest_type === "lr_agent" ? "Yes · an LR agent" : "Yes · not in the LR records"}
                {isAdmin ? (
                  <span className="mt-0.5 block text-xs text-[#7a6a4a]">
                    {invitedBy ? (
                      <>
                        Guest of{" "}
                        <button type="button" onClick={() => onOpen({ kind: "leader", leader: invitedBy })} className="font-semibold text-[#0078b6] hover:underline">
                          {invitedBy.name}
                        </button>{" "}
                        ({invitedBy.team})
                      </>
                    ) : (
                      "Registered through the admin's guest link"
                    )}
                  </span>
                ) : null}
              </Field>
            ) : null}
          </dl>
        </section>

        <section>
          <h3 className={sectionTitle}>Who is joining</h3>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Joining" wide>
              {row.attendee_count === 2 ? "Both · 2 people" : row.attendees ? `${row.attendees} only · 1 person` : "1 person"}
            </Field>
            <Field label={couple ? `Birth date of ${couple[0]}` : "Birth date"}>{day(row.birth_date)}</Field>
            {row.birth_date_2 ? <Field label={couple ? `Birth date of ${couple[1]}` : "Second birth date"}>{day(row.birth_date_2)}</Field> : null}
            <Field label="Polo shirt size">{poloSizesLabel(row) || "—"}</Field>
            <Field label="Registered">{dateFormat.format(new Date(row.registration_date))}</Field>
            <Field label="Formal photo" wide>
              {row.photo_count ? (
                <span className="flex flex-wrap gap-x-5 gap-y-1">
                  {Array.from({ length: row.photo_count }, (_, n) => (
                    <a key={n} href={`/api/registrations/${row.id}/photo?n=${n + 1}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      <ImageIcon size={15} className="shrink-0" /> {couple ? couple[n] : "View photo"}
                    </a>
                  ))}
                </span>
              ) : (
                "No photo"
              )}
            </Field>
          </dl>
        </section>

        <section>
          <h3 className={sectionTitle}>Payment</h3>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <StatusPill status={row.payment_status} />
            </Field>
            <Field label={row.payment_status === "unpaid" ? "To pay" : "Amount"}>
              <span className="font-bold tabular-nums text-[#2a1458]">
                {row.payment_status === "unpaid"
                  ? fee === null
                    ? "Fee not set"
                    : moneyFormat.format(fee * row.attendee_count)
                  : row.amount === null
                    ? "—"
                    : moneyFormat.format(row.amount)}
              </span>
            </Field>
            <Field label="Confirmed">{row.confirmed_at ? dateFormat.format(new Date(row.confirmed_at)) : "Not yet"}</Field>
            <Field label="Receipt from the agent">
              {row.agent_receipt_at ? (
                <>
                  <a href={`/api/registrations/${row.id}/receipt`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <Receipt size={15} className="shrink-0" /> View receipt
                  </a>
                  <span className="mt-0.5 block text-xs text-[#7a6a4a]">Sent {dateFormat.format(new Date(row.agent_receipt_at))}</span>
                  {row.agent_receipt_note ? <span className="mt-1 block whitespace-pre-wrap text-xs text-[#4a3413]">“{row.agent_receipt_note}”</span> : null}
                </>
              ) : (
                "Not sent yet"
              )}
            </Field>
          </dl>
        </section>
      </>
    )
  } else if (leader) {
    const own = registrations.find((r) => r.email.toLowerCase() === leader.email.toLowerCase()) ?? null
    const agents = registrations.filter((r) => r.team_leader_id === leader.id && r.email.toLowerCase() !== leader.email.toLowerCase())
    const guests = registrations.filter((r) => r.guest_of_team_leader_id === leader.id)
    const link = leader.guest_code ? `${origin}/guest/${leader.guest_code}` : ""
    title = leader.name
    subtitle = `Team leader · ${leader.team}`
    body = (
      <>
        <section>
          <h3 className={sectionTitle}>Contact</h3>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <a href={`mailto:${leader.email}`} className={`${linkClass} break-all`}>
                <Mail size={14} className="shrink-0" /> {leader.email}
              </a>
            </Field>
            <Field label="Contact number">
              <span className="inline-flex items-center gap-1.5">
                <Phone size={14} className="shrink-0 text-[#b8862b]" /> {leader.contact_number || "—"}
              </span>
            </Field>
            <Field label="Facebook">
              {leader.facebook_url ? (
                <a href={leader.facebook_url} target="_blank" rel="noopener noreferrer" className={`${linkClass} break-all`}>
                  <Facebook size={14} className="shrink-0" /> Open profile
                </a>
              ) : (
                "Not added yet"
              )}
            </Field>
            <Field label="Team">{leader.team}</Field>
            <Field label="Account created">{dateFormat.format(new Date(leader.created_at))}</Field>
            <Field label="Own registration">
              {own ? (
                <button type="button" onClick={() => onOpen({ kind: "registration", row: own })} className={linkClass}>
                  Attending · {own.attendee_count === 2 ? "2 people" : "1 person"}
                </button>
              ) : (
                "Not attending (no registration)"
              )}
            </Field>
          </dl>
        </section>

        {isAdmin ? (
          <section className="rounded-2xl border border-[#d4a437]/60 bg-[#fdf8ea] p-5">
            <h3 className="flex items-center gap-2 text-base font-black text-[#2a1458]">
              <Sparkles size={18} className="text-[#b8862b]" /> Guest link for {leader.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5c4a2a]">
              Give this link to {leader.name} for the guests they want to bring. Anyone who registers through it is recorded as
              their guest, so you know who invited them. Guests still pay you unless you put them on a team in the Guests page.
            </p>
            {error ? (
              <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
                <TriangleAlert size={18} className="mt-0.5 shrink-0" /> {error}
              </p>
            ) : null}
            {leader.guest_code ? (
              <>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <p className="min-w-0 flex-1 break-all rounded-xl border border-[#e3d3a8] bg-white px-4 py-3 text-sm font-semibold text-[#2a1458]">
                    <Link2 size={15} className="mr-2 inline text-[#b8862b]" />
                    {link}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyLink(link)}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] px-4 text-sm font-bold text-[#2a1408] hover:brightness-105"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy link"}
                  </button>
                </div>
                {confirmReplace ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-[#9a1c15]">The current link will stop working. Guests already registered are kept.</span>
                    <button type="button" onClick={() => makeLink(true)} disabled={busy} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#b3261e] px-3 text-xs font-bold text-white hover:bg-[#9a1c15] disabled:opacity-60">
                      {busy ? <Loader2 size={14} className="animate-spin" /> : null} Yes, replace it
                    </button>
                    <button type="button" onClick={() => setConfirmReplace(false)} disabled={busy} className="h-9 rounded-lg border border-[#e3d3a8] bg-white px-3 text-xs font-bold text-[#6b4a12]">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmReplace(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6b4a12] underline-offset-2 hover:underline">
                    <RefreshCw size={14} /> Replace with a new link
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => makeLink(false)}
                disabled={busy}
                className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] px-5 text-sm font-bold text-[#2a1408] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />} Create guest link
              </button>
            )}
            <h4 className="mt-5 text-sm font-bold text-[#2a1458]">
              Guests of {leader.name} <span className="font-normal text-[#7a6a4a]">({guests.length.toLocaleString()})</span>
            </h4>
            <PeopleList people={guests} empty="No guest has registered through this link yet." onOpen={(person) => onOpen({ kind: "registration", row: person })} />
          </section>
        ) : null}

        <section>
          <h3 className={sectionTitle}>
            Agents of this team leader <span className="tracking-normal text-[#7a6a4a]">({agents.length.toLocaleString()})</span>
          </h3>
          <PeopleList people={agents} empty="No agent of this team leader has registered yet." onOpen={(person) => onOpen({ kind: "registration", row: person })} />
        </section>
      </>
    )
  }

  return (
    <Dialog open={target !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl border-[#d4a437]/60 bg-[#fffdf7] font-sans text-[#2a1a3d] sm:rounded-2xl">
        <DialogHeader className="text-left">
          <DialogDescription className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b8862b]">{subtitle}</DialogDescription>
          <DialogTitle className="break-words text-2xl font-black text-[#2a1458]">{title}</DialogTitle>
          <GoldRule className="mt-2 w-40" />
        </DialogHeader>
        <div className="space-y-6">{body}</div>
      </DialogContent>
    </Dialog>
  )
}
