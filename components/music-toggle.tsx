"use client"

import { Volume2, VolumeX } from "lucide-react"
import { toggleMute, useMusicState } from "@/lib/background-music"

type Props = {
  className?: string
}

export default function MusicToggle({ className = "" }: Props) {
  const { muted } = useMusicState()
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        toggleMute()
      }}
      aria-pressed={muted}
      aria-label={muted ? "Unmute background music" : "Mute background music"}
      title={muted ? "Unmute music" : "Mute music"}
      className={`inline-flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-white/70 ${className}`}
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  )
}
