"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"

interface CustomLightboxProps {
  open: boolean
  onClose: () => void
  currentImage: string
  /** Optional label shown under the photo, e.g. "ARES 2025 - DAY 1 · #12" */
  caption?: string
  onPrev: () => void
  onNext: () => void
  imageCount: number
  currentIndex: number
}

/** A horizontal drag shorter than this is a tap, not a swipe. */
const SWIPE_THRESHOLD_PX = 50

const CustomLightbox: React.FC<CustomLightboxProps> = ({
  open,
  onClose,
  currentImage,
  caption,
  onPrev,
  onNext,
  imageCount,
  currentIndex,
}) => {
  const [scale, setScale] = useState(1)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const handleZoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.2, 3)), [])
  const handleZoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.2, 0.5)), [])

  // A new photo starts unzoomed, otherwise the zoom carries over to the next one.
  useEffect(() => {
    setScale(1)
  }, [currentImage])

  // Escape closes, arrows page. preventDefault stops the arrows scrolling the
  // page behind the overlay.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault()
          onClose()
          break
        case "ArrowLeft":
          event.preventDefault()
          onPrev()
          break
        case "ArrowRight":
          event.preventDefault()
          onNext()
          break
        case "+":
        case "=":
          event.preventDefault()
          handleZoomIn()
          break
        case "-":
          event.preventDefault()
          handleZoomOut()
          break
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose, onPrev, onNext, handleZoomIn, handleZoomOut])

  // Keep the page behind the overlay from scrolling while it is open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.changedTouches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return

    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y

    // Ignore mostly-vertical drags so scrolling gestures don't page the gallery.
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return
    if (dx > 0) onPrev()
    else onNext()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption ? `Photo viewer: ${caption}` : "Photo viewer"}
      className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[9999] backdrop-blur-sm"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button - Always visible at top right */}
      <button
        aria-label="Close photo viewer (Esc)"
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] text-white hover:text-[#ffd700] bg-black/60 hover:bg-black/80 rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-2xl"
      >
        <X size={32} />
      </button>

      <div className="relative w-[90%] h-[80%] flex items-center justify-center">
        <button
          aria-label="Previous photo (left arrow)"
          onClick={onPrev}
          className="absolute left-4 z-50 text-white bg-black/60 hover:bg-black/80 rounded-full p-3 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={currentImage || "/placeholder.svg"}
            alt={caption || `Event photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-transform duration-300 ease-in-out"
            style={{ transform: `scale(${scale})` }}
            draggable={false}
          />
        </div>

        <button
          aria-label="Next photo (right arrow)"
          onClick={onNext}
          className="absolute right-4 z-50 text-white bg-black/60 hover:bg-black/80 rounded-full p-3 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {caption && (
        <div className="mt-4 text-white/90 text-sm md:text-base font-semibold bg-black/60 px-4 py-2 rounded-full">
          {caption}
        </div>
      )}

      <div className="mt-6 flex justify-center items-center w-full gap-6">
        <button
          aria-label="Zoom out (minus key)"
          onClick={handleZoomOut}
          className="text-white hover:text-[#ffd700] bg-black/60 hover:bg-black/80 rounded-full p-3 transition-all duration-300 hover:scale-110"
        >
          <ZoomOut size={24} />
        </button>
        <button
          aria-label="Zoom in (plus key)"
          onClick={handleZoomIn}
          className="text-white hover:text-[#ffd700] bg-black/60 hover:bg-black/80 rounded-full p-3 transition-all duration-300 hover:scale-110"
        >
          <ZoomIn size={24} />
        </button>
        <div className="text-white text-lg font-semibold bg-black/60 px-4 py-2 rounded-full">
          {`${currentIndex + 1} of ${imageCount}`}
        </div>
      </div>
    </div>
  )
}

export default CustomLightbox
