"use client"

import type React from "react"
import { useRef } from "react"
import { motion, useReducedMotion, useSpring } from "framer-motion"

type MagneticProps = {
  children: React.ReactNode
  className?: string
  /** How far (px) the element can be pulled toward the cursor */
  strength?: number
}

/** Pulls its child toward the cursor while hovered, then springs back. */
export function Magnetic({ children, className, strength = 18 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 180, damping: 14, mass: 0.4 })
  const y = useSpring(0, { stiffness: 180, damping: 14, mass: 0.4 })

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch" || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    x.set((dx / rect.width) * strength * 2)
    y.set((dy / rect.height) * strength * 2)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} style={{ x, y }} className={`inline-block ${className ?? ""}`}>
      {children}
    </motion.div>
  )
}
