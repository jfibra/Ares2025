"use client"

import { useEffect } from "react"
import { anyVideoPlaying, countsAsVideo, getAudio, pauseMusic, playMusic } from "@/lib/background-music"
import MusicToggle from "@/components/music-toggle"

export default function BackgroundMusic() {
  useEffect(() => {
    const audio = getAudio()
    if (!audio) return

    // Browsers block audio until the first user gesture. Keep listening for
    // gestures until the music has actually started once, so a first click
    // that goes to a video's play button doesn't lose us the chance.
    const gestures: (keyof DocumentEventMap)[] = ["pointerdown", "click", "touchstart", "keydown", "scroll", "wheel"]
    const stopListening = () => gestures.forEach((e) => document.removeEventListener(e, onGesture, true))
    const onGesture = () => {
      void playMusic().then((ok) => {
        if (ok) stopListening()
      })
    }
    gestures.forEach((e) => document.addEventListener(e, onGesture, { capture: true, passive: true }))
    void playMusic()

    // Media events don't bubble, so listen in the capture phase to catch
    // every <video> on the site, including ones mounted later.
    const onVideoPlay = (e: Event) => {
      if (countsAsVideo(e.target)) pauseMusic()
    }
    const onVideoStop = (e: Event) => {
      if (!countsAsVideo(e.target)) return
      // Defer so a video that is pausing/ending has updated its state.
      setTimeout(() => {
        if (!anyVideoPlaying()) void playMusic()
      }, 0)
    }
    document.addEventListener("play", onVideoPlay, true)
    document.addEventListener("pause", onVideoStop, true)
    document.addEventListener("ended", onVideoStop, true)
    // A video closed/unmounted while playing emits no "pause"; the modal close
    // in this site pauses first, but poll briefly after any DOM removal too.
    const observer = new MutationObserver(() => {
      if (audio.paused && !anyVideoPlaying()) void playMusic()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      stopListening()
      document.removeEventListener("play", onVideoPlay, true)
      document.removeEventListener("pause", onVideoStop, true)
      document.removeEventListener("ended", onVideoStop, true)
      observer.disconnect()
    }
  }, [])

  return (
    <MusicToggle className="fixed bottom-5 right-5 z-[10000] h-11 w-11 rounded-full bg-black/60 text-white shadow-lg backdrop-blur hover:bg-black/80" />
  )
}
