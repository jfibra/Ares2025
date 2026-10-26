"use client"

import type React from "react"
import { useRef } from "react"
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion"

type TiltCardProps = {
  children: React.ReactNode
  className?: string
  /** Max rotation in degrees */
  intensity?: number
  /** Colour of the spotlight that follows the cursor */
  glow?: string
  style?: React.CSSProperties
}

/**
 * A card that tilts in 3D toward the cursor and shows a soft spotlight where
 * the pointer is. Falls back to a static card for touch and reduced motion.
 */
export function TiltCard({ children, className, intensity = 10, glow = "rgba(255,255,255,0.18)", style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const rotateX = useSpring(0, { stiffness: 200, damping: 20 })
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 })
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)

  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mouseX}% ${mouseY}%, ${glow}, transparent 60%)`

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch" || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    mouseX.set(px * 100)
    mouseY.set(py * 100)
    rotateY.set((px - 0.5) * intensity * 2)
    rotateX.set((0.5 - py) * intensity * 2)
  }

  const onLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    mouseX.set(50)
    mouseY.set(50)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 900, ...style }}
      className={`relative ${className ?? ""}`}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
    </motion.div>
  )
}
