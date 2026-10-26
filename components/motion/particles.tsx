"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

type ParticlesProps = {
  className?: string
  count?: number
  color?: string
}

/**
 * Lightweight canvas particle field: slow drifting dots that are gently
 * repelled by the cursor and connected by faint lines when close together.
 *
 * The animation loop only runs while the canvas is on screen and the tab is
 * visible, so a particle field in the hero stops costing frames once the
 * visitor scrolls down to the rest of the page.
 */
export function Particles({ className, count = 70, color = "255,255,255" }: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduce) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0
    let h = 0
    let raf = 0
    let running = false
    let visible = true // IntersectionObserver: canvas is within the viewport
    let tabVisible = !document.hidden
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: -9999, y: -9999 }

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number }
    let pts: P[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(count * Math.min(1, w / 1200))
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.08,
        r: Math.random() * 1.6 + 0.6,
        a: Math.random() * 0.5 + 0.25,
      }))
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 140 * 140) {
          const d = Math.sqrt(d2) || 1
          const f = (140 - d) / 140
          p.vx += (dx / d) * f * 0.12
          p.vy += (dy / d) * f * 0.12
        }
        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color},${p.a})`
        ctx.fill()
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < 110 * 110) {
            ctx.strokeStyle = `rgba(${color},${(1 - Math.sqrt(d2) / 110) * 0.18})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(raf)
    }
    const update = () => {
      if (visible && tabVisible) start()
      else stop()
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        update()
      },
      { threshold: 0 },
    )
    io.observe(canvas)
    const onVisibility = () => {
      tabVisible = !document.hidden
      update()
    }
    document.addEventListener("visibilitychange", onVisibility)

    resize()
    update()
    window.addEventListener("resize", resize)
    const parent = canvas.parentElement ?? canvas
    parent.addEventListener("pointermove", onMove)
    parent.addEventListener("pointerleave", onLeave)
    return () => {
      stop()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", resize)
      parent.removeEventListener("pointermove", onMove)
      parent.removeEventListener("pointerleave", onLeave)
    }
  }, [count, color, reduce])

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`} aria-hidden />
}
