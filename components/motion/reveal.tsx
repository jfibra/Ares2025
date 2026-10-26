"use client"

import type React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

type Direction = "up" | "down" | "left" | "right" | "none"

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
}

type RevealProps = {
  children: React.ReactNode
  className?: string
  direction?: Direction
  delay?: number
  duration?: number
  once?: boolean
  /** Portion of the element that must be visible before it animates */
  amount?: number
  as?: "div" | "section" | "span" | "p" | "h2" | "h3" | "li"
}

/** Fades and slides an element in the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.25,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  const { x, y } = reduce ? offsets.none : offsets[direction]

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, x, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

type StaggerProps = {
  children: React.ReactNode
  className?: string
  amount?: number
}

/** Wrap a list of `motion.*` children using `staggerItem` to cascade them in. */
export function Stagger({ children, className, amount = 0.2 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  )
}
