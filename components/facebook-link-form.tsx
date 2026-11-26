"use client"

import { useState } from "react"
import { Facebook, Loader2 } from "lucide-react"
import { FACEBOOK_LINK_HELP, normalizeFacebookUrl } from "@/lib/tl-contact"

/** A team leader types or changes the Facebook link their agents use to contact them. */
export function FacebookLinkForm({
  current,
  onSave,
  submitLabel = "Save Facebook link",
}: {
  current: string | null
  /** Saves the link. Throws with the reason when it cannot be saved. */
  onSave: (facebookUrl: string) => Promise<void>
  submitLabel?: string
}) {
  const [value, setValue] = useState(current ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (busy) return
    const clean = normalizeFacebookUrl(value)
    if (!clean) {
      setError("That does not look like a Facebook link. It should start with facebook.com, for example https://www.facebook.com/juan.delacruz")
      return
    }
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      await onSave(clean)
      setValue(clean)
      setSaved(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "We could not save your Facebook link.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="tl-facebook" className="block text-sm font-semibold text-[#2a1458]">
        Your Facebook link <span className="text-[#b3261e]">*</span>
      </label>
      <div className="relative mt-2">
        <Facebook size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8862b]" />
        <input
          id="tl-facebook"
          type="url"
          inputMode="url"
          autoComplete="url"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setSaved(false)
          }}
          placeholder="https://www.facebook.com/your.name"
          aria-describedby="tl-facebook-help"
          aria-invalid={error ? true : undefined}
          className="h-12 w-full rounded-xl border border-[#e3d3a8] bg-white pl-11 pr-4 text-[#2a1458] placeholder:text-[#a8997a] focus:border-[#c9972f] focus:outline-none focus:ring-2 focus:ring-[#c9972f]/30"
        />
      </div>
      <p id="tl-facebook-help" className="mt-2 text-sm text-[#7a6a4a]">
        {FACEBOOK_LINK_HELP}
      </p>
      {error ? (
        <p role="alert" className="mt-3 rounded-xl border border-[#b3261e]/25 bg-[#b3261e]/5 px-4 py-3 text-sm font-medium text-[#9a1c15]">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#f3d27a] to-[#c9972f] px-5 text-sm font-bold text-[#2a1408] shadow-sm hover:brightness-105 disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          {submitLabel}
        </button>
        {saved ? (
          <span role="status" className="text-sm font-semibold text-[#2f6b3a]">
            Saved
          </span>
        ) : null}
      </div>
    </form>
  )
}
