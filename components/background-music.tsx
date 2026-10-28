"use client"

import { useEffect } from "react"
import {
  getAudio,
  pauseForVideo,
  playMusic,
  resumeAfterVideo,
} from "@/lib/background-music"
import MusicToggle from "@/components/music-toggle"

// Videos that should NOT interrupt the music (e.g. silent hero loops) opt out
// with a `data-music-ignore` attribute.
const countsAsVideo = (el: EventTarget | null): el is HTMLVideoElement =>
  el instanceof HTMLVideoElement && !el.hasAttribute("data-music-ignore")

const anyVideoPlaying = () =>
  Array.from(document.querySelectorAll("video")).some(
    (v) => countsAsVideo(v) && !v.paused && !v.ended,
  )

export default function BackgroundMusic() {
  useEffect(() => {
    const audio = getAudio()
    if (!audio) return

    const tryPlay = () => {
      if (anyVideoPlaying()) return
      void playMusic()
    }

    // Browsers block autoplay with sound until the first user gesture,
    // so attempt immediately and again on the first interaction.
    tryPlay()
    const gestures: (keyof DocumentEventMap)[] = ["click", "touchstart", "keydown", "scroll"]
    const onGesture = () => {
      if (audio.paused) tryPlay()
      gestures.forEach((e) => document.removeEventListener(e, onGesture))
    }
    gestures.forEach((e) => document.addEventListener(e, onGesture, { passive: true }))

    // Media events don't bubble, so listen in the capture phase to catch
    // every <video> on the site, including ones mounted later.
    const onVideoPlay = (e: Event) => {
      if (countsAsVideo(e.target)) pauseForVideo()
    }
    const onVideoStop = (e: Event) => {
      if (!countsAsVideo(e.target)) return
      // Defer so a video that is pausing/ending has updated its state.
      setTimeout(() => {
        if (!anyVideoPlaying()) resumeAfterVideo()
      }, 0)
    }
    document.addEventListener("play", onVideoPlay, true)
    document.addEventListener("pause", onVideoStop, true)
    document.addEventListener("ended", onVideoStop, true)

    return () => {
      gestures.forEach((e) => document.removeEventListener(e, onGesture))
      document.removeEventListener("play", onVideoPlay, true)
      document.removeEventListener("pause", onVideoStop, true)
      document.removeEventListener("ended", onVideoStop, true)
    }
  }, [])

  return (
    <MusicToggle className="fixed bottom-5 right-5 z-[9999] h-11 w-11 rounded-full bg-black/60 text-white shadow-lg backdrop-blur hover:bg-black/80" />
  )
}
