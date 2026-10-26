"use client"

import { useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion"
import { ChevronUp } from "lucide-react"

/** Floating back-to-top button with a ring that fills as you read down the page. */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })

  useMotionValueEvent(scrollY, "change", (y) => setIsVisible(y > 300))

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ y: -4, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="fixed bottom-5 right-5 z-[1000] grid h-12 w-12 place-items-center rounded-full bg-gray-900 text-white shadow-xl"
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" aria-hidden>
            <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
            <motion.circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              stroke="url(#totop-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
            <defs>
              <linearGradient id="totop-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e22837" />
                <stop offset="50%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#0078b6" />
              </linearGradient>
            </defs>
          </svg>
          <ChevronUp size={22} className="relative" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default ScrollToTop
