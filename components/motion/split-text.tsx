"use client"

import { motion, useReducedMotion } from "framer-motion"

type SplitTextProps = {
  text: string
  className?: string
  /** Seconds before the first word starts */
  delay?: number
  /** Seconds between each word */
  stagger?: number
  /** Classes applied to each word (use for gradient text, which can't be inherited through the masks) */
  wordClassName?: string
}

/**
 * Renders `text` as individually animated words that rise and un-blur in
 * sequence. Each word is wrapped in an overflow-hidden span so it looks like
 * it slides up from behind a mask.
 */
export function SplitText({ text, className, delay = 0, stagger = 0.06, wordClassName = "" }: SplitTextProps) {
  const reduce = useReducedMotion()
  const words = text.split(" ")

  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`inline-block will-change-transform ${wordClassName}`}
            initial={reduce ? { opacity: 0 } : { y: "110%", opacity: 0, rotate: 4 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-hidden
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? <span aria-hidden>&nbsp;</span> : null}
        </span>
      ))}
    </span>
  )
}
