"use client"

import { useEffect, useState } from "react"
import RegistrationPage from "@/components/registration-page"
import RegistrationCountdown from "@/components/registration-countdown"
import { registrationOpensAtMs } from "@/lib/registration-opening"

const secondsUntilOpen = (now: number) => Math.max(0, Math.ceil((registrationOpensAtMs - now) / 1000))

export type SlotStatus = { limit: number; left: number } | null

/**
 * Shows the countdown until registration opens, then swaps in the form by itself.
 * `serverNow` gives the first paint the right numbers, and stands in for the device
 * clock when that clock is clearly wrong.
 */
export default function RegistrationGate({ serverNow, slots }: { serverNow: number; slots: SlotStatus }) {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntilOpen(serverNow))

  useEffect(() => {
    const skew = serverNow - Date.now()
    const offset = Math.abs(skew) > 60_000 ? skew : 0
    // Hidden tabs skip ticks (their animations are paused anyway) and catch up on return.
    const tick = () => {
      if (!document.hidden) setSecondsLeft(secondsUntilOpen(Date.now() + offset))
    }
    tick()
    const id = setInterval(tick, 250)
    document.addEventListener("visibilitychange", tick)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [serverNow])

  useEffect(() => {
    if (secondsLeft === 0) window.scrollTo({ top: 0 })
  }, [secondsLeft === 0])

  return secondsLeft > 0 ? <RegistrationCountdown secondsLeft={secondsLeft} slots={slots} /> : <RegistrationPage slots={slots} />
}
