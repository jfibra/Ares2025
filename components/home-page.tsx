"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import {
  MapPin,
  Mail,
  Phone,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Users,
  Award,
  ArrowRight,
  CalendarDays,
  Sparkles,
  Loader2,
  Camera,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import CustomLightbox from "./custom-lightbox"
import { Reveal, Stagger, staggerItem, SplitText, Counter, TiltCard, Magnetic, Marquee, Particles } from "./motion"
import {
  ares2025Photos,
  getRandomHighlights,
  homepageHighlights,
  totalPhotoCount,
  type GalleryPhoto,
} from "@/lib/gallery-albums"

// Served from /public: the original S3 teaser was 86 MB (14 Mbps); the 720p
// re-encode is a fraction of that, with a faststart header so playback begins
// immediately instead of after a long buffer.
const TEASER_URL = "/teaser.mp4"
const TEASER_POSTER = "/teaser-poster.jpg"
const HERO_VIDEO = "/thailand-bg.mp4"
const HERO_POSTER = "/bangkok.jpg"
const LOGO_URL = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"

const tickerItems = [
  "Asian Real Estate Summit",
  "Bangkok, Thailand",
  "July 1 – 2, 2025",
  "1,000+ Industry Professionals",
  "12 Expert Speakers",
  "Powered by Filipino Homes",
]

const stats = [
  {
    value: 1000,
    suffix: "+",
    label: "Industry Professionals",
    detail: "Developers, brokers, investors and proptech leaders in one room",
    icon: Users,
    from: "#e22837",
    to: "#ff6b6b",
  },
  {
    value: 12,
    suffix: "",
    label: "Expert Speakers",
    detail: "Keynotes and panels from the region's most respected voices",
    icon: Award,
    from: "#0078b6",
    to: "#38bdf8",
  },
  {
    value: 2,
    suffix: "",
    label: "Days of Excellence",
    detail: "July 1 – 2, 2025 in the heart of Bangkok, Thailand",
    icon: CalendarDays,
    from: "#f59e0b",
    to: "#ffd700",
  },
  {
    value: totalPhotoCount,
    suffix: "+",
    label: "Captured Moments",
    detail: "Every highlight, now live in the ARES photo gallery",
    icon: Camera,
    from: "#672e91",
    to: "#a855f7",
  },
]

const formatTime = (secs: number) => {
  if (!Number.isFinite(secs)) return "0:00"
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

type TeaserControlsProps = {
  videoRef: React.RefObject<HTMLVideoElement>
  isPlaying: boolean
  isMuted: boolean
  togglePlay: () => void
  toggleMute: () => void
}

/**
 * Seek bar, timecode and buttons for the intro player. Lives in its own
 * component so the video's `timeupdate` events (several per second) only
 * re-render this small subtree instead of the whole homepage.
 */
function TeaserControls({ videoRef, isPlaying, isMuted, togglePlay, toggleMute }: TeaserControlsProps) {
  const [progress, setProgress] = useState(0) // 0..1
  const [time, setTime] = useState({ current: 0, duration: 0 })

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const sync = () => {
      setTime({ current: v.currentTime, duration: v.duration })
      setProgress(v.duration ? v.currentTime / v.duration : 0)
    }
    v.addEventListener("timeupdate", sync)
    v.addEventListener("loadedmetadata", sync)
    v.addEventListener("seeked", sync)
    if (v.readyState >= 1) sync()
    return () => {
      v.removeEventListener("timeupdate", sync)
      v.removeEventListener("loadedmetadata", sync)
      v.removeEventListener("seeked", sync)
    }
  }, [videoRef])

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * v.duration
    setProgress(ratio)
  }

  return (
    <>
      <div
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        onClick={seekTo}
        className="group/bar relative mb-3 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#e22837] via-[#ffd700] to-[#0078b6]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <span className="ml-1 text-xs font-medium tabular-nums text-white/80">
            {formatTime(time.current)} / {formatTime(time.duration)}
          </span>
        </div>
        {isMuted && (
          <button
            onClick={toggleMute}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Tap for sound
          </button>
        )}
      </div>
    </>
  )
}

const HomePage = () => {
  const reduce = useReducedMotion()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
  const [submitting, setSubmitting] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const bgVideoRef = useRef<HTMLVideoElement>(null)
  const [hasSeenVideoToday, setHasSeenVideoToday] = useState(false)
  // While the intro is up, the hero underneath skips its background video and
  // particle canvas so the teaser gets all of the bandwidth and GPU.
  const introOpen = showVideoModal && !hasSeenVideoToday

  // Check if user has seen video today
  useEffect(() => {
    const today = new Date().toDateString()
    const lastSeen = localStorage.getItem("ares-video-seen")
    // `?intro=0` links straight to the page without the teaser.
    const skip = new URLSearchParams(window.location.search).get("intro") === "0"
    if (lastSeen === today || skip) {
      setHasSeenVideoToday(true)
      setShowVideoModal(false)
    }
  }, [])

  // Server-renders the curated ARES 2025 set, then swaps in a random pick once
  // mounted, so the grid differs on every page load. Randomising during render
  // would not match the server markup. The grid and the lightbox read the same
  // list, so clicking a tile opens that tile's photo.
  const [images, setImages] = useState<GalleryPhoto[]>(homepageHighlights)
  useEffect(() => {
    setImages(getRandomHighlights())
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showVideoModal ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showVideoModal])

  // Keep the hero background still for people who prefer reduced motion.
  // The video only mounts after the intro closes, so re-run then as well.
  useEffect(() => {
    const v = bgVideoRef.current
    if (!v) return
    if (reduce) v.pause()
    else v.play().catch(() => {})
  }, [reduce, introOpen])

  // ---- Page scroll progress bar -------------------------------------------
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })

  // ---- Hero parallax: scroll + pointer --------------------------------------
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const bgY = useTransform(heroProgress, [0, 1], ["0%", reduce ? "0%" : "28%"])
  const bgScale = useTransform(heroProgress, [0, 1], [1.08, reduce ? 1.08 : 1.25])
  const contentY = useTransform(heroProgress, [0, 1], [0, reduce ? 0 : 160])
  const contentOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

  const pointerX = useMotionValue(0) // -1 .. 1
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 60, damping: 18 })
  const smoothY = useSpring(pointerY, { stiffness: 60, damping: 18 })
  const bgShiftX = useTransform(smoothX, (v) => v * -18)
  const bgShiftY = useTransform(smoothY, (v) => v * -12)
  const orbAX = useTransform(smoothX, (v) => v * 40)
  const orbAY = useTransform(smoothY, (v) => v * 30)
  const orbBX = useTransform(smoothX, (v) => v * -60)
  const orbBY = useTransform(smoothY, (v) => v * -40)
  const cardX = useTransform(smoothX, (v) => v * 14)
  const cardY = useTransform(smoothY, (v) => v * 10)

  const onHeroPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType === "touch") return
    const rect = e.currentTarget.getBoundingClientRect()
    pointerX.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    pointerY.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
  const onHeroPointerLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  // ---- Video modal controls -------------------------------------------------
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const closeVideoModal = () => {
    const today = new Date().toDateString()
    localStorage.setItem("ares-video-seen", today)
    setHasSeenVideoToday(true)
    setShowVideoModal(false)
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Keyboard shortcuts while the intro is open: Esc closes, Space toggles, M mutes
  useEffect(() => {
    if (!introOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVideoModal()
      if (e.key === " ") {
        e.preventDefault()
        togglePlay()
      }
      if (e.key.toLowerCase() === "m") toggleMute()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introOpen, isPlaying, isMuted])

  const openTeaser = () => {
    setHasSeenVideoToday(false)
    setShowVideoModal(true)
  }

  // ---- Lightbox ---------------------------------------------------------------
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }
  // A hero tile opens its own photo; paging from there continues through the
  // homepage grid.
  const [heroLightboxPhoto, setHeroLightboxPhoto] = useState<GalleryPhoto | null>(null)
  const lightboxPhoto = heroLightboxPhoto ?? images[currentImageIndex]
  const openHeroPhoto = (photo: GalleryPhoto) => {
    setHeroLightboxPhoto(photo)
    setLightboxOpen(true)
  }
  const handleLightboxClose = () => {
    setLightboxOpen(false)
    setHeroLightboxPhoto(null)
  }
  const handleLightboxPrev = () => {
    setHeroLightboxPhoto(null)
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }
  const handleLightboxNext = () => {
    setHeroLightboxPhoto(null)
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  // ---- Contact form -----------------------------------------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const response = await fetch("https://api.leuteriorealty.com/ares/v1/public/api/ares/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        alert("Your message has been sent successfully!")
        setFormData({ name: "", email: "", phone: "", message: "" })
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Something went wrong. Please try again later.")
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Hero slideshow ---------------------------------------------------------
  // Three tiles; every second one of them (in turn) crossfades to a fresh
  // photo, so each tile changes every three seconds. Paused while the intro is
  // open, while the tab is hidden, and for people who prefer reduced motion.
  const [heroCards, setHeroCards] = useState<GalleryPhoto[]>(() => homepageHighlights.slice(0, 3))
  useEffect(() => {
    setHeroCards(images.slice(0, 3))
    // Seed from the random pick once; the slideshow takes over from there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const heroCardsRef = useRef<GalleryPhoto[]>(heroCards)
  heroCardsRef.current = heroCards
  useEffect(() => {
    if (reduce || introOpen) return
    let tile = 0
    let cancelled = false
    const tick = () => {
      if (document.hidden) return
      const pool = ares2025Photos
      let next: GalleryPhoto
      do {
        next = pool[Math.floor(Math.random() * pool.length)]
      } while (heroCardsRef.current.some((p) => p.thumb === next.thumb))
      const slot = tile
      tile = (tile + 1) % 3
      // Decode first so the crossfade never shows a blank tile.
      const img = new Image()
      img.src = next.thumb
      const swap = () => {
        if (cancelled) return
        setHeroCards((cards) => cards.map((p, i) => (i === slot ? next : p)))
      }
      if (img.decode) img.decode().then(swap, swap)
      else img.onload = swap
    }
    const id = window.setInterval(tick, 1000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [reduce, introOpen])

  return (
    <div className="flex-grow overflow-hidden">
      {/* Scroll progress bar */}
      <motion.div
        aria-hidden
        className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left bg-gradient-to-r from-[#e22837] via-[#ffd700] to-[#0078b6]"
        style={{ scaleX: progress }}
      />

      {/* Opening intro: teaser video */}
      <AnimatePresence>
        {introOpen && (
          <motion.div
            key="video-modal"
            role="dialog"
            aria-modal="true"
            aria-label="ARES 2027 welcome"
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#05070d] p-4 text-white md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
            transition={{ duration: 0.6 }}
          >
            {/* Cinematic backdrop: blurred poster + drifting colour + grain grid */}
            <motion.div
              aria-hidden
              className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-2xl"
              style={{ backgroundImage: `url(${TEASER_POSTER})` }}
              initial={{ scale: 1.25 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 12, ease: "linear" }}
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#05070d]/70 via-[#05070d]/40 to-[#05070d]" />
            <div aria-hidden className="dot-grid absolute inset-0 opacity-50" />
            <div aria-hidden className="pointer-events-none absolute -left-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-[#0078b6]/35 blur-[140px] motion-safe:animate-float-slow" />
            <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#e22837]/35 blur-[140px] motion-safe:animate-float-slow [animation-delay:-5s]" />
            <Particles count={28} />

            {/* Close */}
            <motion.button
              onClick={closeVideoModal}
              aria-label="Close and enter website"
              className="absolute right-5 top-5 z-20 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 md:right-8 md:top-8"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.92 }}
            >
              <X size={22} />
            </motion.button>

            <div className="relative z-10 grid w-full max-w-[88rem] items-center gap-8 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:gap-12">
              {/* Copy */}
              <div className="order-2 text-center lg:order-1 lg:text-left">
                <motion.img
                  src={LOGO_URL}
                  alt="ARES"
                  className="mx-auto mb-6 h-14 w-auto drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] md:h-16 lg:mx-0"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />

                <motion.div
                  className="glass mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/90"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                >
                  <Sparkles size={14} className="text-[#ffd700]" />
                  Asia&apos;s Premier Real Estate Summit
                </motion.div>

                <h2 className="text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
                  <SplitText text="Welcome to" delay={0.45} stagger={0.08} />
                  <br />
                  <SplitText text="ARES 2027" delay={0.7} stagger={0.1} wordClassName="gradient-text" />
                </h2>

                <motion.p
                  className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2 text-base text-white/75 md:text-lg lg:mx-0 lg:justify-start"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05, duration: 0.6 }}
                >
                  <MapPin size={18} className="shrink-0 text-[#ffd700]" />
                  Bangkok, Thailand
                </motion.p>

                <motion.div
                  className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Magnetic strength={10}>
                    <button
                      onClick={togglePlay}
                      className="shine relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6] px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_40px_rgba(226,40,55,0.35)] transition-shadow hover:shadow-[0_14px_50px_rgba(0,120,182,0.45)]"
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                      {isPlaying ? "Pause teaser" : "Play the teaser"}
                    </button>
                  </Magnetic>
                  <Magnetic strength={8}>
                    <button
                      onClick={closeVideoModal}
                      className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white/90 backdrop-blur-md transition-colors hover:bg-white/15 hover:text-white"
                    >
                      Enter website
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </Magnetic>
                </motion.div>

                <motion.p
                  className="mt-6 hidden text-xs uppercase tracking-[0.2em] text-white/40 lg:block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.8 }}
                >
                  Space to play · M to mute · Esc to skip
                </motion.p>
              </div>

              {/* Player */}
              <motion.div
                className="order-1 lg:order-2"
                initial={{ opacity: 0, scale: 0.9, y: 30, rotateY: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20, transition: { duration: 0.3 } }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformPerspective: 1200 }}
              >
                <div className="conic-border rounded-3xl">
                  <div className="group relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover"
                      muted={isMuted}
                      playsInline
                      preload="metadata"
                      onClick={togglePlay}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      poster={TEASER_POSTER}
                    >
                      <source src={TEASER_URL} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Corner label */}
                    <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md">
                      <span className={`h-2 w-2 rounded-full ${isPlaying ? "bg-[#e22837] motion-safe:animate-pulse" : "bg-white/50"}`} />
                      Official teaser
                    </div>

                    {/* Big play button when paused */}
                    <AnimatePresence>
                      {!isPlaying && (
                        <motion.button
                          key="bigplay"
                          onClick={togglePlay}
                          aria-label="Play teaser"
                          className="absolute inset-0 grid place-items-center bg-black/25"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.span
                            className="relative grid h-20 w-20 place-items-center rounded-full bg-white text-[#e22837] shadow-2xl md:h-24 md:w-24"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="absolute inset-0 rounded-full bg-white/40 motion-safe:animate-ping" />
                            <Play size={34} className="relative ml-1" />
                          </motion.span>
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Controls */}
                    <div
                      className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 ${
                        isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                      }`}
                    >
                      <TeaserControls
                        videoRef={videoRef}
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        togglePlay={togglePlay}
                        toggleMute={toggleMute}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={heroRef}
        onPointerMove={onHeroPointerMove}
        onPointerLeave={onHeroPointerLeave}
        className="relative flex min-h-screen items-center overflow-hidden text-white"
      >
        {/* Parallax background video (poster falls back to the photo) */}
        <motion.div
          aria-hidden
          className="absolute inset-0 overflow-hidden will-change-transform"
          style={{ y: bgY, x: bgShiftX, scale: bgScale }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_POSTER})` }}
          />
          {!introOpen && (
            <video
              ref={bgVideoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          )}
        </motion.div>
        <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ y: bgShiftY }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </motion.div>

        {/* Drifting colour orbs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#0078b6]/40 blur-[120px] motion-safe:animate-float-slow"
          style={{ x: orbAX, y: orbAY }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[#e22837]/35 blur-[140px] motion-safe:animate-float-slow [animation-delay:-4s]"
          style={{ x: orbBX, y: orbBY }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#ffd700]/20 blur-[110px] motion-safe:animate-float-slow [animation-delay:-7s]"
        />

        {!introOpen && <Particles count={45} />}

        {/* Content */}
        <motion.div
          className="container relative z-10 mx-auto mt-24 px-6 pb-28 md:mt-20"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] md:text-sm"
              >
                <Sparkles size={16} className="text-[#ffd700]" />
                Asia&apos;s Premier Real Estate Summit
              </motion.div>

              <div className="hero-text-container">
                <h1 className="hero-title blue-bg mobile-hero-text mb-0 font-sans text-4xl font-black leading-tight md:text-6xl 2xl:text-7xl">
                  <SplitText text="Welcome to ARES 2027" delay={0.25} />
                </h1>
                <h1 className="hero-title red-bg mobile-hero-text mt-0 font-sans text-2xl font-black leading-tight md:text-4xl lg:text-5xl">
                  <SplitText text="Asian Real Estate Summit!" delay={0.6} stagger={0.05} />
                </h1>
              </div>

              <motion.div
                className="mt-6 flex items-center"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
              >
                <MapPin className="mr-2 mt-1 shrink-0 text-[#ffd700]" size={35} />
                <h2 className="text-shadow font-sans text-xl font-bold md:text-2xl lg:text-4xl">
                  Bangkok, Thailand
                </h2>
              </motion.div>

              <motion.div
                className="mt-12 flex flex-wrap items-center gap-5"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <Magnetic>
                  <Link href="/about">
                    <Button className="premium-cta-button group relative overflow-hidden rounded-none border-0 bg-gradient-to-r from-[#e22837] via-[#e22837] to-[#d41e2d] px-10 py-4 font-sans text-lg font-semibold text-white shadow-2xl transition-all duration-500 hover:from-[#d41e2d] hover:via-[#c41f2d] hover:to-[#b01e2a] md:text-xl">
                      <span className="relative z-10 flex items-center gap-3">
                        About the Event
                        <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" size={20} />
                      </span>
                      <div className="absolute inset-0 translate-x-full skew-x-12 transform bg-gradient-to-r from-[#0078b6] to-[#005a8b] transition-transform duration-500 ease-out group-hover:translate-x-0" />
                    </Button>
                  </Link>
                </Magnetic>

                <Magnetic strength={12}>
                  <button
                    onClick={openTeaser}
                    className="group flex items-center gap-3 text-base font-semibold text-white/90 transition-colors hover:text-white md:text-lg"
                  >
                    <span className="relative grid h-12 w-12 place-items-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm transition-colors group-hover:bg-white/20">
                      <span className="absolute inset-0 rounded-full border border-white/40 motion-safe:animate-ping" />
                      <Play size={18} className="ml-0.5" />
                    </span>
                    Watch the teaser
                  </button>
                </Magnetic>
              </motion.div>
            </div>

            {/* Photo grid (desktop): one tall tile, two stacked, with a link into the gallery */}
            <motion.div
              className="relative hidden lg:block"
              style={{ x: cardX, y: cardY }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grid grid-cols-2 grid-rows-[240px_180px] gap-3">
                {heroCards.map((photo, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => openHeroPhoto(photo)}
                    aria-label={`Open photo from ${photo.album.title}`}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className={`group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${
                      i === 0 ? "col-span-2" : ""
                    }`}
                  >
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={photo.thumb}
                        src={photo.thumb}
                        alt=""
                        loading="eager"
                        decoding="async"
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </AnimatePresence>
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="pointer-events-none absolute bottom-3 left-3 z-10 translate-y-2 text-xs font-semibold text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      {photo.album.shortTitle}
                    </span>
                  </motion.button>
                ))}
              </div>

              <Link
                href="/gallery"
                className="glass group absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full py-2 pl-5 pr-2 text-sm text-white transition-colors hover:bg-white/20"
              >
                <span>
                  <span className="font-bold tabular-nums">
                    <Counter to={totalPhotoCount} />+
                  </span>{" "}
                  <span className="text-white/75">moments captured</span>
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-gray-900 transition-colors group-hover:bg-[#ffd700]">
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          style={{ opacity: contentOpacity }}
        >
          Explore
          <ChevronDown size={22} className="text-white/80 motion-safe:animate-bounce" />
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* TICKER                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-20 -mt-1 bg-gradient-to-r from-[#e22837] via-[#672e91] to-[#0078b6] py-3 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.25)]">
        <Marquee
          items={tickerItems.map((item) => (
            <span key={item} className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.25em]">
              {item}
              <Sparkles size={14} className="text-[#ffd700]" />
            </span>
          ))}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* STATS                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-28">
        {/* Soft backdrop: faint grid + colour wash */}
        <div
          aria-hidden
          className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
        />
        <div aria-hidden className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#0078b6]/10 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#e22837]/10 blur-[120px]" />

        <div className="container relative z-10 mx-auto px-6">
          <div className="mx-auto mb-14 flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Reveal>
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#0078b6]">
                <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                ARES 2025 in numbers
              </p>
              <h2 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                The summit <span className="gradient-text-brand">at a glance</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-sm text-lg text-gray-600 md:text-right">
                Two days, one city, and the people shaping the next decade of Asian real estate.
              </p>
            </Reveal>
          </div>

          <Stagger className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4" amount={0.15}>
            {stats.map(({ value, suffix, label, detail, icon: Icon, from, to }, i) => (
              <motion.div key={label} variants={staggerItem} className="h-full">
                <TiltCard
                  className="group relative h-full overflow-hidden rounded-[28px] border border-gray-100 bg-white/90 p-7 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur transition-shadow duration-500 hover:shadow-[0_30px_70px_rgba(15,23,42,0.14)]"
                  intensity={6}
                  glow={`${from}1f`}
                >
                  {/* Accent bar that draws in */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-7 top-0 h-1 origin-left rounded-b-full"
                    style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />

                  {/* Watermark icon */}
                  <Icon
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 opacity-[0.05] transition-all duration-700 group-hover:-rotate-12 group-hover:scale-110 group-hover:opacity-[0.09]"
                    style={{ color: from }}
                    strokeWidth={1.5}
                  />

                  <div className="relative flex items-start justify-between" style={{ transform: "translateZ(30px)" }}>
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl blur-xl opacity-50 transition-opacity duration-500 group-hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                      />
                      <div
                        className="relative grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-6"
                        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                      >
                        <Icon size={26} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold tabular-nums tracking-widest text-gray-300">0{i + 1}</span>
                  </div>

                  <div className="relative mt-8" style={{ transform: "translateZ(20px)" }}>
                    <h3
                      className="text-5xl font-black leading-none tracking-tight md:text-6xl"
                      style={{
                        backgroundImage: `linear-gradient(135deg, #0f172a 30%, ${from})`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      <Counter to={value} suffix={suffix} />
                    </h3>
                    <p className="mt-3 text-lg font-bold text-gray-900">{label}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{detail}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* VIDEO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 py-24">
        <div className="dot-grid absolute inset-0" />
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#0078b6]/30 blur-[120px] motion-safe:animate-float-slow" />
        <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-[#e22837]/30 blur-[120px] motion-safe:animate-float-slow [animation-delay:-5s]" />

        <div className="container relative z-10 mx-auto px-6">
          <div className="mb-16 text-center">
            <Reveal>
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                Experience <span className="gradient-text">ARES 2027</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto max-w-3xl text-xl text-white/80">
                Get an exclusive preview of what awaits you at Asia&apos;s premier real estate summit
              </p>
            </Reveal>
          </div>

          <Reveal className="mx-auto max-w-4xl" delay={0.15} amount={0.2}>
            <div className="conic-border rounded-3xl">
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
                <video controls className="h-auto w-full" poster={TEASER_POSTER} preload="none">
                  <source src={TEASER_URL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ABOUT                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8">
              <Reveal direction="right">
                <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
                  Shaping the <span className="gradient-text-brand">Future</span> of Real Estate
                </h2>
                <motion.div
                  className="mb-8 h-1 w-20 origin-left rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </Reveal>

              <Stagger className="space-y-6 text-lg leading-relaxed text-gray-700">
                <motion.p variants={staggerItem} className="text-xl font-semibold text-gray-900">
                  ARES brings together the brightest minds in Asian real estate for an unprecedented summit of
                  innovation and collaboration.
                </motion.p>
                <motion.p variants={staggerItem}>
                  Our biennial international conference unites hundreds of industry leaders, from seasoned developers
                  to cutting-edge proptech innovators, creating a dynamic ecosystem of knowledge exchange.
                </motion.p>
                <motion.p variants={staggerItem}>
                  Experience world-class presentations, engage in interactive workshops, and discover the latest trends
                  shaping the future of real estate across Asia.
                </motion.p>
              </Stagger>

              <Reveal delay={0.2}>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Magnetic strength={10}>
                    <Link href="/about">
                      <Button className="shine relative overflow-hidden rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-[#d41e2d] hover:to-[#005a8b] hover:shadow-xl">
                        Learn More
                      </Button>
                    </Link>
                  </Magnetic>
                  <Magnetic strength={10}>
                    <Link href="/speakers">
                      <Button
                        variant="outline"
                        className="rounded-full border-2 border-[#0078b6] px-8 py-4 text-lg font-semibold text-[#0078b6] transition-all duration-300 hover:bg-[#0078b6] hover:text-white"
                      >
                        View Speakers
                      </Button>
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>
            </div>

            <Reveal direction="left" delay={0.1} className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 blur-2xl" />
              <TiltCard className="group rounded-3xl" intensity={7} glow="rgba(255,255,255,0.25)">
                <img
                  src="/about-poster.jpg"
                  alt="ARES Event"
                  className="relative h-full w-full rounded-3xl object-cover shadow-2xl"
                />
                <motion.div
                  className="absolute -bottom-6 -left-6 rounded-2xl bg-white px-5 py-4 shadow-2xl"
                  style={{ transform: "translateZ(50px)" }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Bangkok</p>
                  <p className="text-2xl font-black text-gray-900">2027</p>
                </motion.div>
                <motion.div
                  className="glass absolute -right-4 top-6 rounded-full px-4 py-2 text-sm font-semibold text-white"
                  style={{ transform: "translateZ(40px)", background: "rgba(0,0,0,0.45)" }}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.7 }}
                >
                  Biennial Summit
                </motion.div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* GALLERY PREVIEW                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <Reveal>
              <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
                Moments of <span className="gradient-text">Excellence</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto max-w-3xl text-xl text-gray-600">
                Relive the highlights and memorable moments from ARES 2025 in Bangkok
              </p>
            </Reveal>
          </div>

          <Stagger className="mx-auto mb-12 grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-3" amount={0.1}>
            {images.map((photo, index) => (
              <motion.button
                key={photo.thumb}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-shadow duration-500 hover:shadow-2xl"
                onClick={() => handleImageClick(index)}
                aria-label={`Open ${photo.album.title} photo ${photo.indexInAlbum}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.thumb || "/placeholder.svg"}
                    alt={`${photo.album.title} photo ${photo.indexInAlbum}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="photo-caption absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-left text-white">
                  <span className="text-sm font-semibold">{photo.album.title}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </motion.button>
            ))}
          </Stagger>

          <Reveal className="text-center">
            <Magnetic>
              <Link href="/gallery">
                <Button className="shine group relative overflow-hidden rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-[#d41e2d] hover:to-[#005a8b] hover:shadow-xl">
                  Explore Full Gallery
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
                </Button>
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CONTACT                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 py-24">
        <div className="dot-grid absolute inset-0" />
        <div className="pointer-events-none absolute right-0 top-0 h-[30rem] w-[30rem] rounded-full bg-[#672e91]/30 blur-[140px] motion-safe:animate-float-slow" />
        <div className="container relative z-10 mx-auto px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8 text-white">
              <Reveal direction="right">
                <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                  Ready to <span className="gradient-text">Join Us?</span>
                </h2>
                <div className="mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                <p className="text-xl leading-relaxed text-white/80">
                  Connect with us for registration, sponsorship opportunities, or any questions about ARES 2025.
                </p>
              </Reveal>

              <Stagger className="space-y-6">
                {[
                  { icon: Mail, title: "Email Us", value: "info@filipinohomes.com", href: "mailto:info@filipinohomes.com", from: "#0078b6", to: "#005a8b" },
                  { icon: Phone, title: "Call Us", value: "(+63) 977 815 0888", href: "tel:+639778150888", from: "#e22837", to: "#d41e2d" },
                ].map(({ icon: Icon, title, value, href, from, to }) => (
                  <motion.a
                    key={title}
                    href={href}
                    variants={staggerItem}
                    whileHover={{ x: 8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="glass group flex items-center gap-4 rounded-2xl p-4"
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="text-white/80">{value}</p>
                    </div>
                    <ArrowRight className="ml-auto opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" size={18} />
                  </motion.a>
                ))}
              </Stagger>
            </div>

            <Reveal direction="left" delay={0.1}>
              <div className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Send us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      placeholder="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl border-gray-200 bg-white py-3 transition-all duration-300 focus:border-[#0078b6] focus:ring-[#0078b6] focus:shadow-[0_0_0_4px_rgba(0,120,182,0.12)]"
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl border-gray-200 bg-white py-3 transition-all duration-300 focus:border-[#0078b6] focus:ring-[#0078b6] focus:shadow-[0_0_0_4px_rgba(0,120,182,0.12)]"
                    />
                  </div>
                  <Input
                    placeholder="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="rounded-xl border-gray-200 bg-white py-3 transition-all duration-300 focus:border-[#0078b6] focus:ring-[#0078b6] focus:shadow-[0_0_0_4px_rgba(0,120,182,0.12)]"
                  />
                  <Textarea
                    placeholder="Your Message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="rounded-xl border-gray-200 bg-white transition-all duration-300 focus:border-[#0078b6] focus:ring-[#0078b6] focus:shadow-[0_0_0_4px_rgba(0,120,182,0.12)]"
                  />
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="shine relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#e22837] to-[#0078b6] py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-[#d41e2d] hover:to-[#005a8b] hover:shadow-xl disabled:opacity-70"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin" size={20} /> Sending…
                        </span>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CustomLightbox
        open={lightboxOpen}
        onClose={handleLightboxClose}
        currentImage={lightboxPhoto?.full || ""}
        caption={lightboxPhoto ? `${lightboxPhoto.album.title} · #${lightboxPhoto.indexInAlbum}` : undefined}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
        imageCount={images.length}
        currentIndex={currentImageIndex}
      />
    </div>
  )
}

export default HomePage
