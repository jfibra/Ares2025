"use client"

import { useState, useEffect } from "react"

const StickyCountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearTimeout(timer)
  })

  function calculateTimeLeft() {
    const difference = +new Date("2025-07-01T00:00:00+08:00") - +new Date()
    let timeLeft: Record<string, number> = {}

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    return timeLeft
  }

  const timerComponents = Object.keys(timeLeft).map((interval) => (
    <div key={interval} className="mx-2 text-center">
      <div className="font-bold text-white text-sm">{timeLeft[interval]}</div>
      <div className="text-white text-xs uppercase">{interval}</div>
    </div>
  ))

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white flex justify-center items-center py-2 z-[1000]">
      <div className="text-sm mr-4">Event Starts In:</div>
      {timerComponents}
    </div>
  )
}

export default StickyCountdownTimer
