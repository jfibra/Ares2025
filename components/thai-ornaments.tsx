"use client"

// Thai-inspired ornaments shared by the registration page and the admin sign-in.

import { useId } from "react"
import { motion } from "framer-motion"

export const goldText = "bg-gradient-to-b from-[#fdeeb5] via-[#f0c24b] to-[#b8862b] bg-clip-text text-transparent"

// Four-petal flower lattice (the "prajam yam" motif used on Thai temples and silk).
const flowerTile = (stroke: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56' fill='none' stroke='${stroke}' stroke-width='1'>` +
      [0, 90, 180, 270]
        .map((a) => `<path transform='rotate(${a} 28 28)' d='M28 7C33 16 33 22 28 28C23 22 23 16 28 7Z'/>`)
        .join("") +
      `<circle cx='28' cy='28' r='2.5'/><path d='M0 28L28 0L56 28L28 56Z' stroke-opacity='.45'/>` +
      [
        [0, 0],
        [56, 0],
        [0, 56],
        [56, 56],
      ]
        .map(([x, y]) => `<path transform='translate(${x} ${y})' d='M0-5L5 0L0 5L-5 0Z'/>`)
        .join("") +
      `</svg>`,
  )}")`

export const goldLattice = flowerTile("#e8c15a")
export const brownLattice = flowerTile("#b8862b")

/** Lotus outline. With `bloom`, the petals draw themselves in from the centre outwards. */
export function Lotus({ className, bloom = false }: { className?: string; bloom?: boolean }) {
  const petal = "M0-30C11-16 11-2 0 8C-11-2-11-16 0-30Z"
  const draw = (order: number) =>
    bloom
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 0.9, delay: 0.2 + order * 0.18, ease: "easeOut" as const },
        }
      : {}
  return (
    <svg viewBox="-44 -34 88 50" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      {[-62, -32, 32, 62].map((a) => (
        <g key={a} transform={`rotate(${a} 0 8) scale(${Math.abs(a) > 40 ? 0.8 : 0.92})`}>
          <motion.path d={petal} {...draw(Math.abs(a) > 40 ? 2 : 1)} />
        </g>
      ))}
      <motion.path d={petal} fill="currentColor" fillOpacity="0.18" {...draw(0)} />
      <motion.path d="M-40 12Q0 18 40 12" {...draw(3)} />
    </svg>
  )
}

/** Line, diamond, line. */
export function GoldRule({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d4a437]" />
      <span className="h-2 w-2 rotate-45 bg-[#d4a437]" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d4a437]" />
    </div>
  )
}

/** A row of lotus petals, like the base of a temple pedestal. */
export function PetalEdge({ fill, className = "" }: { fill: string; className?: string }) {
  const id = useId()
  return (
    <svg aria-hidden className={`block h-7 w-full ${className}`}>
      <defs>
        <pattern id={id} width="44" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 28C2 16 14 12 22 0C30 12 42 16 44 28Z" fill={fill} />
          <path d="M0 28C2 16 14 12 22 0C30 12 42 16 44 28" fill="none" stroke="#d4a437" strokeWidth="1.5" />
          <path d="M12 28C13 21 18 18 22 11C26 18 31 21 32 28" fill="none" stroke="#d4a437" strokeOpacity="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="28" fill={`url(#${id})`} />
    </svg>
  )
}

export function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 40"
      className={`pointer-events-none absolute h-8 w-8 text-[#d4a437] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 38V12Q2 2 12 2H38" />
      <path d="M8 30V16Q8 8 16 8H30" strokeOpacity="0.55" />
      <path d="M14 14l4-4 4 4-4 4Z" fill="currentColor" stroke="none" />
    </svg>
  )
}
