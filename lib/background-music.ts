"use client"

import { useSyncExternalStore } from "react"

// Tiny shared store so any component (floating control, landing-page button)
// can read and toggle the background music owned by <BackgroundMusic />.

const MUSIC_SRC = "/background-music.mp3"
const VOLUME = 0.4

type State = { playing: boolean; muted: boolean }

let audio: HTMLAudioElement | null = null
let state: State = { playing: false, muted: false }
// Set when a video interrupted the music so we can resume afterwards.
let pausedForVideo = false

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

/** Attempt to play. Resolves to whether the browser allowed it. */
export async function playMusic(): Promise<boolean> {
  const a = getAudio()
  if (!a) return false
  try {
    await a.play()
    return true
  } catch {
    return false
  }
}

export function pauseMusic() {
  getAudio()?.pause()
}

/** User pressed the mute button. The music keeps running; only the sound
 *  is silenced, so it can never be "stopped" by the visitor. */
export function toggleMute() {
  const a = getAudio()
  if (!a) return
  a.muted = !a.muted
  if (a.paused && !pausedForVideo) void playMusic()
}

/** Called when a site video starts: silence the music while it plays. */
export function pauseForVideo() {
  const a = getAudio()
  if (!a || a.paused) return
  pausedForVideo = true
  a.pause()
}

/** Called when no site video is playing anymore. */
export function resumeAfterVideo() {
  if (!pausedForVideo) return
  pausedForVideo = false
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
