"use client"

import { useSyncExternalStore } from "react"

// Shared store for the site's background music, owned by <BackgroundMusic />.
// Rule: the music is always meant to be playing, except while a site video
// plays. The visitor can only mute it, never stop it.

const MUSIC_SRC = "/background-music.mp3"
const VOLUME = 0.4

type State = { playing: boolean; muted: boolean }

let audio: HTMLAudioElement | null = null
let state: State = { playing: false, muted: false }

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const update = (patch: Partial<State>) => {
  const next = { ...state, ...patch }
  if (next.playing === state.playing && next.muted === state.muted) return
  state = next
  emit()
}

export function getAudio() {
  if (typeof window === "undefined") return null
  if (!audio) {
    audio = new Audio(MUSIC_SRC)
    audio.loop = true
    audio.volume = VOLUME
    audio.preload = "auto"
    audio.addEventListener("play", () => update({ playing: true }))
    audio.addEventListener("pause", () => update({ playing: false }))
    audio.addEventListener("volumechange", () => update({ muted: audio!.muted }))
  }
  return audio
}

// Videos that should NOT interrupt the music (e.g. silent hero loops) opt out
// with a `data-music-ignore` attribute.
export const countsAsVideo = (el: EventTarget | null): el is HTMLVideoElement =>
  el instanceof HTMLVideoElement && !el.hasAttribute("data-music-ignore")

export const anyVideoPlaying = () =>
  typeof document !== "undefined" &&
  Array.from(document.querySelectorAll("video")).some(
    (v) => countsAsVideo(v) && !v.paused && !v.ended,
  )

/** Start the music unless a video is playing. Resolves to whether it is now playing. */
export async function playMusic(): Promise<boolean> {
  const a = getAudio()
  if (!a || anyVideoPlaying()) return false
  if (!a.paused) return true
  try {
    await a.play()
    return true
  } catch {
    return false // autoplay blocked until the visitor interacts
  }
}

export function pauseMusic() {
  getAudio()?.pause()
}

/** User pressed the mute button. Only the sound is silenced. */
export function toggleMute() {
  const a = getAudio()
  if (!a) return
  a.muted = !a.muted
  void playMusic()
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
const getSnapshot = () => state
const serverState: State = { playing: false, muted: false }
const getServerSnapshot = () => serverState

export function useMusicState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
