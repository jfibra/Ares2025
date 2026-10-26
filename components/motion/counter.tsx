"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useMotionValue, useReducedMotion, useTransform, motion } from "framer-motion"

type CounterProps = {
  to: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

/** Counts from 0 to `to` the first time it enters the viewport. */
export function Counter({ to, suffix = "", prefix = "", duration = 1.8, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20% 0px" })
  const reduce = useReducedMotion()
  const value = useMotionValue(0)
  const rounded = useTransform(value, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      value.set(to)
      return
    }
    const controls = animate(value, to, { duration, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [inView, to, duration, reduce, value])

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  )
}
