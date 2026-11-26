"use client"

import { CheckCircle2, ImageIcon, Loader2, Receipt, Trash2, Undo2 } from "lucide-react"
import { PaymentCountdown } from "@/components/payment-countdown"
import { poloSizesLabel, splitCouple, type Registration, type TeamLeader } from "@/lib/registrations"
import { isOnPaymentClock } from "@/lib/unpaid-rule"

// Admin, on the "Not joining" tab: agents whose team leader is not joining ARES. They still
// register, pay the admin directly, and only the admin can confirm their payment.

const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" })
const dayFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" })
const timeFormat = new Intl.DateTimeFormat("en-PH", { timeStyle: "short", timeZone: "Asia/Manila" })
const moneyFormat = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })
// The action buttons stay in view while the rest of a wide table scrolls sideways.
const stickyAction = "lg:sticky lg:right-0 lg:shadow-[-10px_0_14px_-12px_rgba(42,20,88,0.45)]"
const linkClass = "flex items-center gap-1.5 font-semibold text-[#0078b6] hover:underline"

const COPY = {
  declined: {
    heading: "Agents of team leaders not joining",
    intro: "These agents registered even though their team leader is not joining. They pay you directly, using your payment details in Settings, and only you can confirm their payment.",
    column: "Team leader (not joining)",
    handler: null,
    empty: "No agent of a team leader who is not joining has registered yet.",
  },
  guests: {
    heading: "Registered guests",
    intro: "Guests who registered through the guest link, or whom you registered. A guest pays you directly unless you put them on a team under \"Handled by\": then that team's leader takes the payment and confirms it, like one of their own agents.",
    column: "LR agent?",
    handler: "Handled by",
    empty: "No guest has registered yet. Share the guest registration link above.",
  },
} as const

export default function AdminManagedAgents({
  variant = "declined",
  agents,
  fee,
  busyKey,
  onConfirm,
  onDelete,
  leaders = [],
  onAssign,
}: {
  /** "guests" lists special registrations and shows whether each guest is in the LR records. */
  variant?: keyof typeof COPY
  agents: Registration[]
  /** Registration fee per person; null until it is set. */
  fee: number | null
  /** `registration-<id>` while that row's request is running. */
  busyKey: string | null
  onConfirm: (agent: Registration, received: boolean) => void
  onDelete: (agent: Registration) => void
  /** Guests only: the registered team leaders a guest can be handed to. */
  leaders?: TeamLeader[]
  /** Guests only: hand the guest to a team leader, or back to the admin (null). */
  onAssign?: (agent: Registration, teamLeaderId: number | null) => void
}) {
  const unpaid = agents.filter((agent) => agent.payment_status === "unpaid").length
  const copy = COPY[variant]

  return (
    <section className="mt-8">
      <h2 className="text-xl font-black text-[#2a1458]">{copy.heading}</h2>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#5c4a2a]">
        {copy.intro}
        {agents.length ? (
          <>
            {" "}
            <span className="font-semibold text-[#2a1458]">
              {agents.length.toLocaleString()} registered, {unpaid.toLocaleString()} not paid yet.
            </span>
          </>
        ) : null}
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#d4a437]/50 bg-white shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)]">
        {agents.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#7a6a4a]">
            {copy.empty}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-[#2a1a3d]">
              <thead>
                <tr className="bg-gradient-to-r from-[#2a1458] to-[#1a0d3d] text-left text-[#fbe7a1]">
                  {["#", "Name", "Contact", "Team", copy.column, ...(copy.handler ? [copy.handler] : []), "Joining", "Polo", "Photo", "Receipt", "Registered", "Payment", ""].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider ${heading ? "" : `${stickyAction} bg-[#1a0d3d]`}`}
                      >
                        {heading || <span className="sr-only">Actions</span>}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, index) => {
                  const busy = busyKey === `registration-${agent.id}`
                  const paid = agent.payment_status !== "unpaid"
                  // A guest on a team is their team leader's to confirm, and the money reaches the admin in a remittance.
                  const onTeam = agent.team_leader_id !== null
                  const names = agent.photo_count === 2 ? splitCouple(agent.attendees ?? "") : null
                  return (
                    <tr key={agent.id} className={`border-t border-[#f1e6c8] align-top odd:bg-white even:bg-[#fdfaf1] ${busy ? "opacity-55" : ""}`}>
                      <td className="px-4 py-4 text-right tabular-nums text-[#a89a7c]">{index + 1}</td>
                      <td className="min-w-[13rem] max-w-[19rem] break-words px-4 py-4">
                        <p className="font-semibold leading-snug text-[#2a1458]">{agent.name}</p>
                        <a href={`mailto:${agent.email}`} className="mt-0.5 block break-all text-xs text-[#0078b6] hover:underline">
                          {agent.email}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 tabular-nums">
                        <p>{agent.contact_number || "—"}</p>
                        {agent.whatsapp_number ? <p className="mt-0.5 text-xs text-[#7a6a4a]">WhatsApp {agent.whatsapp_number}</p> : null}
                      </td>
                      <td className="min-w-[10rem] max-w-[15rem] break-words px-4 py-4 font-medium">{agent.team}</td>
                      <td className="px-4 py-4">
                        {variant !== "guests" ? (
                          agent.team_leader_name || "—"
                        ) : (
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              agent.guest_type === "lr_agent" ? "border-green-200 bg-green-50 text-green-800" : "border-violet-200 bg-violet-50 text-violet-800"
                            }`}
                          >
                            {agent.guest_type === "lr_agent" ? "Yes · LR agent" : "No · not in LR"}
                          </span>
                        )}
                      </td>
                      {copy.handler ? (
                        <td className="px-4 py-4">
                          <label htmlFor={`guest-team-${agent.id}`} className="sr-only">
                            Who handles {agent.name}
                          </label>
                          <select
                            id={`guest-team-${agent.id}`}
                            value={agent.team_leader_id ?? ""}
                            onChange={(e) => onAssign?.(agent, e.target.value ? Number(e.target.value) : null)}
                            disabled={busy || paid || !onAssign}
                            className="h-10 w-56 max-w-full rounded-lg border border-[#e3d3a8] bg-white px-2.5 text-sm font-semibold text-[#2a1458] outline-none focus:border-[#c9972f] disabled:cursor-not-allowed disabled:bg-[#f7f1e1] disabled:text-[#7a6a4a]"
                          >
                            <option value="">ARES admin (no team)</option>
                            {leaders.map((leader) => (
                              <option key={leader.id} value={leader.id}>
                                {leader.team} · {leader.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 max-w-[14rem] text-xs text-[#7a6a4a]">
                            {paid
                              ? "Payment recorded, so this is locked."
                              : onTeam
                                ? `${agent.team_leader_name || "Their team leader"} takes the payment.`
                                : "Pays you directly."}
                          </p>
                        </td>
                      ) : null}
                      <td className="min-w-[10rem] max-w-[15rem] break-words px-4 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            agent.attendee_count === 2 ? "border-violet-200 bg-violet-50 text-violet-800" : "border-[#e3d3a8] bg-[#fdf8ea] text-[#6b4a12]"
                          }`}
                        >
                          {agent.attendee_count === 2 ? "2 people" : "1 person"}
                        </span>
                        {agent.attendee_count === 2
                          ? (splitCouple(agent.attendees ?? "") ?? []).map((name) => (
                              <p key={name} className="mt-0.5 text-xs text-[#7a6a4a]">
                                {name}
                              </p>
                            ))
                          : agent.attendees
                            ? <p className="mt-0.5 text-xs text-[#7a6a4a]">{agent.attendees} only</p>
                            : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">{poloSizesLabel(agent) || "—"}</td>
                      <td className="px-4 py-4">
                        {agent.photo_count ? (
                          <div className="space-y-1">
                            {Array.from({ length: agent.photo_count }, (_, n) => (
                              <a key={n} href={`/api/registrations/${agent.id}/photo?n=${n + 1}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                <ImageIcon size={15} className="shrink-0" /> {names ? names[n] : "View photo"}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="whitespace-nowrap text-xs text-[#7a6a4a]">No photo</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {agent.agent_receipt_at ? (
                          <div className="min-w-[13rem] max-w-[17rem]">
                            <a href={`/api/registrations/${agent.id}/receipt`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                              <Receipt size={15} className="shrink-0" /> View receipt
                            </a>
                            <p className="whitespace-nowrap text-xs text-[#7a6a4a]">Sent {dateFormat.format(new Date(agent.agent_receipt_at))}</p>
                            {agent.agent_receipt_note ? (
                              <p className="mt-1 max-w-xs whitespace-pre-wrap break-words text-xs text-[#4a3413]">“{agent.agent_receipt_note}”</p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="whitespace-nowrap text-xs text-[#7a6a4a]">Not sent yet</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <p>{dayFormat.format(new Date(agent.registration_date))}</p>
                        <p className="mt-0.5 text-xs text-[#7a6a4a]">{timeFormat.format(new Date(agent.registration_date))}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            paid ? "border-green-200 bg-green-50 text-green-800" : "border-[#e3d3a8] bg-[#fdf3d7] text-[#8a5a00]"
                          }`}
                        >
                          {!paid ? "Not paid" : agent.payment_status === "verified" ? "Fully paid" : agent.payment_status === "remitted" ? "Sent to admin" : "Paid to team leader"}
                        </span>
                        <p className="mt-1 whitespace-nowrap text-xs tabular-nums text-[#5c4a2a]">
                          {paid
                            ? agent.amount === null ? "" : moneyFormat.format(agent.amount)
                            : fee === null ? "Fee not set" : `To pay ${moneyFormat.format(fee * agent.attendee_count)}`}
                        </p>
                        {isOnPaymentClock(agent) ? (
                          <div className="mt-2">
                            <PaymentCountdown registrationDate={agent.registration_date} />
                          </div>
                        ) : null}
                      </td>
                      <td className={`${stickyAction} bg-inherit px-4 py-4`}>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onConfirm(agent, !paid)}
                            disabled={busy || (!paid && fee === null) || (paid && onTeam && agent.payment_status !== "paid_to_tl")}
                            className={`inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                              paid
                                ? "border border-[#e3d3a8] bg-white text-[#6b4a12] hover:bg-[#fdf3d7]"
                                : "border border-[#8a6417] bg-gradient-to-r from-[#c9972f] to-[#f3d27a] text-[#2a1408] hover:brightness-105"
                            }`}
                          >
                            {busy ? <Loader2 size={14} className="animate-spin" /> : paid ? <Undo2 size={14} /> : <CheckCircle2 size={14} />}
                            {paid ? "Undo" : "Payment received"}
                          </button>
                          {!paid ? (
                            <button
                              type="button"
                              onClick={() => onDelete(agent)}
                              disabled={busy}
                              aria-label={`Delete ${agent.name}`}
                              className="grid h-9 w-9 place-items-center rounded-lg border border-[#e3d3a8] bg-white text-[#7a6a4a] transition-colors hover:border-[#b3261e]/40 hover:bg-[#b3261e]/5 hover:text-[#b3261e] disabled:cursor-not-allowed"
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
