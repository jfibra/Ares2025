"use client"

import { useSyncExternalStore } from "react"

// Tiny shared store so any component (floating control, landing-page button)
// can read and toggle the background music owned by <BackgroundMusic />.

const MUSIC_SRC = "/background-music.mp3"
const VOLUME = 0.4

type State = { playing: boolean }

let audio: HTMLAudioElement | null = null
let state: State = { playing: false }
// Set when the visitor explicitly stops the music; we never auto-resume then.
let stoppedByUser = false
// Set when a video interrupted the music so we can resume afterwards.
let pausedForVideo = false

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const setPlaying = (playing: boolean) => {
  if (state.playing === playing) return
  state = { playing }
  emit()
}

export function getAudio() {
  if (typeof window === "undefined") return null
  if (!audio) {
    audio = new Audio(MUSIC_SRC)
    audio.loop = true
    audio.volume = VOLUME
    audio.preload = "auto"
    audio.addEventListener("play", () => setPlaying(true))
    audio.addEventListener("pause", () => setPlaying(false))
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

/** User pressed the stop/play button. */
export function toggleMusic() {
  const a = getAudio()
  if (!a) return
  if (a.paused) {
    stoppedByUser = false
    pausedForVideo = false
    void playMusic()
  } else {
    stoppedByUser = true
    pausedForVideo = false
    a.pause()
  }
}

export const userStoppedMusic = () => stoppedByUser

/** Called when a site video starts: silence the music while it plays. */
export function pauseForVideo() {
  const a = getAudio()
  if (!a || a.paused) return
  pausedForVideo = true
  a.pause()
}

/** Called when no site video is playing anymore. */
export function resumeAfterVideo() {
  if (!pausedForVideo || stoppedByUser) return
  pausedForVideo = false
  void playMusic()
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
const getSnapshot = () => state.playing
const getServerSnapshot = () => false

export function useMusicPlaying() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
