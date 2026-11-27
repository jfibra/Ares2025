"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BadgeCheck, Clock, Contact, Info, LogOut, RefreshCw, Ticket, Users } from "lucide-react"
import AdminManagedAgents from "@/components/admin-managed-agents"
import AdminTeamHandlerForm, { type TeamHandler } from "@/components/admin-team-handler-form"
import { GoldRule, Lotus, brownLattice, goldLattice, goldText } from "@/components/thai-ornaments"
import type { Registration, TlPaymentAccount } from "@/lib/registrations"

// The dashboard of an admin-handled team's account (a secretary). It works like a team
// leader's: agents waiting to pay, agents confirmed, and the contact details the agents are
// shown. The agents pay into the admin's accounts, which are shown here read only.

const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
const moneyFormat = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })
const panel = "rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8"

type Data = { registrations: Registration[]; handler: TeamHandler | null; fee: number | null; accounts: TlPaymentAccount[] }

export default function TeamPortal({ teamName, userLabel, initial }: { teamName: string; userLabel: string; initial: Data | null }) {
  const router = useRouter()
  const [rows, setRows] = useState(initial?.registrations ?? [])
  const [handler, setHandler] = useState(initial?.handler ?? null)
  const [fee, setFee] = useState(initial?.fee ?? null)
  const [accounts, setAccounts] = useState(initial?.accounts ?? [])
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<"pending" | "confirmed" | "details">("pending")
  const [error, setError] = useState<string | null>(initial ? null : "We could not load the registrations. Press Refresh to try again.")

  /** Runs a request; sends the visitor back to sign-in if the session has ended. */
  const call = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, init)
    if (response.status === 401) {
      router.replace("/admin/login")
      return null
    }
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.success) throw new Error(result?.message || "Something went wrong.")
    return result
  }

  const refresh = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const result = await call("/api/team/registrations", { cache: "no-store" })
      if (result) {
        setRows(result.registrations)
        setHandler(result.handler)
        setFee(result.fee)
        setAccounts(result.accounts)
      }
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not refresh.")
    } finally {
      setRefreshing(false)
    }
  }

  const setConfirmed = async (row: Registration, received: boolean) => {
    setBusyKey(`registration-${row.id}`)
    setError(null)
    try {
      const result = await call(`/api/team/registrations/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed_by_tl: received }),
      })
      if (result) setRows((all) => all.map((r) => (r.id === row.id ? { ...r, ...result.registration } : r)))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update the payment.")
    } finally {
      setBusyKey(null)
    }
  }

  const saveHandler = async (next: { name: string; contact_number: string; facebook_url: string }) => {
    const result = await call("/api/team/handler", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) })
    if (result) setHandler(result.handler)
  }

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
    router.replace("/admin/login")
    router.refresh()
  }

  const people = (list: Registration[]) => list.reduce((total, r) => total + (r.attendee_count || 1), 0)
  const unpaid = rows.filter((r) => r.payment_status === "unpaid")
  const paid = rows.filter((r) => r.payment_status !== "unpaid")
  const stats = [
    { label: "Agents registered", icon: Users, value: rows.length.toLocaleString(), hint: `${people(rows).toLocaleString()} people` },
    { label: "Not paid yet", icon: Clock, value: unpaid.length.toLocaleString(), hint: fee === null ? "Fee not set" : `${moneyFormat.format(fee * people(unpaid))} still owed` },
    { label: "Paid", icon: BadgeCheck, value: paid.length.toLocaleString(), hint: moneyFormat.format(paid.reduce((total, r) => total + Number(r.amount ?? 0), 0)) },
    { label: "Fee per person", icon: Ticket, value: fee === null ? "—" : moneyFormat.format(fee), hint: "A couple both joining pays double" },
  ]

  return (
    <div className="relative min-h-screen bg-[#fbf5e6] font-sans text-[#2a1a3d]">
      <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: brownLattice }} />

      <header className="relative overflow-hidden border-b-2 border-[#d4a437] bg-gradient-to-r from-[#2a1458] via-[#1a0d3d] to-[#3a0d2a] pb-24 text-white">
        <div aria-hidden className="absolute inset-0 opacity-[0.13]" style={{ backgroundImage: goldLattice }} />
        <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="ARES 2027 home" className="flex items-center">
            <img src={LOGO_URL} alt="Asian Real Estate Summit" className="h-10 w-auto sm:h-11" />
            <span className="ml-3 border-l border-white/40 pl-3 text-xl font-black leading-none tracking-tight sm:text-2xl">2027</span>
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
        <div className="relative mx-auto mt-6 flex max-w-[1400px] items-end gap-5 px-4 sm:px-6">
          <Lotus bloom className="hidden h-14 w-24 shrink-0 text-[#f0c24b] sm:block" />
          <div>
            <p lang="th" className="text-base font-medium text-[#f3d27a]">
              การลงทะเบียน
            </p>
            <h1 className={`pb-1 text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl ${goldText}`}>{teamName}</h1>
          </div>
        </div>
      </header>

      <main className="relative mx-auto -mt-16 max-w-[1400px] px-4 pb-12 sm:px-6">
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[#d4a437]/50 bg-white p-4 shadow-[0_18px_40px_-24px_rgba(58,13,42,0.5)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6a4a]">{stat.label}</dt>
                <span className="grid h-9 w-9 shrink-0 rotate-45 place-items-center border border-[#d4a437] bg-[#fdf3d7] text-[#b8862b]">
                  <stat.icon size={16} className="-rotate-45" />
                </span>
              </div>
              <dd className="mt-2 text-2xl font-black tabular-nums text-[#2a1458] sm:text-3xl">{stat.value}</dd>
              <p className="mt-1 text-xs text-[#7a6a4a]">{stat.hint}</p>
            </div>
          ))}
        </dl>

        {error ? (
          <p role="alert" className="mt-4 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
            {error}
          </p>
        ) : null}

        {/* Like a team leader, they say how agents can reach them before using the dashboard: this cannot be closed. */}
        {initial && !handler ? (
          <div role="dialog" aria-modal="true" aria-labelledby="contact-first-title" className="fixed inset-0 z-[100] overflow-y-auto bg-[#120a2e]/80 px-4 py-8 backdrop-blur-sm">
            <div className="mx-auto max-w-2xl rounded-2xl border border-[#d4a437]/60 bg-[#fffdf7] p-6 shadow-2xl sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">First step</p>
              <h2 id="contact-first-title" className="mt-2 text-2xl font-black text-[#2a1458]">
                Add your contact details
              </h2>
              <p className="mt-2 text-[#5c4a2a]">
                The agents of {teamName} see this name, number and Facebook link after they register, so they know who to pay
                and ask. You can change it later under &quot;My details&quot;.
              </p>
              <div className="mt-6">
                <AdminTeamHandlerForm handler={null} onSave={saveHandler} />
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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Lists" className="flex gap-2 overflow-x-auto pb-1">
            {(
              [
                { id: "pending", label: "Pending", count: unpaid.length, icon: Clock },
                { id: "confirmed", label: "Confirmed", count: paid.length, icon: BadgeCheck },
                { id: "details", label: "My details", count: undefined, icon: Contact },
              ] as const
            ).map((item) => {
              const active = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                    active ? "border-[#2a1458] bg-[#2a1458] text-[#fbe7a1]" : "border-[#e3d3a8] bg-white text-[#6b4a12] hover:border-[#c9972f] hover:bg-[#fdf3d7]"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                  {item.count !== undefined ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${active ? "bg-[#f3d27a] text-[#2a1408]" : "bg-[#f1e6c8] text-[#6b4a12]"}`}>
                      {item.count.toLocaleString()}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e3d3a8] bg-white px-4 text-sm font-semibold text-[#6b4a12] transition-colors hover:border-[#c9972f] hover:bg-[#fdf3d7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {tab === "details" ? (
          <>
        <div className="mt-4 grid gap-6 lg:grid-cols-5">
          <section className={`${panel} lg:col-span-3`}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Shown to the agents</p>
            <h2 className="mt-2 text-2xl font-black text-[#2a1458]">Your contact details</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-[#5c4a2a]">
              After registering, the agents of {teamName} are told to pay this person and can reach them by number or Facebook.{" "}
              {handler ? null : <span className="font-semibold text-[#2a1458]">Please fill this in first: until you do, they are told to pay the ARES admin.</span>}
            </p>
            <div className="mt-6">
              <AdminTeamHandlerForm handler={handler} onSave={saveHandler} />
            </div>
          </section>

          <section className={`${panel} lg:col-span-2`}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Set by the admin</p>
            <h2 className="mt-2 text-2xl font-black text-[#2a1458]">Where the agents pay</h2>
            <p className="mt-3 leading-relaxed text-[#5c4a2a]">The agents are shown these accounts. Only the admin can change them.</p>
            {accounts.length === 0 ? (
              <p className="mt-5 flex items-start gap-2 rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] px-4 py-3 text-sm text-[#4a3413]">
                <Info size={18} className="mt-0.5 shrink-0 text-[#b8862b]" /> The admin has not added payment details yet.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {accounts.map((account) => (
                  <li key={account.id} className="rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] px-4 py-3">
                    <p className="break-words font-black text-[#2a1458]">{account.bank}</p>
                    {account.account_number ? (
                      <p className="mt-1 break-words text-sm text-[#4a3413]">
                        {account.account_name || "—"} · <span className="font-bold tabular-nums text-[#2a1458]">{account.account_number}</span>
                      </p>
                    ) : null}
                    {account.qr_url ? (
                      <a href={account.qr_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-[#0078b6] hover:underline">
                        View QR code
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

          </>
        ) : (
          <div className="-mt-4">
            <AdminManagedAgents
              variant="secretary"
              title={tab === "pending" ? "Agents waiting to pay" : "Agents confirmed"}
              emptyText={tab === "pending" ? "No agent is waiting to pay." : "No agent has been confirmed yet."}
              agents={tab === "pending" ? unpaid : paid}
              fee={fee}
              busyKey={busyKey}
              onConfirm={setConfirmed}
            />
          </div>
        )}

        <GoldRule className="mx-auto mt-10 max-w-xs" />
      </main>
    </div>
  )
}
