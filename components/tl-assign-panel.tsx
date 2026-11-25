"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Check, Loader2, Search, Trash2, TriangleAlert, UserCog, UserPlus, Users } from "lucide-react"
import { DIRECT_TEAMS, isSameTeam } from "@/lib/direct-teams"
import type { TeamLeader } from "@/lib/registrations"

// Admin: the teams that have no team leader in the LR records each get a card. On a card the
// admin finds one of that team's agents and makes them its team leader. One per team.

type Candidate = { name: string; email: string; team: string; lr_team_leader: string }
type Assignment = { id: number; name: string; email: string; team: string; assigned_at: string }
type Found = { agent: Candidate; blocked: string | null }
/** The dashboard's request helper: null when the session ended, throws with the reason on failure. */
type Call = (url: string, init?: RequestInit) => Promise<Record<string, any> | null>

const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" })
const fieldClass =
  "h-11 w-full rounded-xl border border-[#e3d3a8] bg-white pl-10 pr-3 text-sm text-[#2a1a3d] outline-none transition-all placeholder:text-[#a89a7c] focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)]"
const goldButton =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] px-4 py-2 text-sm font-bold text-[#2a1408] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
const darkButton =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#2a1458] bg-[#2a1458] px-4 text-sm font-bold text-[#fbe7a1] transition-colors hover:bg-[#1a0d3d] disabled:cursor-not-allowed disabled:opacity-50"
const errorClass = "flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-3 py-2.5 text-sm font-medium text-[#9a1c15]"

/** One team: its assigned team leader, or a search box to choose one from that team's agents. */
function TeamCard({
  team,
  assignment,
  signedUp,
  call,
  onAssigned,
  onRemoved,
}: {
  team: string
  assignment: Assignment | null
  /** True once the assigned agent has registered as a team leader. */
  signedUp: boolean
  call: Call
  onAssigned: (assignment: Assignment) => void
  onRemoved: (id: number) => void
}) {
  const [email, setEmail] = useState("")
  const [found, setFound] = useState<Found | null>(null)
  const [busy, setBusy] = useState<"search" | "assign" | "remove" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const fieldId = `assign-${team.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

  const act = async (kind: "search" | "assign" | "remove", fallback: string, task: () => Promise<void>) => {
    if (busy) return
    setBusy(kind)
    setError(null)
    try {
      await task()
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : fallback)
    } finally {
      setBusy(null)
    }
  }
  const send = (url: string) =>
    call(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), team }) })

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    setFound(null)
    act("search", "We could not look up this agent.", async () => {
      const result = await send("/api/admin/tl-assignments/lookup")
      if (result) setFound({ agent: result.agent, blocked: result.blocked })
    })
  }
  const assign = () =>
    act("assign", "We could not assign this team leader.", async () => {
      const result = await send("/api/admin/tl-assignments")
      if (!result) return
      setFound(null)
      setEmail("")
      onAssigned(result.assignment)
    })
  const remove = () =>
    act("remove", "Could not remove this team leader.", async () => {
      if (!assignment) return
      const result = await call(`/api/admin/tl-assignments/${assignment.id}`, { method: "DELETE" })
      setConfirmRemove(false)
      if (result) onRemoved(assignment.id)
    })

  return (
    <section className="flex flex-col rounded-2xl border border-[#d4a437]/50 bg-white shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)]">
      <header className="flex items-center justify-between gap-3 rounded-t-2xl bg-gradient-to-r from-[#2a1458] to-[#1a0d3d] px-5 py-4">
        <h3 className="flex min-w-0 items-center gap-2 text-lg font-black text-[#fbe7a1]">
          <Users size={18} className="shrink-0 text-[#f0c24b]" /> <span className="break-words">{team}</span>
        </h3>
        <span
          className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
            assignment ? "border-green-300 bg-green-50 text-green-800" : "border-[#f0c24b]/60 bg-[#d4a437]/15 text-[#fbe7a1]"
          }`}
        >
          {assignment ? "Team leader assigned" : "No team leader yet"}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {assignment ? (
          <>
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fdf3d7] text-[#b8862b]">
                <UserCog size={20} />
              </span>
              <div className="min-w-0">
                <p className="break-words text-base font-bold text-[#2a1458]">{assignment.name}</p>
                <a href={`mailto:${assignment.email}`} className="break-all text-sm text-[#0078b6] hover:underline">
                  {assignment.email}
                </a>
                <p className="mt-1 text-xs text-[#7a6a4a]">Assigned {dateFormat.format(new Date(assignment.assigned_at))}</p>
              </div>
            </div>
            <p
              className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                signedUp ? "border-green-200 bg-green-50 text-green-800" : "border-[#e3d3a8] bg-[#fdf3d7] text-[#6b4a12]"
              }`}
            >
              {signedUp ? (
                <>
                  <Check size={16} strokeWidth={3} className="mt-0.5 shrink-0" /> Registered. The agents of {team} can now register
                  under them.
                </>
              ) : (
                <>Not registered yet. Send them the team leader registration link so their agents can register.</>
              )}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-2">
              {confirmRemove ? (
                <>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={busy !== null}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#b3261e] bg-[#b3261e] px-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {busy === "remove" ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />} Yes, remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(false)}
                    disabled={busy !== null}
                    className="inline-flex h-10 items-center rounded-lg border border-[#e3d3a8] bg-white px-3 text-sm font-semibold text-[#6b4a12]"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRemove(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#e3d3a8] bg-white px-3 text-sm font-semibold text-[#6b4a12] transition-colors hover:border-[#b3261e]/40 hover:bg-[#b3261e]/5 hover:text-[#b3261e]"
                >
                  <Trash2 size={15} /> Remove and choose someone else
                </button>
              )}
            </div>
            {signedUp && confirmRemove ? (
              <p className="text-xs text-[#7a6a4a]">
                This does not delete their team leader account. Delete that from the Team leaders list as well.
              </p>
            ) : null}
          </>
        ) : (
          <>
            <form onSubmit={search}>
              <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-[#4a3413]">
                Search an agent of {team}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
                  <input
                    id={fieldId}
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setFound(null)
                      setError(null)
                    }}
                    placeholder="Agent's LR email address"
                    className={fieldClass}
                  />
                </div>
                <button type="submit" disabled={busy !== null} className={darkButton}>
                  {busy === "search" ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
                </button>
              </div>
            </form>

            {found ? (
              <div className="rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] p-4">
                <p className="break-words text-base font-bold text-[#2a1458]">{found.agent.name}</p>
                <p className="break-all text-sm text-[#5c4a2a]">{found.agent.email}</p>
                <p className="mt-1 text-sm text-[#5c4a2a]">
                  Team: <span className="font-semibold text-[#2a1458]">{found.agent.team}</span>
                </p>
                {found.blocked ? (
                  <p role="alert" className={`mt-3 ${errorClass}`}>
                    <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {found.blocked}
                  </p>
                ) : (
                  <button type="button" onClick={assign} disabled={busy !== null} className={`mt-3 ${goldButton}`}>
                    {busy === "assign" ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Make team leader of {team}
                  </button>
                )}
              </div>
            ) : null}
          </>
        )}

        {error ? (
          <p role="alert" className={errorClass}>
            <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}

export default function TlAssignPanel({
  leaders,
  call,
  onOpenSettings,
}: {
  /** Team leaders who have registered, to show which chosen agents have signed up. */
  leaders: TeamLeader[]
  call: Call
  onOpenSettings: () => void
}) {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = async () => {
    setLoadError(null)
    try {
      const result = await call("/api/admin/tl-assignments", { cache: "no-store" })
      if (result) setAssignments(result.assignments)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load the assigned team leaders.")
    }
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const registered = new Set(leaders.map((leader) => leader.email.toLowerCase()))
  // The four direct teams, then any other team that was given a team leader.
  const others = (assignments ?? []).filter((a) => !DIRECT_TEAMS.some((team) => isSameTeam(a.team, team)))
  const cards = [
    ...DIRECT_TEAMS.map((team) => ({ team, assignment: (assignments ?? []).find((a) => isSameTeam(a.team, team)) ?? null })),
    ...others.map((assignment) => ({ team: assignment.team, assignment })),
  ]

  return (
    <div className="mt-4">
      <div className="rounded-2xl border border-[#e3d3a8] bg-[#fdf3d7] px-5 py-4 text-sm leading-relaxed text-[#4a3413]">
        <p>
          <span className="font-semibold">These teams have no team leader in the LR records.</span> In each box, search one of
          that team&apos;s agents by their LR email and make them the team leader. Each team can have only one.
        </p>
        <p className="mt-1">
          Then send them the team leader registration link from{" "}
          <button type="button" onClick={onOpenSettings} className="font-semibold text-[#6b4a12] underline underline-offset-2">
            Settings
          </button>
          . Their agents can register once they have signed up.
        </p>
      </div>

      {loadError ? (
        <div role="alert" className={`mt-4 items-center justify-between ${errorClass}`}>
          <span className="flex items-start gap-2">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {loadError}
          </span>
          <button type="button" onClick={load} className="shrink-0 font-semibold underline underline-offset-2">
            Try again
          </button>
        </div>
      ) : assignments === null ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-[#7a6a4a]">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {cards.map(({ team, assignment }) => (
            <TeamCard
              key={team}
              team={team}
              assignment={assignment}
              signedUp={Boolean(assignment && registered.has(assignment.email.toLowerCase()))}
              call={call}
              onAssigned={(added) => setAssignments((all) => [added, ...(all ?? [])])}
              onRemoved={(id) => setAssignments((all) => (all ?? []).filter((a) => a.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
