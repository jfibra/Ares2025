"use client"

import { useEffect, useState } from "react"
import { Check, Loader2, Mail, Send, Trash2, TriangleAlert, UserPlus } from "lucide-react"
import { GENERAL_REGISTRATION_NOTICE } from "@/lib/registration-opening"

// Admin, in Settings: the LR emails of everyone who attended ARES 2025. Until general
// registration opens, only these people can register.

/** The dashboard's request helper: null when the session ended, throws with the reason on failure. */
type Call = (url: string, init?: RequestInit) => Promise<Record<string, any> | null>

const buttonBase =
  "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50"

export default function PastAttendeesPanel({ call }: { call: Call }) {
  const [emails, setEmails] = useState<string[] | null>(null)
  const [text, setText] = useState("")
  const [busy, setBusy] = useState<"add" | "remove" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [filter, setFilter] = useState("")
  const [invite, setInvite] = useState<{ total: number; invited: number; registered: number; remaining: number } | null>(null)
  const [sending, setSending] = useState<"test" | "send" | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [sentNow, setSentNow] = useState(0)
  const [inviteDone, setInviteDone] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const loadInvite = async () => {
    try {
      const result = await call("/api/admin/past-attendees/invite", { cache: "no-store" })
      if (result) setInvite({ total: result.total, invited: result.invited, registered: result.registered, remaining: result.remaining })
    } catch {
      // The numbers are a convenience; sending still reports its own errors.
    }
  }

  const postInvite = (action: "test" | "send") =>
    call("/api/admin/past-attendees/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })

  const sendTest = async () => {
    if (sending) return
    setSending("test")
    setInviteError(null)
    setInviteDone(null)
    try {
      const result = await postInvite("test")
      if (result) setInviteDone(`A test copy was sent to ${result.sentTo}. Check your inbox (and spam folder).`)
    } catch (sendError) {
      setInviteError(sendError instanceof Error ? sendError.message : "Could not send the test email.")
    } finally {
      setSending(null)
    }
  }

  // Sends a few at a time and keeps going until everyone has it or the mail account refuses.
  const sendAll = async () => {
    if (sending) return
    setConfirming(false)
    setSending("send")
    setInviteError(null)
    setInviteDone(null)
    setSentNow(0)
    let total = 0
    try {
      for (;;) {
        const result = await postInvite("send")
        if (!result) return
        total += result.sent
        setSentNow(total)
        setInvite({ total: result.total, invited: result.invited, registered: result.registered, remaining: result.remaining })
        if (result.failed) {
          setInviteError(
            `Sent ${total.toLocaleString()}, then the mail account stopped accepting emails${result.lastError ? ` (${result.lastError})` : ""}. ` +
              `${result.remaining.toLocaleString()} still to send. Gmail limits how many emails an account can send in a day, so press the button again tomorrow: it continues where it stopped.`,
          )
          return
        }
        if (!result.remaining || !result.sent) break
      }
      setInviteDone(`Sent to ${total.toLocaleString()} ${total === 1 ? "person" : "people"}. Everyone on the list has been invited.`)
    } catch (sendError) {
      setInviteError(
        `${total ? `Sent ${total.toLocaleString()}, then stopped. ` : ""}${sendError instanceof Error ? sendError.message : "Could not send the emails."} Press the button again to continue.`,
      )
      loadInvite()
    } finally {
      setSending(null)
    }
  }

  const load = async () => {
    setError(null)
    try {
      const result = await call("/api/admin/past-attendees", { cache: "no-store" })
      if (result) setEmails(result.emails)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the ARES 2025 attendee list.")
    }
  }
  useEffect(() => {
    load()
    loadInvite()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const change = async (action: "add" | "remove") => {
    if (busy || !text.trim()) return
    setBusy(action)
    setError(null)
    setDone(null)
    try {
      const result = await call("/api/admin/past-attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, emails: text }),
      })
      if (!result) return
      setEmails(result.emails)
      setText("")
      loadInvite()
      const count = (n: number) => `${n.toLocaleString()} email${n === 1 ? "" : "s"}`
      const skipped = result.found - result.changed
      setDone(
        action === "add"
          ? `Added ${count(result.changed)}.${skipped ? ` ${count(skipped)} already on the list.` : ""}`
          : `Removed ${count(result.changed)}.${skipped ? ` ${count(skipped)} not on the list.` : ""}`,
      )
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : "Could not update the list.")
    } finally {
      setBusy(null)
    }
  }

  const q = filter.trim().toLowerCase()
  const shown = (emails ?? []).filter((email) => !q || email.includes(q))

  return (
    <section className="mt-4 rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Pre-registration</p>
      <h2 className="mt-2 text-2xl font-black text-[#2a1458]">ARES 2025 attendees</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-[#5c4a2a]">
        People on this list register first. From the moment registration opens until general registration opens, only they
        can register, and they are welcomed back to ARES. Everyone else is told: &ldquo;{GENERAL_REGISTRATION_NOTICE}&rdquo;
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#7a6a4a]">
        Use each person&apos;s <strong className="text-[#4a3413]">LR email</strong>, the one they register with. A personal
        email will not match.
      </p>

      <p className="mt-5 text-sm text-[#5c4a2a]">
        On the list:{" "}
        <span className="text-lg font-black tabular-nums text-[#2a1458]">{emails === null ? "…" : emails.length.toLocaleString()}</span>
      </p>
      {emails !== null && emails.length === 0 ? (
        <p role="alert" className="mt-2 flex max-w-2xl items-start gap-2 rounded-xl border border-[#e3d3a8] bg-[#fdf3d7] px-4 py-3 text-sm font-medium text-[#6b4a12]">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" /> The list is empty, so nobody can register during
          pre-registration. Paste the ARES 2025 attendees below before registration opens.
        </p>
      ) : null}

      <div className="mt-5 max-w-2xl">
        <label htmlFor="past-attendees-text" className="mb-1.5 block text-sm font-semibold text-[#4a3413]">
          Paste LR emails
        </label>
        <textarea
          id="past-attendees-text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setDone(null)
          }}
          rows={6}
          spellCheck={false}
          placeholder={"One per line, or copied straight from a spreadsheet column\nagent.one@example.com\nagent.two@example.com"}
          className="w-full rounded-xl border border-[#e3d3a8] bg-white px-3 py-2.5 font-mono text-sm text-[#2a1a3d] outline-none transition-all placeholder:font-sans placeholder:text-[#a89a7c] focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)]"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => change("add")}
            disabled={busy !== null || !text.trim()}
            className={`${buttonBase} border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] text-[#2a1408] hover:brightness-105`}
          >
            {busy === "add" ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Add to the list
          </button>
          <button
            type="button"
            onClick={() => change("remove")}
            disabled={busy !== null || !text.trim()}
            className={`${buttonBase} border-[#e3d3a8] bg-white font-semibold text-[#6b4a12] hover:border-[#b3261e]/40 hover:bg-[#b3261e]/5 hover:text-[#b3261e]`}
          >
            {busy === "remove" ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Remove these from the list
          </button>
        </div>
        {done ? (
          <p role="status" className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-800">
            <Check size={16} strokeWidth={3} /> {done}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {error}
          </p>
        ) : null}
      </div>

      {emails && emails.length > 0 ? (
        <div className="mt-6 max-w-2xl rounded-xl border border-[#d4a437]/50 bg-[#fdf8ea] p-4 sm:p-5">
          <h3 className="flex items-center gap-2 text-lg font-black text-[#2a1458]">
            <Mail size={18} className="text-[#b8862b]" /> Email the invitation
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#5c4a2a]">
            Sends everyone on this list an email saying they register first, with the opening dates, the fee and the
            registration link. Each person is emailed only once, and people who have already registered are skipped.
          </p>
          {invite ? (
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Still to send", invite.remaining],
                ["Already sent", invite.invited],
                ["Skipped, registered", invite.registered],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#e3d3a8] bg-white px-2 py-2.5">
                  <dd className="text-xl font-black tabular-nums text-[#2a1458]">{Number(value).toLocaleString()}</dd>
                  <dt className="mt-0.5 text-xs font-semibold text-[#7a6a4a]">{label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={sendTest}
              disabled={sending !== null}
              className={`${buttonBase} border-[#e3d3a8] bg-white font-semibold text-[#4a3413] hover:border-[#c9972f]`}
            >
              {sending === "test" ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Send a test to me
            </button>
            {confirming ? (
              <>
                <button
                  type="button"
                  onClick={sendAll}
                  className={`${buttonBase} border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] text-[#2a1408] hover:brightness-105`}
                >
                  <Send size={16} /> Yes, email {invite ? invite.remaining.toLocaleString() : "them"} now
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className={`${buttonBase} border-[#e3d3a8] bg-white font-semibold text-[#6b4a12]`}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={sending !== null || !invite || invite.remaining === 0}
                className={`${buttonBase} border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] text-[#2a1408] hover:brightness-105`}
              >
                {sending === "send" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending === "send" ? `Sending… ${sentNow.toLocaleString()} sent` : "Email everyone on the list"}
              </button>
            )}
          </div>
          {sending === "send" ? (
            <p className="mt-3 text-sm font-medium text-[#6b4a12]">Please keep this page open until it finishes.</p>
          ) : null}
          {inviteDone ? (
            <p role="status" className="mt-3 flex items-start gap-2 text-sm font-semibold text-green-800">
              <Check size={16} strokeWidth={3} className="mt-0.5 shrink-0" /> {inviteDone}
            </p>
          ) : null}
          {inviteError ? (
            <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {inviteError}
            </p>
          ) : null}
        </div>
      ) : null}

      {emails && emails.length > 0 ? (
        <details className="mt-6 max-w-2xl rounded-xl border border-[#e3d3a8] bg-[#fdf8ea]">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#4a3413]">
            See or check the list ({emails.length.toLocaleString()})
          </summary>
          <div className="border-t border-[#e3d3a8] p-4">
            <label htmlFor="past-attendees-filter" className="sr-only">
              Check whether an email is on the list
            </label>
            <input
              id="past-attendees-filter"
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Type an email to check if it is on the list"
              className="h-11 w-full rounded-xl border border-[#e3d3a8] bg-white px-3 text-sm text-[#2a1a3d] outline-none placeholder:text-[#a89a7c] focus:border-[#c9972f]"
            />
            {shown.length ? (
              <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto font-mono text-sm text-[#2a1a3d]">
                {shown.map((email) => (
                  <li key={email} className="break-all">
                    {email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#7a6a4a]">No email on the list matches that.</p>
            )}
          </div>
        </details>
      ) : null}
    </section>
  )
}
