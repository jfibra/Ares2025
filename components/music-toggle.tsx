"use client"

import { Volume2, VolumeX } from "lucide-react"
import { toggleMusic, useMusicPlaying } from "@/lib/background-music"

type Props = {
  className?: string
  /** Show a text label next to the icon. */
  label?: boolean
}

export default function MusicToggle({ className = "", label = false }: Props) {
  const playing = useMusicPlaying()
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        toggleMusic()
      }}
      aria-pressed={playing}
      aria-label={playing ? "Stop background music" : "Play background music"}
      title={playing ? "Stop music" : "Play music"}
      className={`inline-flex items-center justify-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-white/70 ${className}`}
    >
      {playing ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      {label && <span>{playing ? "Stop music" : "Play music"}</span>}
    </button>
  )
}
