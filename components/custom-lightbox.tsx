"use client"

import type React from "react"
import { useState } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"

interface CustomLightboxProps {
  open: boolean
  onClose: () => void
  currentImage: string
  onPrev: () => void
  onNext: () => void
  imageCount: number
  currentIndex: number
}

const CustomLightbox: React.FC<CustomLightboxProps> = ({
  open,
  onClose,
  currentImage,
  onPrev,
  onNext,
  imageCount,
  currentIndex,
}) => {
  const [scale, setScale] = useState(1)

  const handleZoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.2, 3))
  const handleZoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.2, 0.5))

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[9999] backdrop-blur-sm">
      {/* Close button - Always visible at top right */}
      <button
        aria-label="close"
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] text-white hover:text-[#ffd700] bg-black/60 hover:bg-black/80 rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-2xl"
      >
        <X size={32} />
      </button>

      <div className="relative w-[90%] h-[80%] flex items-center justify-center">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="absolute left-4 z-50 text-white bg-black/60 hover:bg-black/80 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={currentImage || "/placeholder.svg"}
            alt={`Event photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-transform duration-300 ease-in-out"
            style={{ transform: `scale(${scale})` }}
          />
        </div>

        <button
          onClick={onNext}
          disabled={currentIndex === imageCount - 1}
          className="absolute right-4 z-50 text-white bg-black/60 hover:bg-black/80 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      <div className="mt-6 flex justify-center items-center w-full gap-6">
        <button
          onClick={handleZoomOut}
          className="text-white hover:text-[#ffd700] bg-black/60 hover:bg-black/80 rounded-full p-3 transition-all duration-300 hover:scale-110"
        >
          <ZoomOut size={24} />
        </button>
        <button
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
