"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ArrowDown, ArrowRight, Camera, CalendarDays, Images, MapPin, Maximize2, Play } from "lucide-react"
import CustomLightbox from "./custom-lightbox"
import { Reveal, Counter } from "./motion"
import {
  galleryAlbums,
  getPhotosForAlbum,
  homepageHighlights,
  totalPhotoCount,
  eventYearCount,
  type GalleryAlbum,
  type GalleryPhoto,
} from "@/lib/gallery-albums"

type AlbumFilter = "all" | string

const EASE_OUT = [0.22, 1, 0.36, 1] as const
/** Photos revealed per "Show more" click. */
const PAGE_SIZE = 24
/** Only the first batch gets a staggered entrance; later batches fade in together. */
const STAGGER_LIMIT = 16

const heroStats = [
  { label: "photos", value: totalPhotoCount, suffix: "+", icon: Camera },
  { label: galleryAlbums.length === 1 ? "album" : "albums", value: galleryAlbums.length, suffix: "", icon: Images },
  { label: eventYearCount === 1 ? "event year" : "event years", value: eventYearCount, suffix: "", icon: CalendarDays },
]

/** Six real event photos for the hero mosaic, so the page opens on the archive itself. */
const heroMosaic = homepageHighlights.slice(0, 6)

/** Explicit cells for a 3x3 grid: one large lead photo, five supporting ones. */
const mosaicLayout = [
  "col-start-1 col-span-2 row-start-1 row-span-2",
  "col-start-3 row-start-1",
  "col-start-3 row-start-2",
  "col-start-1 row-start-3",
  "col-start-2 row-start-3",
  "col-start-3 row-start-3",
]

const albumMeta = (album: GalleryAlbum) => [album.date, album.location].filter(Boolean).join(" · ")

const GalleryPage = () => {
  const reduce = useReducedMotion()
  const [activeAlbum, setActiveAlbum] = useState<AlbumFilter>("all")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const photosRef = useRef<HTMLElement>(null)

  const photos = useMemo(() => getPhotosForAlbum(activeAlbum), [activeAlbum])
  const visiblePhotos = useMemo(() => photos.slice(0, visibleCount), [photos, visibleCount])
  const activeAlbumDetails = useMemo(
    () => (activeAlbum === "all" ? undefined : galleryAlbums.find((album) => album.slug === activeAlbum)),
    [activeAlbum],
  )
  const remaining = photos.length - visiblePhotos.length

  // ---- Album selection ------------------------------------------------------
  const selectAlbum = useCallback((slug: AlbumFilter, scroll = false) => {
    setActiveAlbum(slug)
    setVisibleCount(PAGE_SIZE)
    if (scroll) {
      // Let the filter bar settle before scrolling so the sticky offset is right.
      requestAnimationFrame(() => photosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
    }
  }, [])

  // Reflect the chosen album in the URL so a filtered view can be linked and
  // survives a refresh. Read on mount rather than during render, so the markup
  // still matches what the server sent.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("album")
    if (slug && galleryAlbums.some((album) => album.slug === slug)) setActiveAlbum(slug)
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (activeAlbum === "all") url.searchParams.delete("album")
    else url.searchParams.set("album", activeAlbum)
    // replaceState keeps the back button meaning "the page before the gallery".
    window.history.replaceState(null, "", url)
  }, [activeAlbum])

  // ---- Lightbox -------------------------------------------------------------
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  const closeLightbox = () => setLightboxOpen(false)
  const movePrev = () => setLightboxIndex((i) => (i + photos.length - 1) % photos.length)
  const moveNext = () => setLightboxIndex((i) => (i + 1) % photos.length)
  const activePhoto = photos[lightboxIndex]

  // Warm the neighbouring full-size images so lightbox paging feels instant.
  useEffect(() => {
    if (!lightboxOpen || photos.length === 0) return
    ;[photos[(lightboxIndex + 1) % photos.length], photos[(lightboxIndex + photos.length - 1) % photos.length]].forEach(
      (photo) => {
        if (!photo) return
        const img = new Image()
        img.src = photo.full
      },
    )
  }, [lightboxOpen, lightboxIndex, photos])

  const filterTabs = [
    { slug: "all", label: "All photos", count: totalPhotoCount },
    ...galleryAlbums.map((album) => ({ slug: album.slug, label: album.shortTitle, count: album.photos.length })),
  ]

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* ------------------------------------------------------------------ */}
      {/* HERO: copy on the left, a mosaic of real event photos on the right  */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-[#0b0f19] text-white">
        <div aria-hidden className="dot-grid absolute inset-0 opacity-30" />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-[#0078b6]/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#e22837]/20 blur-[120px]"
        />

        <div className="container relative z-10 mx-auto px-4 pb-16 pt-32 sm:px-6 md:pb-24 md:pt-40">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
                className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60"
              >
                <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                Photo archive
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
                className="text-5xl font-black leading-[1.02] tracking-tight md:text-6xl xl:text-7xl"
              >
                Every moment,
                <br />
                <span className="gradient-text">captured.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT }}
                className="mt-6 max-w-lg text-lg leading-relaxed text-white/70 md:text-xl"
              >
                Keynotes, panels, the dinner cruise and everything in between. Browse the full photo record of the
                Asian Real Estate Summit in Bangkok.
              </motion.p>

              <motion.dl
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT }}
                className="mt-10 flex flex-wrap gap-x-10 gap-y-5"
              >
                {heroStats.map(({ label, value, suffix, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-[#ffd700]">
                      <Icon size={16} />
                    </span>
                    <div>
                      <dd className="text-2xl font-bold leading-none tabular-nums">
                        <Counter to={value} suffix={suffix} />
                      </dd>
                      <dt className="mt-1 text-xs uppercase tracking-widest text-white/50">{label}</dt>
                    </div>
                  </div>
                ))}
              </motion.dl>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55, ease: EASE_OUT }}
                className="mt-10"
              >
                <button
                  type="button"
                  onClick={() => photosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="group inline-flex min-h-[48px] items-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-gray-900 transition-colors hover:bg-[#ffd700]"
                >
                  Start browsing
                  <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                </button>
              </motion.div>
            </div>

            {/* Mosaic */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
              className="grid aspect-[4/3] grid-cols-3 grid-rows-3 gap-2 sm:gap-3"
            >
              {heroMosaic.map((photo, i) => (
                <motion.button
                  key={photo.thumb}
                  type="button"
                  variants={{
                    hidden: { opacity: 0, scale: 0.94, y: 16 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
                  }}
                  onClick={() => {
                    selectAlbum("all")
                    const index = getPhotosForAlbum("all").indexOf(photo)
                    openLightbox(index < 0 ? 0 : index)
                  }}
                  aria-label={`Open photo from ${photo.album.title}`}
                  className={`group relative overflow-hidden rounded-2xl bg-white/5 ${mosaicLayout[i]}`}
                >
                  <img
                    src={photo.thumb}
                    alt=""
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute bottom-3 left-3 translate-y-2 text-xs font-semibold text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {photo.album.shortTitle}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ALBUMS                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-b border-gray-100 bg-white py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0078b6]">
                  <span className="h-px w-8 bg-gradient-to-r from-[#e22837] to-[#0078b6]" />
                  Browse by album
                </p>
                <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                  {galleryAlbums.length} albums, <span className="gradient-text-brand">one summit</span>
                </h2>
              </div>
              <p className="max-w-sm text-gray-500 md:text-right">
                Pick a day or an event to jump straight to its photos, or scroll on to browse everything.
              </p>
            </Reveal>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 md:gap-5"
            >
              {galleryAlbums.map((album) => {
                const active = activeAlbum === album.slug
                return (
                  <motion.button
                    key={album.slug}
                    type="button"
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
                    }}
                    onClick={() => selectAlbum(album.slug, true)}
                    aria-pressed={active}
                    className={`group relative overflow-hidden rounded-3xl bg-gray-100 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078b6] focus-visible:ring-offset-2 ${
                      active ? "ring-2 ring-[#0078b6] ring-offset-2" : ""
                    }`}
                  >
                    <div className="aspect-[3/4]">
                      <img
                        src={album.coverImage}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">{album.year}</p>
                      <p className="mt-1 text-base font-bold leading-snug md:text-lg">{album.title}</p>
                      <p className="mt-2 flex items-center justify-between text-xs text-white/70">
                        <span>{album.photos.length} photos</span>
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PHOTOS                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section ref={photosRef} className="scroll-mt-[80px] bg-gray-50 pb-24">
        {/* Sticky filter bar */}
        <div className="sticky top-[80px] z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto flex max-w-7xl items-center gap-6">
              <div
                role="tablist"
                aria-label="Filter photos by album"
                className="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {filterTabs.map(({ slug, label, count }) => {
                  const active = activeAlbum === slug
                  return (
                    <button
                      key={slug}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => selectAlbum(slug)}
                      className={`relative flex min-h-[52px] shrink-0 items-center gap-2 px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078b6] ${
                        active ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                          active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                      {active && (
                        <motion.span
                          layoutId="gallery-tab-underline"
                          aria-hidden
                          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6]"
                          transition={{ type: "spring", stiffness: 420, damping: 36 }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="hidden shrink-0 text-sm text-gray-500 tabular-nums md:block" aria-live="polite">
                <span className="font-semibold text-gray-900">{visiblePhotos.length.toLocaleString()}</span> of{" "}
                {photos.length.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-10 sm:px-6">
          <div className="mx-auto max-w-7xl">
            {/* Active album details */}
            <AnimatePresence mode="wait" initial={false}>
              {activeAlbumDetails && (
                <motion.div
                  key={activeAlbumDetails.slug}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="mb-8 flex flex-col gap-1 border-l-2 border-[#0078b6] pl-4"
                >
                  <p className="text-xl font-bold">{activeAlbumDetails.title}</p>
                  <p className="flex flex-wrap items-center gap-x-3 text-sm text-gray-500">
                    {activeAlbumDetails.date && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} /> {activeAlbumDetails.date}
                      </span>
                    )}
                    {activeAlbumDetails.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} /> {activeAlbumDetails.location}
                      </span>
                    )}
                  </p>
                  {activeAlbumDetails.description && (
                    <p className="text-sm text-gray-500">{activeAlbumDetails.description}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Masonry grid: CSS columns, each tile reserves its own aspect ratio */}
            <motion.div
              key={activeAlbum}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4"
            >
              {visiblePhotos.map((photo, index) => {
                const staggered = !reduce && index < STAGGER_LIMIT
                return (
                  <motion.button
                    key={`${photo.album.slug}-${photo.indexInAlbum}`}
                    type="button"
                    initial={staggered ? { opacity: 0, y: 20 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: staggered ? index * 0.04 : 0, ease: EASE_OUT }}
                    onClick={() => openLightbox(index)}
                    aria-label={`Open ${photo.album.title} photo ${photo.indexInAlbum}`}
                    className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl bg-gray-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078b6] focus-visible:ring-offset-2 sm:mb-4"
                    style={{ aspectRatio: String(photo.ratio) }}
                  >
                    <img
                      src={photo.thumb}
                      alt={`${photo.album.title} photo ${photo.indexInAlbum}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between p-3 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="min-w-0 truncate text-xs font-semibold">
                        {photo.album.shortTitle} · #{photo.indexInAlbum}
                      </span>
                      <Maximize2 size={14} className="shrink-0" />
                    </span>
                  </motion.button>
                )
              })}
            </motion.div>

            {/* Show more */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="h-1 w-40 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e22837] to-[#0078b6] transition-[width] duration-500"
                  style={{ width: `${photos.length ? (visiblePhotos.length / photos.length) * 100 : 0}%` }}
                />
              </div>
              {remaining > 0 ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-gray-300 bg-white px-7 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-900"
                >
                  Show more
                  <span className="text-gray-400">· {remaining.toLocaleString()} left</span>
                </button>
              ) : (
                <p className="text-sm text-gray-500">That&apos;s every photo in this album.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HIGHLIGHTS VIDEO                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-[#0b0f19] py-20 text-white md:py-28">
        <div aria-hidden className="dot-grid absolute inset-0 opacity-30" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-[26rem] w-[26rem] rounded-full bg-[#0078b6]/20 blur-[120px]"
        />

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal>
              <p className="mb-4 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                <span className="h-px w-8 bg-gradient-to-r from-[#ffd700] to-[#e22837]" />
                Watch the recap
              </p>
              <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                ARES 2023 <span className="gradient-text">highlights</span>
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/60">
                <MapPin size={14} className="text-[#ffd700]" />
                Bangkok, Thailand
              </p>
              <p className="mt-6 leading-relaxed text-white/75">
                Thank you to our corporate sponsors, speakers and delegates for making the Asian Real Estate Summit
                2023 an outstanding success. Over 400 practitioners and a dozen speakers filled two days with
                insight that is still shaping the industry.
              </p>
            </Reveal>

            <Reveal direction="left" amount={0.2}>
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <video
                  controls
                  preload="none"
                  className="aspect-video h-auto w-full"
                  poster="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ares-thumbnail.png"
                >
                  <source src="https://leuteriorealty.com/videos/ARES2023.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm">
                  <Play size={12} className="text-[#ffd700]" />
                  Official recap
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CustomLightbox
        open={lightboxOpen}
        onClose={closeLightbox}
        currentImage={activePhoto?.full || "/placeholder.svg"}
        caption={activePhoto ? `${activePhoto.album.title} · #${activePhoto.indexInAlbum}` : undefined}
        onPrev={movePrev}
        onNext={moveNext}
        imageCount={photos.length}
        currentIndex={lightboxIndex}
      />
    </div>
  )
}

export default GalleryPage
