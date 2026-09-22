"use client"

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

/**
 * Client-only analytics. Both components render nothing and no-op outside the
 * browser, so they can sit in the tree directly.
 */
export default function AnalyticsWrapper() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
