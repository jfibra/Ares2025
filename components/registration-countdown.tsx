"use client"

import Link from "next/link"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { ArrowLeft, CalendarDays, CalendarPlus, Mail, MapPin, Shirt, Ticket, UserCheck } from "lucide-react"
import { Particles, staggerContainer, staggerItem } from "@/components/motion"
import { CornerFlourish, GoldRule, Lotus, goldLattice, goldText } from "@/components/thai-ornaments"
import { registrationOpensAtMs } from "@/lib/registration-opening"

const ease = [0.22, 1, 0.36, 1] as const
const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"

// Built from parts so the server and the browser always print the same string.
const opensAtParts = Object.fromEntries(
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .formatToParts(registrationOpensAtMs)
    .map((part) => [part.type, part.value]),
)
const opensAtDate = `${opensAtParts.weekday}, ${opensAtParts.month} ${opensAtParts.day}, ${opensAtParts.year}`
const opensAtTime = `${opensAtParts.hour}:${opensAtParts.minute} ${opensAtParts.dayPeriod}`

const calendarStamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, "")
const calendarUrl =
  "https://calendar.google.com/calendar/render?" +
  new URLSearchParams({
    action: "TEMPLATE",
    text: "ARES 2027 registration opens",
    dates: `${calendarStamp(registrationOpensAtMs)}/${calendarStamp(registrationOpensAtMs + 30 * 60_000)}`,
    details: "Registration for the Asian Real Estate Summit 2027 opens now: https://asianrealestatesummit.com/registration",
  }).toString()

const prepare = [
  { icon: Mail, title: "Your LR email", text: "We use it to find you in our agent records." },
  { icon: Shirt, title: "A few details", text: "Birth date, WhatsApp number, and polo shirt size." },
  { icon: UserCheck, title: "Your team leader", text: "They receive your fee and confirm your seat." },
]

/** One digit that rolls down into place whenever it changes. */
function Digit({ char }: { char: string }) {
  return (
    <span className="relative inline-block h-[1.1em] w-[0.64em] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.span
          key={char}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease }}
          className={`absolute inset-0 flex items-center justify-center ${goldText}`}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function TimeCard({ value, label }: { value: number; label: string }) {
  const digits = String(value).padStart(2, "0").split("")
  return (
    <motion.div variants={staggerItem} className="group relative">
      <div
        aria-hidden
        className="absolute -inset-1 rounded-3xl bg-[#d4a437]/20 opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative overflow-hidden rounded-2xl border border-[#d4a437]/45 bg-gradient-to-b from-[#2a1650]/90 to-[#120a2e]/95 px-1 pb-3 pt-4 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md sm:rounded-3xl sm:pb-5 sm:pt-7">
        <div aria-hidden className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: goldLattice }} />
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#fdeeb5] to-transparent" />
        <div className="relative flex justify-center text-[2.5rem] font-black leading-none tabular-nums sm:text-6xl md:text-7xl lg:text-8xl">
          {digits.map((char, i) => (
            <Digit key={digits.length - i} char={char} />
          ))}
        </div>
        <p className="relative mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#f3d27a]/90 sm:mt-4 sm:text-xs sm:tracking-[0.35em]">
          {label}
        </p>
      </div>
    </motion.div>
  )
}

export default function RegistrationCountdown({
  secondsLeft,
  slots = null,
}: {
  secondsLeft: number
  slots?: { limit: number; left: number } | null
}) {
  const days = Math.floor(secondsLeft / 86400)
  const hours = Math.floor((secondsLeft % 86400) / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[#120a2e] font-sans text-white">
        <motion.img
          aria-hidden
          src="/bangkok.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.16 }}
          transition={{ duration: 28, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#120a2e]/90 via-[#3a0d2a]/75 to-[#120a2e]" />
        <div aria-hidden className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: goldLattice }} />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4a437]/20 blur-[140px] motion-safe:animate-float-slow"
        />
        <Particles count={55} color="243,210,122" />

        <div className="container relative z-10 mx-auto px-4 pb-20 pt-28 text-center sm:px-6 md:pt-36">
          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            {/* The summit's own mark leads the page */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease }}
              className="relative mx-auto flex w-fit items-center justify-center"
            >
              <div aria-hidden className="absolute -inset-x-10 -inset-y-6 rounded-full bg-[#d4a437]/25 blur-3xl" />
              <img
                src={LOGO_URL}
                alt="Asian Real Estate Summit"
                className="relative h-20 w-auto drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)] sm:h-28 md:h-36"
              />
              <span
                className={`relative ml-4 border-l border-[#d4a437]/60 pl-4 text-4xl font-black leading-none tracking-tight sm:ml-5 sm:pl-5 sm:text-5xl md:text-7xl ${goldText}`}
              >
                2027
              </span>
            </motion.div>
            <Lotus bloom className="mx-auto mt-5 h-8 w-14 text-[#f0c24b]" />

            <motion.div variants={staggerItem} className="mt-5 flex justify-center">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-[#d4a437]/50 bg-[#120a2e]/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#fbe7a1] backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#f0c24b] opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f0c24b]" />
                </span>
                Opening soon
              </span>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className={`mt-6 pb-2 text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-4xl md:text-6xl ${goldText}`}
            >
              Registration opens in
            </motion.h1>
            <motion.p variants={staggerItem} className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-xl">
              Seats for the Asian Real Estate Summit 2027 in Bangkok are almost here.
            </motion.p>

            {/* The countdown */}
            <motion.div
              variants={staggerContainer}
              role="timer"
              aria-label={`${days} days, ${hours} hours and ${minutes} minutes until registration opens`}
              className="relative mx-auto mt-10 max-w-4xl p-3 sm:p-6"
            >
              <CornerFlourish className="left-0 top-0" />
              <CornerFlourish className="right-0 top-0 rotate-90" />
              <CornerFlourish className="bottom-0 right-0 rotate-180" />
              <CornerFlourish className="bottom-0 left-0 -rotate-90" />
              <div aria-hidden className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                <TimeCard value={days} label="Days" />
                <TimeCard value={hours} label="Hours" />
                <TimeCard value={minutes} label="Minutes" />
                <TimeCard value={seconds} label="Seconds" />
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="mx-auto mt-8 max-w-xs">
              <GoldRule />
            </motion.div>

            <motion.p variants={staggerItem} className="mt-6 text-sm text-white/80 sm:text-base">
              Doors open <span className="font-semibold text-[#fbe7a1]">{opensAtDate}</span> at{" "}
              <span className="font-semibold text-[#fbe7a1]">{opensAtTime}</span> Philippine time
            </motion.p>

            {slots && slots.limit > 0 ? (
              <motion.div variants={staggerItem} className="mt-6 flex justify-center">
                <p className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl border border-[#f0c24b]/70 bg-[#d4a437]/15 px-5 py-3 text-sm text-white backdrop-blur sm:text-base">
                  <Ticket size={18} className="shrink-0 text-[#f0c24b]" />
                  <span>
                    Only <span className={`text-lg font-black sm:text-xl ${goldText}`}>{slots.limit.toLocaleString()} slots</span>{" "}
                    available.
                  </span>
                  <span className="font-semibold text-[#fbe7a1]">Be here when the doors open to reserve yours.</span>
                </p>
              </motion.div>
            ) : null}

            <motion.div variants={staggerItem} className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#fdeeb5] via-[#f0c24b] to-[#b8862b] px-7 py-3.5 text-sm font-bold text-[#2a1a3d] shadow-[0_10px_30px_-8px_rgba(212,164,55,0.7)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fdeeb5]"
              >
                <span aria-hidden className="absolute inset-y-0 w-1/3 bg-white/50 blur-md motion-safe:animate-shimmer" />
                <CalendarPlus size={18} className="relative" />
                <span className="relative">Remind me</span>
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#d4a437]/50 bg-[#120a2e]/60 px-7 py-3.5 text-sm font-semibold text-[#fbe7a1] backdrop-blur transition-colors duration-300 hover:bg-[#d4a437]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fdeeb5]"
              >
                <ArrowLeft size={16} /> Back to home
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <MapPin size={15} className="text-[#f0c24b]" /> Bangkok, Thailand
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={15} className="text-[#f0c24b]" /> July 13, 2027
              </span>
            </motion.div>

            {/* What to have ready */}
            <motion.div variants={staggerItem} className="mx-auto mt-14 max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#f3d27a]">Have these ready</p>
              <ul className="mt-5 grid gap-3 text-left sm:grid-cols-3 sm:gap-4">
                {prepare.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md transition-colors duration-300 hover:border-[#d4a437]/50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d4a437]/15 text-[#f0c24b]">
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{title}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-white/65">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}
