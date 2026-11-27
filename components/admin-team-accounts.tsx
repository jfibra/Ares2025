"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { KeyRound, Loader2, Mail, Trash2, TriangleAlert, UserPlus, Users } from "lucide-react"

// Admin, on the Team accounts page: the sign-ins handed to the secretaries, one team each. The admin chooses
// the email and password and gives them to the person; the password is never shown again.

export type TeamAccount = { email: string; team: string; created_at: string }
type Call = (url: string, init?: RequestInit) => Promise<Record<string, any> | null>

const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" })
const inputClass =
  "h-12 w-full rounded-xl border border-[#e3d3a8] bg-white pl-11 pr-4 text-base text-[#2a1a3d] outline-none placeholder:text-[#a89a7c] transition-all focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)]"
const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"
const iconClass = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]"

export default function AdminTeamAccounts({
  initial,
  teams,
  call,
  signInPath,
}: {
  initial: TeamAccount[]
  /** The teams an account can be for. */
  teams: readonly string[]
  /** The dashboard's request helper: null when the session ended, throws with the reason on failure. */
  call: Call
  /** Where the secretaries sign in, shown so the admin can pass it on. */
  signInPath: string
}) {
  const [accounts, setAccounts] = useState(initial)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [team, setTeam] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  // The full link, known only in the browser.
  const [signInUrl, setSignInUrl] = useState(signInPath)
  useEffect(() => setSignInUrl(`${window.location.origin}${signInPath}`), [signInPath])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (!team) return setError("Choose which team this account is for.")
    if (password.length < 8) return setError("The password must be at least 8 characters.")
    setBusy("create")
    setError(null)
    setCreated(null)
    try {
      const result = await call("/api/admin/team-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, team }),
      })
      if (result) {
        setAccounts(result.accounts)
        setCreated(email.trim().toLowerCase())
        setEmail("")
        setPassword("")
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "We could not create this account.")
    } finally {
      setBusy(null)
    }
  }

  const remove = async (target: string) => {
    setBusy(target)
    setError(null)
    try {
      const result = await call(`/api/admin/team-accounts?email=${encodeURIComponent(target)}`, { method: "DELETE" })
      if (result) setAccounts(result.accounts)
      setConfirmRemove(null)
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "We could not remove this account.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      {accounts.length === 0 ? (
        <p className="rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] px-4 py-3 text-sm text-[#4a3413]">No account yet. Create one below and give the email and password to your secretary.</p>
      ) : (
        <ul className="divide-y divide-[#f1e6c8] overflow-hidden rounded-xl border border-[#e3d3a8]">
          {accounts.map((account) => (
            <li key={account.email} className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="break-all font-semibold text-[#2a1458]">{account.email}</p>
                <p className="text-xs text-[#7a6a4a]">
                  <span className="font-semibold text-[#6b4a12]">{account.team}</span> · Created {dateFormat.format(new Date(account.created_at))}
                </p>
              </div>
              {confirmRemove === account.email ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#9a1c15]">Remove this account?</span>
                  <button
                    type="button"
                    onClick={() => remove(account.email)}
                    disabled={busy !== null}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#b3261e] px-3 text-xs font-bold text-white hover:bg-[#9a1c15] disabled:opacity-60"
                  >
                    {busy === account.email ? <Loader2 size={14} className="animate-spin" /> : null} Yes, remove
                  </button>
                  <button type="button" onClick={() => setConfirmRemove(null)} disabled={busy !== null} className="h-9 rounded-lg border border-[#e3d3a8] bg-white px-3 text-xs font-bold text-[#6b4a12]">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRemove(account.email)}
                  aria-label={`Remove ${account.email}`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#e3d3a8] bg-white text-[#7a6a4a] transition-colors hover:border-[#b3261e]/40 hover:bg-[#b3261e]/5 hover:text-[#b3261e]"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {created ? (
        <p role="status" className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          Account created for {created}. Give them this email, the password you typed, and the sign-in link:{" "}
          <span className="break-all font-bold">{signInUrl}</span>
        </p>
      ) : null}

      <form onSubmit={create} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="team-account-team" className={labelClass}>
            Team this account is for
          </label>
          <div className="relative">
            <Users size={18} className={iconClass} />
            <select
              id="team-account-team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              required
              className={`${inputClass} ${team ? "font-semibold text-[#2a1458]" : "text-[#a89a7c]"}`}
            >
              <option value="" disabled>
                Choose a team
              </option>
              {teams.map((name) => (
                <option key={name} value={name} className="text-[#2a1a3d]">
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="team-account-email" className={labelClass}>
            Email for the new account
          </label>
          <div className="relative">
            <Mail size={18} className={iconClass} />
            <input id="team-account-email" type="email" inputMode="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={320} placeholder="secretary@example.com" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="team-account-password" className={labelClass}>
            Password you will give them
          </label>
          <div className="relative">
            <KeyRound size={18} className={iconClass} />
            <input id="team-account-password" type="text" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} placeholder="At least 8 characters" className={inputClass} />
          </div>
        </div>
        {error ? (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15] sm:col-span-2">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" />
            {error}
          </p>
        ) : null}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy !== null}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] px-5 text-sm font-bold text-[#2a1408] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "create" ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Create account
          </button>
        </div>
      </form>
    </div>
  )
}
