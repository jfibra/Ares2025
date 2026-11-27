"use client"

import type React from "react"
import { useState } from "react"
import { CheckCircle2, Facebook, Loader2, Phone, TriangleAlert, User } from "lucide-react"

// Admin, on the tab of a team the admin handles: who looks after that team. The team's agents
// see this name, number and Facebook link with the payment details after they register.

export type TeamHandler = { name: string; contact_number: string; facebook_url: string | null }

const inputClass =
  "h-12 w-full rounded-xl border border-[#e3d3a8] bg-white pl-11 pr-4 text-base text-[#2a1a3d] outline-none placeholder:text-[#a89a7c] transition-all focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)]"
const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"
const iconClass = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]"

export default function AdminTeamHandlerForm({
  handler,
  onSave,
}: {
  handler: TeamHandler | null
  /** Saves the details. Throws with the reason when they cannot be saved. */
  onSave: (next: { name: string; contact_number: string; facebook_url: string }) => Promise<void>
}) {
  const [form, setForm] = useState({
    name: handler?.name ?? "",
    contact_number: handler?.contact_number ?? "",
    facebook_url: handler?.facebook_url ?? "",
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const update = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (form.name.trim().length < 2) return setError("Enter the name of the person handling this team.")
    if (form.contact_number.trim().length < 5) return setError("Enter their contact number.")
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      await onSave(form)
      setSaved(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "We could not save this.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="team-handler-name" className={labelClass}>
          Name <span className="text-[#b3261e]">*</span>
        </label>
        <div className="relative">
          <User size={18} className={iconClass} />
          <input id="team-handler-name" name="name" autoComplete="off" value={form.name} onChange={update} required maxLength={200} placeholder="Who the agents pay and ask" className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="team-handler-contact" className={labelClass}>
          Contact number <span className="text-[#b3261e]">*</span>
        </label>
        <div className="relative">
          <Phone size={18} className={iconClass} />
          <input id="team-handler-contact" type="tel" inputMode="tel" name="contact_number" autoComplete="off" value={form.contact_number} onChange={update} required maxLength={40} placeholder="+63 917 123 4567" className={inputClass} />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="team-handler-facebook" className={labelClass}>
          Facebook link <span className="font-normal text-[#7a6a4a]">(optional)</span>
        </label>
        <div className="relative">
          <Facebook size={18} className={iconClass} />
          <input id="team-handler-facebook" type="url" inputMode="url" name="facebook_url" autoComplete="off" value={form.facebook_url} onChange={update} maxLength={300} placeholder="https://www.facebook.com/their.name" className={inputClass} />
        </div>
      </div>
      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15] sm:col-span-2">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] px-5 text-sm font-bold text-[#2a1408] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null} Save
        </button>
        {saved ? (
          <span role="status" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f6b3a]">
            <CheckCircle2 size={16} /> Saved
          </span>
        ) : null}
      </div>
    </form>
  )
}
