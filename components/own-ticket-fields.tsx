"use client"

import type React from "react"
import { useState } from "react"
import { CalendarDays, Loader2, MessageCircle, Shirt, Ticket, TriangleAlert } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FormalPhotos, noPhotos, photosProblem, photosToSend, type PhotoPair } from "@/components/photo-field"
import { POLO_SHIRT_SIZES, splitCouple, validateAgentDetails, type Attending } from "@/lib/registrations"

// What a team leader fills in for their own ticket: who is joining (when their record is a
// couple), the same three details an agent gives, and a formal photo of each person joining. Used when they register and, for a team
// leader who has no registration yet, in their portal.

export type OwnTicketForm = { attending: Attending | ""; birth_date: string; whatsapp_number: string; polo_shirt_size: string }
export const emptyOwnTicket: OwnTicketForm = { attending: "", birth_date: "", whatsapp_number: "", polo_shirt_size: "" }

const inputClass =
  "h-12 rounded-xl border-[#e3d3a8] bg-white pl-11 pr-4 text-base text-[#2a1a3d] placeholder:text-[#a89a7c] transition-all duration-300 focus:border-[#c9972f] focus:shadow-[0_0_0_4px_rgba(212,164,55,0.18)] focus-visible:ring-0 focus-visible:ring-offset-0"
const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"
const fieldIconClass = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]"

const money = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value)

/** Null when the form can be sent, else what to fix. `name` is the name on the LR record. */
export function ownTicketProblem(name: string, form: OwnTicketForm, photos: PhotoPair): string | null {
  return ownTicketDetailsProblem(name, form) ?? photosProblem(name, form.attending, photos)
}

/** The same check without the photos, for a form that asks for them on a later step. */
export function ownTicketDetailsProblem(name: string, form: OwnTicketForm): string | null {
  if (splitCouple(name) && !form.attending) return "Please tell us who is joining."
  const checked = validateAgentDetails(form)
  return checked.ok ? null : checked.message
}

/** Adds the ticket and its photos to the form that is sent to the server. */
export function appendOwnTicket(body: FormData, name: string, form: OwnTicketForm, photos: PhotoPair) {
  body.set("birth_date", form.birth_date)
  body.set("whatsapp_number", form.whatsapp_number)
  body.set("polo_shirt_size", form.polo_shirt_size)
  if (form.attending) body.set("attending", form.attending)
  photosToSend(name, form.attending, photos).forEach((photo) => body.append("photo", photo))
  return body
}

export function OwnTicketFields({
  name,
  fee,
  value,
  onChange,
  photos,
  onPhotosChange,
  section = "all",
  idPrefix = "own",
}: {
  /** The name on the LR record; "A And B" is treated as a couple. */
  name: string
  /** Registration fee per person, when it has been set. */
  fee: number | null
  value: OwnTicketForm
  onChange: (next: OwnTicketForm) => void
  photos: PhotoPair
  onPhotosChange: (next: PhotoPair) => void
  /** Which part to show, for a form split over steps. */
  section?: "all" | "details" | "photo"
  idPrefix?: string
}) {
  const couple = splitCouple(name)
  const today = new Date().toISOString().slice(0, 10)
  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...value, [e.target.name]: e.target.value })

  return (
    <div className="space-y-5">
      {section === "photo" ? null : (
      <>
      {couple ? (
        <fieldset>
          <legend className="text-sm font-semibold text-[#4a3413]">Who is joining?</legend>
          <p className="mt-1 text-xs text-[#7a6a4a]">Your record is for two people. Each person joining pays the registration fee.</p>
          <div className="mt-3 space-y-2">
            {(
              [
                { value: "first", label: `${couple[0]} only`, count: 1 },
                { value: "second", label: `${couple[1]} only`, count: 1 },
                { value: "both", label: "Both of us", count: 2 },
              ] as const
            ).map((option) => {
              const chosen = value.attending === option.value
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    chosen ? "border-[#c9972f] bg-[#fdf3d7]" : "border-[#e3d3a8] bg-white hover:bg-[#fdf8ea]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${idPrefix}-attending`}
                    value={option.value}
                    checked={chosen}
                    onChange={() => onChange({ ...value, attending: option.value })}
                    required
                    className="h-4 w-4 accent-[#2a1458]"
                  />
                  <span className="min-w-0 flex-1 break-words font-semibold text-[#2a1458]">{option.label}</span>
                  <span className="shrink-0 text-right text-sm text-[#5c4a2a]">
                    {option.count === 2 ? "2 people" : "1 person"}
                    {fee !== null ? <span className="block font-bold tabular-nums text-[#2a1458]">{money(fee * option.count)}</span> : null}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ) : fee !== null ? (
        <p className="text-sm text-[#5c4a2a]">
          Registration fee: <span className="font-bold text-[#2a1458]">{money(fee)}</span>
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-birth-date`} className={labelClass}>
            Birth date
          </label>
          <div className="relative">
            <CalendarDays size={18} className={fieldIconClass} />
            <Input id={`${idPrefix}-birth-date`} type="date" name="birth_date" autoComplete="bday" min="1900-01-01" max={today} value={value.birth_date} onChange={set} required className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-polo-size`} className={labelClass}>
            Polo shirt size
          </label>
          <div className="relative">
            <Shirt size={18} className={fieldIconClass} />
            <select
              id={`${idPrefix}-polo-size`}
              name="polo_shirt_size"
              value={value.polo_shirt_size}
              onChange={set}
              required
              className={`${inputClass} w-full border outline-none ${value.polo_shirt_size ? "" : "text-[#a89a7c]"}`}
            >
              <option value="" disabled>
                Choose a size
              </option>
              {POLO_SHIRT_SIZES.map((size) => (
                <option key={size} value={size} className="text-[#2a1a3d]">
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}-whatsapp`} className={labelClass}>
            WhatsApp number
          </label>
          <div className="relative">
            <MessageCircle size={18} className={fieldIconClass} />
            <Input id={`${idPrefix}-whatsapp`} type="tel" inputMode="tel" name="whatsapp_number" autoComplete="tel" placeholder="+63 917 123 4567" value={value.whatsapp_number} onChange={set} required maxLength={25} className={inputClass} />
          </div>
        </div>
      </div>
      </>
      )}

      {section === "details" ? null : (
        <FormalPhotos name={name} attending={value.attending} photos={photos} onChange={onPhotosChange} idPrefix={idPrefix} />
      )}
    </div>
  )
}

/** Portal card for a team leader who has an account but no registration of their own yet. */
export function OwnTicketCard({ name, fee, onSaved }: { name: string; fee: number | null; onSaved: () => void }) {
  const [form, setForm] = useState(emptyOwnTicket)
  const [photos, setPhotos] = useState<PhotoPair>(noPhotos)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    const problem = ownTicketProblem(name, form, photos)
    if (problem) return setErrorMessage(problem)
    setBusy(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/tl/own-registration", {
        method: "POST",
        body: appendOwnTicket(new FormData(), name, form, photos),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        setErrorMessage(result?.message || "We could not save your registration. Please try again.")
        return
      }
      onSaved()
    } catch {
      setErrorMessage("We could not save your registration. Please check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-4 rounded-xl border border-[#e3d3a8] bg-[#fdf3d7] px-4 py-4 text-sm text-[#4a3413]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>
          <span className="font-semibold">You have not registered yourself yet.</span> Team leaders attend too: add your own
          registration so it is counted and paid with your team&apos;s.
        </p>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#8a6417] bg-gradient-to-r from-[#c9972f] to-[#f3d27a] px-4 text-sm font-bold text-[#2a1408] hover:brightness-105"
          >
            <Ticket size={16} /> Register myself
          </button>
        ) : null}
      </div>
      {open ? (
        <form onSubmit={submit} className="mt-4 max-w-xl rounded-xl border border-[#e3d3a8] bg-white p-4 sm:p-5">
          <OwnTicketFields name={name} fee={fee} value={form} onChange={setForm} photos={photos} onPhotosChange={setPhotos} idPrefix="portal-own" />
          {errorMessage ? (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {errorMessage}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#2a1458] bg-[#2a1458] px-5 text-sm font-bold text-[#fbe7a1] hover:bg-[#1a0d3d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />} Save my registration
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
              className="inline-flex h-11 items-center rounded-lg border border-[#e3d3a8] bg-white px-5 text-sm font-semibold text-[#6b4a12] hover:bg-[#fdf8ea]"
            >
              Not now
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
