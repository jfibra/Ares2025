"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Check, Copy, Download, Link2, Loader2, TriangleAlert } from "lucide-react"

// The QR code agents scan to open the registration page, with the ARES mark in the middle.
// It is drawn here in the browser and can be downloaded as a picture for posters and chats.

const LOGO_SRC = "/android-chrome-512x512.png" // the ARES mark on its own, no wording
const SIZE = 1200 // pixels of the downloaded picture: sharp enough to print
/** The middle of the code the logo covers. The code is made with the strongest error correction, which still reads with this much hidden. */
const LOGO_SHARE = 0.22
const LIVE_SITE = process.env.NEXT_PUBLIC_BASE_URL || "https://asianrealestatesummit.com"

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("The logo could not be loaded"))
    image.src = src
  })

/** Draws the code and puts the logo on a white rounded tile in its center. Returns a PNG as a data URL. */
async function drawQr(link: string): Promise<string> {
  const canvas = document.createElement("canvas")
  await QRCode.toCanvas(canvas, link, { width: SIZE, margin: 3, errorCorrectionLevel: "H", color: { dark: "#1a0d3d", light: "#ffffff" } })
  const context = canvas.getContext("2d")
  if (!context) throw new Error("This browser cannot draw the QR code")
  const size = canvas.width
  const tile = Math.round(size * LOGO_SHARE)
  const start = Math.round((size - tile) / 2)
  const radius = tile * 0.16
  context.fillStyle = "#ffffff"
  context.beginPath()
  context.moveTo(start + radius, start)
  context.arcTo(start + tile, start, start + tile, start + tile, radius)
  context.arcTo(start + tile, start + tile, start, start + tile, radius)
  context.arcTo(start, start + tile, start, start, radius)
  context.arcTo(start, start, start + tile, start, radius)
  context.closePath()
  context.fill()
  const logo = await loadImage(LOGO_SRC)
  const inset = tile * 0.12
  context.drawImage(logo, start + inset, start + inset, tile - inset * 2, tile - inset * 2)
  return canvas.toDataURL("image/png")
}

export default function AgentQrPanel() {
  const [link, setLink] = useState("")
  const [qr, setQr] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState(false)

  // The code must open the live site, also when the admin is looking at a test copy on their own computer.
  useEffect(() => {
    const here = window.location
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(here.hostname) || here.hostname.endsWith(".localhost")
    setLink(`${local ? LIVE_SITE.replace(/\/$/, "") : here.origin}/registration`)
  }, [])

  useEffect(() => {
    if (!link) return
    let cancelled = false
    setFailed(false)
    drawQr(link)
      .then((url) => (cancelled ? null : setQr(url)))
      .catch((error) => {
        console.error("QR code could not be drawn:", error)
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [link])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const goldButton =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#8a6417] bg-gradient-to-r from-[#b8862b] via-[#f3d27a] to-[#b8862b] px-5 text-sm font-bold text-[#2a1408] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <section className="mt-4 grid gap-8 rounded-2xl border border-[#d4a437]/50 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(58,13,42,0.5)] sm:p-8 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b8862b]">For all agents</p>
        <h2 className="mt-2 text-2xl font-black text-[#2a1458]">Agent registration QR code</h2>
        <p className="mt-3 max-w-xl leading-relaxed text-[#5c4a2a]">
          Agents scan this with their phone camera to open the registration page. Download it and put it on posters, slides or
          group chats. It never changes, so a printed copy keeps working.
        </p>

        <label htmlFor="agent-registration-link" className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#4a3413]">
          <Link2 size={16} className="text-[#b8862b]" /> The page it opens
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="agent-registration-link"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#e3d3a8] bg-[#fdfaf1] px-3 font-mono text-xs text-[#2a1a3d] outline-none focus:border-[#c9972f]"
          />
          <button type="button" onClick={copy} disabled={!link} className={goldButton}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {qr ? (
            <a href={qr} download="ares-2027-agent-registration-qr.png" className={goldButton}>
              <Download size={16} /> Download QR code (PNG)
            </a>
          ) : (
            <span className={`${goldButton} opacity-50`}>
              <Loader2 size={16} className="animate-spin" /> Preparing the QR code
            </span>
          )}
          <span className="text-sm text-[#7a6a4a]">1200 × 1200 pixels, good for printing.</span>
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#7a6a4a]">
          Team leaders and guests have their own links, on the Settings and Guests pages. This code is only for agents.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[18rem]">
        <div className="rounded-2xl border border-[#d4a437]/60 bg-white p-3 shadow-[0_18px_40px_-24px_rgba(58,13,42,0.5)]">
          {failed ? (
            <p role="alert" className="flex aspect-square items-center justify-center gap-2 px-4 text-center text-sm font-medium text-[#9a1c15]">
              <TriangleAlert size={18} className="shrink-0" /> The QR code could not be drawn. Reload the page to try again.
            </p>
          ) : qr ? (
            <img src={qr} alt={`QR code that opens ${link}`} className="h-auto w-full" />
          ) : (
            <div className="grid aspect-square place-items-center text-[#b8862b]">
              <Loader2 size={28} className="animate-spin" />
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6a4a]">Scan to register</p>
      </div>
    </section>
  )
}
