"use client"

import { useMemo } from "react"
import { Building2, Shirt, Sparkles, Ticket, UserCog, Users } from "lucide-react"
import { CornerFlourish, GoldRule, Lotus, goldLattice, goldText } from "@/components/thai-ornaments"
import { POLO_SHIRT_SIZES, type Registration, type TeamLeader, type TlDecline } from "@/lib/registrations"

// Admin, on the Overview tab: who has registered, counted so that team leaders and agents are
// never mixed up. A "registration" is one record; a couple who are both joining is one
// registration but two people, and each person takes a slot.

const moneyFormat = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })
const teamKey = (team: string) => team.trim().toLowerCase().replace(/\s+/g, " ")
const people = (list: Registration[]) => list.reduce((total, r) => total + (r.attendee_count || 1), 0)
const count = (value: number) => value.toLocaleString()

type TeamRow = {
  team: string
  leader: string | null
  leaderPeople: number
  agents: number
  agentPeople: number
  paid: number
  unpaid: number
}

export default function AdminOverview({
  registrations,
  leaders,
  declines,
  slotLimit,
  fee,
}: {
  registrations: Registration[]
  leaders: TeamLeader[]
  declines: TlDecline[]
  slotLimit: number
  fee: number | null
}) {
  const stats = useMemo(() => {
    const leaderEmails = new Set(leaders.map((leader) => leader.email.toLowerCase()))
    const leaderRows = registrations.filter((r) => leaderEmails.has(r.email.toLowerCase()))
    const guestRows = registrations.filter((r) => r.guest_type && !leaderEmails.has(r.email.toLowerCase()))
    const agentRows = registrations.filter((r) => !r.guest_type && !leaderEmails.has(r.email.toLowerCase()))
    const attendingLeaders = new Set(leaderRows.map((r) => r.email.toLowerCase())).size

    // One line per team: its leader (when registered) and its agents.
    const teams = new Map<string, TeamRow>()
    const teamOf = (name: string) => {
      const key = teamKey(name)
      let row = teams.get(key)
      if (!row) {
        row = { team: name, leader: null, leaderPeople: 0, agents: 0, agentPeople: 0, paid: 0, unpaid: 0 }
        teams.set(key, row)
      }
      return row
    }
    for (const leader of leaders) teamOf(leader.team).leader = leader.name
    for (const r of registrations) {
      // A guest who was not put on a team belongs to no team.
      if (r.guest_type && r.team_leader_id === null) continue
      const row = teamOf(r.team)
      const size = r.attendee_count || 1
      if (leaderEmails.has(r.email.toLowerCase())) row.leaderPeople += size
      else {
        row.agents += 1
        row.agentPeople += size
      }
      if (r.payment_status === "unpaid") row.unpaid += size
      else row.paid += size
    }
    const teamRows = [...teams.values()].sort(
      (a, b) => b.leaderPeople + b.agentPeople - (a.leaderPeople + a.agentPeople) || a.team.localeCompare(b.team),
    )

    const unpaidRows = registrations.filter((r) => r.payment_status === "unpaid")
    const withLeaderRows = registrations.filter((r) => r.payment_status === "paid_to_tl")
    const sentRows = registrations.filter((r) => r.payment_status === "remitted")
    const verifiedRows = registrations.filter((r) => r.payment_status === "verified")
    return {
      leaderRows,
      agentRows,
      guestRows,
      attendingLeaders,
      teamRows,
      totalPeople: people(registrations),
      payment: [
        { label: "Not paid yet", rows: unpaidRows, amount: fee === null ? null : fee * people(unpaidRows), note: "still owed" },
        { label: "Paid to team leader", rows: withLeaderRows, amount: sum(withLeaderRows), note: "not yet sent to you" },
        { label: "Sent to admin", rows: sentRows, amount: sum(sentRows), note: "waiting for you to check" },
        { label: "Fully paid", rows: verifiedRows, amount: sum(verifiedRows), note: "received by you" },
      ],
    }
  }, [registrations, leaders, fee])

  const notAttending = leaders.length - stats.attendingLeaders
  const slotsLeft = Math.max(0, slotLimit - stats.totalPeople)
  const tiles = [
    {
      icon: Ticket,
      label: "Total registrants",
      value: stats.totalPeople,
      lines: [`${count(registrations.length)} registrations`, `${count(stats.totalPeople)} of ${count(slotLimit)} slots taken · ${count(slotsLeft)} left`],
    },
    {
      icon: UserCog,
      label: "Team leaders",
      value: leaders.length,
      lines: [
        `${count(stats.attendingLeaders)} attending (${count(people(stats.leaderRows))} people)`,
        `${count(notAttending)} with an account but not attending`,
      ],
    },
    {
      icon: Users,
      label: "Agents",
      value: stats.agentRows.length,
      lines: [`${count(people(stats.agentRows))} people`, "Team leaders are not counted here"],
    },
    {
      icon: Building2,
      label: "Teams",
      value: stats.teamRows.length,
      lines: [`${count(stats.teamRows.filter((team) => team.leader).length)} with a registered team leader`],
    },
    {
      icon: Sparkles,
      label: "Guests",
      value: stats.guestRows.length,
      lines: [`${count(people(stats.guestRows))} people`],
    },
  ]

  const cell = "px-4 py-3.5"

  // The same color always means the same group, in the bars, the donut and the legend.
  const groups = [
    { key: "leaders", label: "Team leaders", color: "#6a4ce2", value: people(stats.leaderRows) },
    { key: "agents", label: "Agents", color: "#d99a1b", value: people(stats.agentRows) },
    { key: "guests", label: "Guests", color: "#c2417a", value: people(stats.guestRows) },
  ]
  const share = (value: number) => (stats.totalPeople ? Math.round((value / stats.totalPeople) * 100) : 0)

  // Donut: one arc per group, with a small gap between arcs.
  const radius = 54
  const around = 2 * Math.PI * radius
  const gap = groups.filter((group) => group.value > 0).length > 1 ? 3 : 0
  let turned = 0
  const arcs = groups
    .filter((group) => group.value > 0)
    .map((group) => {
      const length = (group.value / stats.totalPeople) * around
      const arc = { ...group, dash: Math.max(length - gap, 0.5), offset: -turned }
      turned += length
      return arc
    })

  // Bars: the biggest teams first; the rest stay in the table below.
  const chartTeams = stats.teamRows.filter((team) => team.leaderPeople + team.agentPeople > 0).slice(0, 8)
  const longest = Math.max(1, ...chartTeams.map((team) => team.leaderPeople + team.agentPeople))

  // The site's own surfaces: deep purple, maroon, bronze and gold, each with the gold lattice.
  // Polo shirts: one for each person joining, in the size they chose.
  const shirtsBySize = POLO_SHIRT_SIZES.map((size) => ({
    size,
    count: registrations.reduce((total, r) => total + (r.polo_shirt_size === size ? 1 : 0) + (r.polo_shirt_size_2 === size ? 1 : 0), 0),
  }))
  const totalShirts = shirtsBySize.reduce((total, item) => total + item.count, 0)
  const mostShirts = Math.max(1, ...shirtsBySize.map((item) => item.count))
  const missingShirts = stats.totalPeople - totalShirts

  const heroCards = [
    { ...tiles[0], card: "from-[#2a1458] via-[#1a0d3d] to-[#3a1f74]", dark: true },
    { ...tiles[1], card: "from-[#3a0d2a] via-[#5a1540] to-[#7a1f52]", dark: true },
    { ...tiles[2], card: "from-[#3d2a0c] via-[#5c4012] to-[#7a5617]", dark: true },
    { ...tiles[3], card: "from-[#f6dc8f] via-[#e9bf55] to-[#c9972f]", dark: false },
  ]
  const panel = "relative rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-7"
  const heading = "text-xl font-black text-[#2a1458]"

  return (
    <div className="space-y-6">
      <section aria-label="Totals">
        <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {heroCards.map((tile) => (
            <div
              key={tile.label}
              className={`relative overflow-hidden rounded-2xl border border-[#d4a437]/70 bg-gradient-to-br p-6 shadow-[0_24px_50px_-28px_rgba(42,20,88,0.85)] sm:p-7 ${tile.card} ${
                tile.dark ? "text-white" : "text-[#2a1408]"
              }`}
            >
              <div aria-hidden className={`absolute inset-0 ${tile.dark ? "opacity-[0.14]" : "opacity-[0.22]"}`} style={{ backgroundImage: goldLattice }} />
              <Lotus className={`pointer-events-none absolute -bottom-3 -right-3 h-24 w-36 ${tile.dark ? "text-[#f0c24b]/20" : "text-[#2a1408]/15"}`} />
              <CornerFlourish className={`absolute right-3 top-3 h-7 w-7 ${tile.dark ? "text-[#f0c24b]/70" : "text-[#6b4a12]/60"}`} />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <tile.icon size={18} className={tile.dark ? "text-[#f3d27a]" : "text-[#4a3413]"} />
                  <dt className="text-sm font-semibold uppercase tracking-[0.18em]">{tile.label}</dt>
                </div>
                <dd className={`mt-3 pb-1 text-6xl font-black leading-none tabular-nums ${tile.dark ? goldText : "text-[#2a1458]"}`}>{count(tile.value)}</dd>
                <div className="mt-3 min-h-[2.5rem]">
                  {tile.lines.map((line) => (
                    <p key={line} className={`text-sm leading-snug ${tile.dark ? "text-white/85" : "text-[#3d2a0c]"}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-[#5c4a2a]">
          <span className="font-semibold text-[#2a1458]">How the total adds up:</span> {count(people(stats.leaderRows))} from team leaders +{" "}
          {count(people(stats.agentRows))} from agents + {count(people(stats.guestRows))} from guests ={" "}
          <span className="font-bold text-[#2a1458]">{count(stats.totalPeople)} people</span>. A couple who are both joining is one
          registration but two people.
          {declines.length ? ` ${count(declines.length)} team leader${declines.length === 1 ? "" : "s"} said they cannot attend.` : ""}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section aria-labelledby="overview-by-team-chart" className={`${panel} xl:col-span-2`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="overview-by-team-chart" className={heading}>
              People registered by team
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5c4a2a]">
              {groups.slice(0, 2).map((group) => (
                <li key={group.key} className="flex items-center gap-1.5">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                  {group.label}
                </li>
              ))}
            </ul>
          </div>
          <GoldRule className="mt-3 w-40" />
          {chartTeams.length === 0 ? (
            <p className="py-14 text-center text-sm text-[#7a6a4a]">No team has anyone registered yet.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {chartTeams.map((team) => {
                const total = team.leaderPeople + team.agentPeople
                return (
                  <li key={team.team} className="grid grid-cols-[minmax(0,11rem)_1fr_2.5rem] items-center gap-3 sm:grid-cols-[minmax(0,15rem)_1fr_2.5rem]">
                    <span className="truncate text-sm text-[#2a1458]" title={team.team}>
                      {team.team}
                    </span>
                    <span className="flex h-4 items-stretch gap-[2px]">
                      {team.leaderPeople ? (
                        <span
                          title={`${team.team}: ${count(team.leaderPeople)} from the team leader`}
                          className={`min-w-[4px] ${team.agentPeople ? "" : "rounded-r"}`}
                          style={{ width: `${(team.leaderPeople / longest) * 100}%`, backgroundColor: groups[0].color }}
                        />
                      ) : null}
                      {team.agentPeople ? (
                        <span
                          title={`${team.team}: ${count(team.agentPeople)} from agents`}
                          className="min-w-[4px] rounded-r"
                          style={{ width: `${(team.agentPeople / longest) * 100}%`, backgroundColor: groups[1].color }}
                        />
                      ) : null}
                    </span>
                    <span className="text-right text-sm font-bold tabular-nums text-[#2a1458]">{count(total)}</span>
                  </li>
                )
              })}
            </ul>
          )}
          {stats.teamRows.length > chartTeams.length ? (
            <p className="mt-5 text-xs text-[#7a6a4a]">Showing the {chartTeams.length} largest teams. Every team is in the table below.</p>
          ) : null}
        </section>

        <section aria-labelledby="overview-who" className={panel}>
          <h2 id="overview-who" className={heading}>
            Who registered
          </h2>
          <GoldRule className="mt-3 w-40" />
          <div className="relative mx-auto mt-5 h-44 w-44">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label={groups.map((group) => `${group.label}: ${group.value} people`).join(", ")}>
              <circle cx="70" cy="70" r={radius} fill="none" stroke="#f1e6c8" strokeWidth="20" />
              {arcs.map((arc) => (
                <circle
                  key={arc.key}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="20"
                  strokeDasharray={`${arc.dash} ${around - arc.dash}`}
                  strokeDashoffset={arc.offset}
                >
                  <title>{`${arc.label}: ${count(arc.value)} people (${share(arc.value)}%)`}</title>
                </circle>
              ))}
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-3xl font-black leading-none tabular-nums text-[#2a1458]">{count(stats.totalPeople)}</p>
                <p className="mt-1 text-xs text-[#7a6a4a]">people</p>
              </div>
            </div>
          </div>
          <ul className="mt-6 space-y-3">
            {groups.map((group) => (
              <li key={group.key} className="flex items-center gap-3 text-sm">
                <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="flex-1 text-[#4a3413]">{group.label}</span>
                <span className="font-bold tabular-nums text-[#2a1458]">{count(group.value)}</span>
                <span className="w-10 text-right tabular-nums text-[#7a6a4a]">{share(group.value)}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="overview-polo" className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="overview-polo" className={`flex items-center gap-2 ${heading}`}>
              <Shirt size={20} className="text-[#b8862b]" /> Polo shirts ordered
            </h2>
            <GoldRule className="mt-3 w-40" />
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#5c4a2a]">
              One shirt for each person joining, in the size they chose when registering. A couple who are both joining orders
              two.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d4a437]/60 bg-[#fdf8ea] px-6 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7a6a4a]">Total shirts</p>
            <p className="mt-1 text-4xl font-black leading-none tabular-nums text-[#2a1458]">{count(totalShirts)}</p>
          </div>
        </div>
        {/* Columns by size, smallest to largest, each labelled with its count. */}
        <ul className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {shirtsBySize.map((item) => (
            <li key={item.size} className="flex flex-col items-center" title={`${item.size}: ${count(item.count)} ${item.count === 1 ? "shirt" : "shirts"}`}>
              <span className="text-lg font-black tabular-nums text-[#2a1458]">{count(item.count)}</span>
              <span className="mt-1 flex h-28 w-full items-end justify-center border-b border-[#e3d3a8]">
                <span
                  className="w-6 rounded-t"
                  style={{ height: item.count ? `${Math.max((item.count / mostShirts) * 100, 4)}%` : "0%", backgroundColor: "#6a4ce2" }}
                />
              </span>
              <span className="mt-2 text-sm font-semibold text-[#4a3413]">{item.size}</span>
            </li>
          ))}
        </ul>
        {missingShirts > 0 ? (
          <p className="mt-4 text-xs text-[#7a6a4a]">
            {count(missingShirts)} {missingShirts === 1 ? "person has" : "people have"} no size recorded.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="overview-payments">
        <h2 id="overview-payments" className={heading}>
          Payments
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.payment.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e3d3a8] bg-[#fdf8ea] p-5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-[#7a6a4a]">{item.label}</dt>
              <dd className="mt-2 text-3xl font-black tabular-nums text-[#2a1458]">{count(people(item.rows))}</dd>
              <p className="mt-1 text-xs text-[#7a6a4a]">
                {people(item.rows) === 1 ? "person" : "people"} · {count(item.rows.length)} registration{item.rows.length === 1 ? "" : "s"}
              </p>
              <p className="mt-2 text-sm font-semibold tabular-nums text-[#2a1458]">
                {item.amount === null ? "Fee not set" : moneyFormat.format(item.amount)}{" "}
                <span className="font-normal text-[#7a6a4a]">{item.note}</span>
              </p>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="overview-teams">
        <h2 id="overview-teams" className={heading}>
          By team
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#d4a437]/50 bg-white shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)]">
          {stats.teamRows.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[#7a6a4a]">No team has anyone registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm text-[#2a1458]">
                <thead>
                  <tr className="bg-gradient-to-r from-[#2a1458] to-[#1a0d3d] text-left text-[#fbe7a1]">
                    {["#", "Team", "Team leader", "Team leader attending", "Agents", "Total people", "Paid", "Not paid"].map((heading, i) => (
                      <th key={heading} scope="col" className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 3 ? "text-right" : ""}`}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.teamRows.map((team, index) => (
                    <tr key={team.team} className="border-t border-[#f1e6c8] align-top odd:bg-white even:bg-[#fdfaf1]">
                      <td className={`${cell} tabular-nums text-[#a89a7c]`}>{index + 1}</td>
                      <td className={`${cell} min-w-[11rem] max-w-[18rem] break-words font-semibold text-[#2a1458]`}>{team.team}</td>
                      <td className={`${cell} min-w-[11rem] max-w-[18rem] break-words`}>
                        {team.leader ?? <span className="text-[#7a6a4a]">No team leader registered</span>}
                      </td>
                      <td className={`${cell} whitespace-nowrap text-right tabular-nums`}>
                        {team.leaderPeople ? `${count(team.leaderPeople)} ${team.leaderPeople === 1 ? "person" : "people"}` : "—"}
                      </td>
                      <td className={`${cell} whitespace-nowrap text-right tabular-nums`}>
                        {count(team.agents)}
                        {team.agentPeople !== team.agents ? <span className="text-xs text-[#7a6a4a]"> ({count(team.agentPeople)} people)</span> : null}
                      </td>
                      <td className={`${cell} whitespace-nowrap text-right font-bold tabular-nums text-[#2a1458]`}>{count(team.leaderPeople + team.agentPeople)}</td>
                      <td className={`${cell} whitespace-nowrap text-right tabular-nums`}>{count(team.paid)}</td>
                      <td className={`${cell} whitespace-nowrap text-right tabular-nums`}>{count(team.unpaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-[#7a6a4a]">Paid and Not paid count people. Guests who are not on a team are not listed here.</p>
      </section>
    </div>
  )
}

function sum(list: Registration[]) {
  return list.reduce((total, r) => total + Number(r.amount ?? 0), 0)
}
