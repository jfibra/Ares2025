"use client"

import { useEffect, useState } from "react"
import { Clock, TriangleAlert } from "lucide-react"
import { UNPAID_WINDOW, paymentDeadlineMs } from "@/lib/unpaid-rule"

const deadlineFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" })
const two = (value: number) => String(value).padStart(2, "0")

/**
 * Live countdown of the 3 days an agent has to pay, counted from when they registered.
 * Gold while there is time, red in the last 12 hours, and "Overdue" once it has run out
 * (the registration is then removed at the next hourly check).
 */
export function PaymentCountdown({ registrationDate }: { registrationDate: string }) {
  const deadline = paymentDeadlineMs(registrationDate)
  // Empty until the page is in the browser, so the server and the browser never disagree on the time.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (now === null) return <span className="text-xs text-[#7a6a4a]">…</span>

  const left = deadline - now
  const due = `Pay by ${deadlineFormat.format(new Date(deadline))}`
  if (left <= 0) {
    return (
      <div className="min-w-[9.5rem]">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-800">
          <TriangleAlert size={13} /> Overdue
        </span>
        <p className="mt-1 text-xs text-[#7a6a4a]">The {UNPAID_WINDOW} are up. This registration will be removed.</p>
      </div>
    )
  }

  const seconds = Math.floor(left / 1000)
  const urgent = left <= 12 * 3_600_000
  return (
    <div className="min-w-[9.5rem]">
      <span
        role="timer"
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums ${
          urgent ? "border-red-200 bg-red-50 text-red-800" : "border-[#e3d3a8] bg-[#fdf3d7] text-[#8a5a00]"
        }`}
      >
        <Clock size={13} /> {Math.floor(seconds / 3600)}h {two(Math.floor((seconds % 3600) / 60))}m {two(seconds % 60)}s left
      </span>
      <p className="mt-1 whitespace-nowrap text-xs text-[#7a6a4a]">{due}</p>
    </div>
  )
}
