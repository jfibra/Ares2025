"use client"

import type React from "react"

type MarqueeProps = {
  items: React.ReactNode[]
  className?: string
  /** Seconds for one full loop */
  speed?: number
  reverse?: boolean
}

/** Infinite horizontal ticker. Pauses on hover. */
export function Marquee({ items, className, speed = 28, reverse = false }: MarqueeProps) {
  const row = [...items, ...items]
  return (
    <div className={`group relative flex w-full overflow-hidden ${className ?? ""}`}>
      <div
        className="flex shrink-0 items-center gap-10 pr-10 motion-safe:animate-ticker motion-safe:group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {row.map((item, i) => (
          <div key={i} className="flex items-center gap-10 whitespace-nowrap" aria-hidden={i >= items.length}>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
