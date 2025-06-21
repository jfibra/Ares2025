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

  const timerComponents = Object.keys(timeLeft).map((interval, index) => {
    if (!timeLeft[interval]) {
      return null
    }

    const gradients = [
      "from-[#e22837] to-[#d41e2d]", // Red gradient
      "from-[#0078b6] to-[#005a8b]", // Blue gradient
      "from-[#ffd700] to-[#f59e0b]", // Gold gradient
      "from-[#e22837] to-[#0078b6]", // Red to Blue gradient
    ]

    return (
      <div key={interval} className="group relative mx-2 text-center">
        <div
          className={`bg-gradient-to-br ${gradients[index]} rounded-2xl p-6 min-w-[100px] shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border border-white/20 backdrop-blur-sm`}
        >
          <div className="text-4xl md:text-5xl font-black text-white mb-2 font-['Poppins']">{timeLeft[interval]}</div>
          <div className="text-sm md:text-base text-white/90 uppercase font-semibold tracking-wider">{interval}</div>
        </div>

        {/* Glow effect */}
        <div
          className={`absolute -inset-2 bg-gradient-to-br ${gradients[index]} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10`}
        />
      </div>
    )
  })

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 p-6">
      {timerComponents.length ? (
        <div className="flex flex-wrap justify-center gap-4">{timerComponents}</div>
      ) : (
        <div className="text-4xl text-white font-bold bg-gradient-to-r from-[#ffd700] to-[#f59e0b] bg-clip-text text-transparent">
          The event has started!
        </div>
      )}
    </div>
  )
}

export default CountdownTimer
