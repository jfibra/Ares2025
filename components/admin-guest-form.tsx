"use client"

import type React from "react"
import { useState } from "react"
import { BadgeCheck, CheckCircle2, Loader2, Mail, Phone, Search, TriangleAlert, User, UserPlus, X } from "lucide-react"
import { OwnTicketFields, appendOwnTicket, emptyOwnTicket, ownTicketProblem } from "@/components/own-ticket-fields"
import { noPhotos, type PhotoPair } from "@/components/photo-field"

// Admin, on the Guests tab: registers a guest on the guest's behalf. It goes through the same
// checks as the guest link (LR record check, slots, photo), using the current guest link's code.

const inputClass =
  "h-12 w-full rounded-xl border border-[#e3d3a8] bg-white pl-11 pr-4 text-base text-[#2a1a3d] outline-none placeholder:text-[#a89a7c] transition-all focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)]"
const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"
const iconClass = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]"
const goldButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] px-5 text-sm font-bold text-[#2a1408] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
const outlineButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e3d3a8] bg-white px-5 text-sm font-semibold text-[#6b4a12] transition-colors hover:border-[#c9972f] hover:bg-[#fdf3d7] disabled:cursor-not-allowed disabled:opacity-50"

type LrAgent = { name: string; team: string }

export default function AdminGuestForm({
  invite,
  onRegistered,
}: {
  /** The current guest link's code; the form cannot be used without one. */
  invite: string | null
  /** Called after a guest is saved, so the list can reload. */
  onRegistered: () => void
}) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<"email" | "details">("email")
  const [email, setEmail] = useState("")
  const [agent, setAgent] = useState<LrAgent | null>(null)
  const [form, setForm] = useState({ name: "", contact_number: "" })
  const [ticket, setTicket] = useState(emptyOwnTicket)
  const [photos, setPhotos] = useState<PhotoPair>(noPhotos)
  const [fee, setFee] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedName, setSavedName] = useState<string | null>(null)

  const recordName = agent?.name ?? ""

  const reset = () => {
    setStage("email")
    setEmail("")
    setAgent(null)
    setForm({ name: "", contact_number: "" })
    setTicket(emptyOwnTicket)
    setPhotos(noPhotos)
    setError(null)
  }

  /** Step 1: is this email an LR agent, and is it registered already? */
  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !invite) return
    setBusy(true)
    setError(null)
    setSavedName(null)
    try {
      const response = await fetch("/api/guest/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite, email }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) return setError(result?.message || "We could not check this email. Please try again.")
      if (result.status === "full") return setError("All slots for ARES 2027 have been taken. Add more slots in Settings first.")
      if (result.status === "already_registered") return setError("This email is already registered for ARES 2027.")
      setAgent(result.agent ?? null)
      setFee(typeof result.fee === "number" ? result.fee : null)
      setStage("details")
    } catch {
      setError("We could not check this email. Please check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  /** Step 2: save the guest's registration. */
  const register = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !invite) return
    if (!agent && form.name.trim().length < 2) return setError("Please enter the guest's full name.")
    const problem = ownTicketProblem(recordName, ticket, photos)
    if (problem) return setError(problem)
    setBusy(true)
    setError(null)
    try {
      const body = new FormData()
      body.set("invite", invite)
      body.set("email", email)
      body.set("name", form.name)
      body.set("contact_number", form.contact_number)
      appendOwnTicket(body, recordName, ticket, photos)
      const response = await fetch("/api/guest/register", { method: "POST", body })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) return setError(result?.message || "We could not save this registration. Please try again.")
      setSavedName(typeof result.name === "string" ? result.name : "The guest")
      reset()
      onRegistered()
    } catch {
      setError("We could not save this registration. Please check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  const errorBox = error ? (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
      <TriangleAlert size={18} className="mt-0.5 shrink-0" />
      {error}
    </p>
  ) : null

  return (
    <section className="mt-6 rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">Register for them</p>
          <h2 className="mt-2 text-2xl font-black text-[#2a1458]">Register a guest yourself</h2>
          <p className="mt-2 leading-relaxed text-[#5c4a2a]">
            Fill in the guest&apos;s details here instead of sending them the link. We first check whether their email is in the LR
            records. Have their formal photo ready.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((current) => !current)
            setSavedName(null)
            if (open) reset()
          }}
          disabled={!invite}
          aria-expanded={open}
          className={open ? outlineButton : goldButton}
        >
          {open ? <X size={16} /> : <UserPlus size={16} />} {open ? "Close" : "Register a guest"}
        </button>
      </div>

      {savedName ? (
        <p role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {savedName} is registered. Find them in the list below to record their payment or put them on a team.
        </p>
      ) : null}

      {!open ? null : stage === "email" ? (
        <form onSubmit={check} className="mt-6 max-w-xl space-y-4">
          <div>
            <label htmlFor="admin-guest-email" className={labelClass}>
              Guest&apos;s email
            </label>
            <div className="relative">
              <Mail size={18} className={iconClass} />
              <input
                id="admin-guest-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={320}
                placeholder="guest@example.com"
                className={inputClass}
              />
            </div>
          </div>
          {errorBox}
          <button type="submit" disabled={busy} className={goldButton}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Check email
          </button>
        </form>
      ) : (
        <form onSubmit={register} noValidate className="mt-6 max-w-2xl space-y-5">
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              agent ? "border-green-200 bg-green-50 text-green-900" : "border-violet-200 bg-violet-50 text-violet-900"
            }`}
          >
            <BadgeCheck size={18} className="mt-0.5 shrink-0" />
            <p className="min-w-0 break-words">
              <span className="font-bold">{email}</span>{" "}
              {agent ? (
                <>
                  is an LR agent: <span className="font-bold">{agent.name}</span> ({agent.team}). They are registered under this name.
                </>
              ) : (
                "is not in the LR records. Type the guest's name below."
              )}
            </p>
          </div>

          {agent ? null : (
            <div>
              <label htmlFor="admin-guest-name" className={labelClass}>
                Guest&apos;s full name
              </label>
              <div className="relative">
                <User size={18} className={iconClass} />
                <input
                  id="admin-guest-name"
                  autoComplete="off"
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  required
                  minLength={2}
                  maxLength={200}
                  placeholder="As it should appear on their ID"
                  className={inputClass}
                />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="admin-guest-contact" className={labelClass}>
              Guest&apos;s contact number
            </label>
            <div className="relative">
              <Phone size={18} className={iconClass} />
              <input
                id="admin-guest-contact"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                value={form.contact_number}
                onChange={(e) => setForm((current) => ({ ...current, contact_number: e.target.value }))}
                required
                minLength={5}
                maxLength={40}
                className={inputClass}
              />
            </div>
          </div>

          <OwnTicketFields name={recordName} fee={fee} value={ticket} onChange={setTicket} photos={photos} onPhotosChange={setPhotos} idPrefix="admin-guest" />

          {errorBox}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className={goldButton}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Register this guest
            </button>
            <button type="button" onClick={reset} disabled={busy} className={outlineButton}>
              Use a different email
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
