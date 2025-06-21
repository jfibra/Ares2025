"use client"

import { useEffect } from "react"

/**
 * Client-only analytics wrapper that loads Vercel Analytics safely
 * This prevents any SSR/hydration issues during deployment
 */
export default function AnalyticsWrapper() {
  useEffect(() => {
    // Only load analytics in the browser after hydration
    const loadAnalytics = async () => {
      try {
        const { Analytics } = await import("@vercel/analytics/react")
        const { SpeedInsights } = await import("@vercel/speed-insights/next")

        // Create containers for analytics
        const analyticsContainer = document.createElement("div")
        const speedInsightsContainer = document.createElement("div")

        document.body.appendChild(analyticsContainer)
        document.body.appendChild(speedInsightsContainer)

        // Initialize analytics
        const { createRoot } = await import("react-dom/client")

        const analyticsRoot = createRoot(analyticsContainer)
        const speedInsightsRoot = createRoot(speedInsightsContainer)

        analyticsRoot.render(Analytics({}))
        speedInsightsRoot.render(SpeedInsights({}))
      } catch (error) {
        console.warn("Analytics failed to load:", error)
      }
    }

    loadAnalytics()
  }, [])

  return null // This component doesn't render anything visible
}
