"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Camera, Check, Loader2, User } from "lucide-react"
import { PHOTO_ACCEPT, preparePhoto } from "@/lib/photo"
import { splitCouple, type Attending } from "@/lib/registrations"

// The formal photo each person uploads when they register, used for their ARES poster.
// Shared by the agent registration form and the team leader's own registration.

const labelClass = "mb-2 block text-sm font-semibold text-[#4a3413]"

/** The first is the person on the record (or the first of a couple), the second their partner. */
export type PhotoPair = [File | null, File | null]
export const noPhotos: PhotoPair = [null, null]

export type PhotoSlot = { index: 0 | 1; label: string }

/** Whose photo is needed: everyone joining. A couple has none until they choose who is joining. */
export function photoSlotsFor(name: string, attending: Attending | ""): PhotoSlot[] {
  const couple = splitCouple(name)
  if (!couple) return [{ index: 0, label: "Upload your photo" }]
  return ([0, 1] as const)
    .filter((index) => attending === "both" || attending === (index === 0 ? "first" : "second"))
    .map((index) => ({ index, label: `Formal photo of ${couple[index]}` }))
}

/** Null when every needed photo is there, else what to tell the person. */
export function photosProblem(name: string, attending: Attending | "", photos: PhotoPair): string | null {
  const slots = photoSlotsFor(name, attending)
  if (slots.every((slot) => photos[slot.index])) return null
  return slots.length === 2 ? "Please upload a clear, formal photo of each of you." : "Please upload a clear, formal photo of yourself."
}

/** The photos to send, in order: one per person joining. */
export const photosToSend = (name: string, attending: Attending | "", photos: PhotoPair) =>
  photoSlotsFor(name, attending)
    .map((slot) => photos[slot.index])
    .filter((file): file is File => Boolean(file))

/** One person's formal photo for their poster: pick it, see it, change it. */
export function PhotoField({
  id,
  label,
  file,
  onChange,
}: {
  id: string
  label: string
  file: File | null
  onChange: (file: File | null) => void
}) {
  const [preparing, setPreparing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    e.target.value = "" // so picking the same file again still counts as a change
    if (!picked) return
    setPreparing(true)
    setError(null)
    const result = await preparePhoto(picked)
    setPreparing(false)
    if (result.ok) return onChange(result.file)
    onChange(null)
    setError(result.message)
  }

  return (
    <div>
      <p className={labelClass}>
        {label} <span className="text-[#b3261e]">*</span>
      </p>
      <div className="flex items-center gap-4 rounded-xl border border-[#e3d3a8] bg-white p-3">
        <div className="grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#e3d3a8] bg-[#fdf8ea] text-[#b8862b]">
          {preview ? <img src={preview} alt={`${label} preview`} className="h-full w-full object-cover" /> : <User size={32} />}
        </div>
        <div className="min-w-0">
          <label
            htmlFor={id}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-[#2a1458] px-4 text-sm font-semibold text-[#fbe7a1] hover:bg-[#1a0d3d] focus-within:ring-4 focus-within:ring-[#d4a437]/40"
          >
            {preparing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {preparing ? "Preparing…" : file ? "Change photo" : "Upload photo"}
            <input id={id} type="file" accept={PHOTO_ACCEPT} onChange={pick} disabled={preparing} className="sr-only" />
          </label>
          <p className="mt-1.5 text-xs text-[#7a6a4a]">
            {file ? (
              <span className="inline-flex items-center gap-1 font-semibold text-green-800">
                <Check size={13} strokeWidth={3} /> Photo added
              </span>
            ) : (
              "JPG, PNG or WEBP."
            )}
          </p>
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-[#9a1c15]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** The whole photo part of a form: what kind of photo is wanted, then one upload per person joining. */
export function FormalPhotos({
  name,
  attending,
  photos,
  onChange,
  idPrefix,
}: {
  /** The name on the LR record; "A And B" is treated as a couple. */
  name: string
  attending: Attending | ""
  photos: PhotoPair
  onChange: (next: PhotoPair) => void
  idPrefix: string
}) {
  const slots = photoSlotsFor(name, attending)
  return (
    <div>
      <p className="text-sm font-bold text-[#2a1458]">
        Your formal photo <span className="text-[#b3261e]">*</span>
      </p>
      <p className="mt-1 text-sm text-[#7a6a4a]">
        Upload a <strong className="text-[#2a1458]">clear, formal photo</strong> of yourself. We will use it for verification purposes, so it is required to register.
      </p>
      <ul className="mt-3 space-y-1.5 rounded-xl border border-[#e3d3a8] bg-[#fdf8ea] px-4 py-3 text-sm text-[#4a3413]">
        {[
          "Formal or business attire",
          "Clear and sharp, with good lighting: not blurry, dark or pixelated",
          "Only you in the photo, facing the camera, from the chest or waist up",
          "Plain background, with no sunglasses, caps or filters",
        ].map((rule) => (
          <li key={rule} className="flex gap-2">
            <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-[#b8862b]" /> {rule}
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-4">
        {slots.length ? (
          slots.map((slot) => (
            <PhotoField
              key={slot.index}
              id={`${idPrefix}-photo-${slot.index + 1}`}
              label={slot.label}
              file={photos[slot.index]}
              onChange={(file) => onChange(slot.index === 0 ? [file, photos[1]] : [photos[0], file])}
            />
          ))
        ) : (
          <p className="text-sm text-[#7a6a4a]">Choose who is joining above, then upload a photo of each person.</p>
        )}
      </div>
    </div>
  )
}
