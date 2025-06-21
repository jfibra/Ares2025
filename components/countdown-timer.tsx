"use client"

import { useState, useEffect } from "react"

const CountdownTimer = () => {
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

  const colors = ["#ea584f", "#107eb4", "#ea584f", "#107eb4"] // Alternating red and blue

  const timerComponents = Object.keys(timeLeft).map((interval, index) => {
    if (!timeLeft[interval]) {
      return null
    }

    return (
      <div
        key={interval}
        className="m-2 text-center rounded-lg p-4 min-w-[80px] shadow-lg"
        style={{ backgroundColor: colors[index] }}
      >
        <div className="text-4xl font-bold text-white">{timeLeft[interval]}</div>
        <div className="text-xl text-white uppercase">{interval}</div>
      </div>
    )
  })

  return (
    <div className="flex flex-wrap justify-start items-center p-5 mt-12">
      {timerComponents.length ? timerComponents : <div className="text-4xl text-white">The event has started!</div>}
    </div>
  )
}

export default CountdownTimer
