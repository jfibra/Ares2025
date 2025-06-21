"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, MapPin, Play, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import CustomLightbox from "./custom-lightbox"

const GalleryPage = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [loading, setLoading] = useState(false)
  const [displayedImages, setDisplayedImages] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid")

  const generateImageUrls = () => {
    const baseUrl = "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/Event+Photos/Ares+Event+"
    return Array.from({ length: 218 }, (_, i) => `${baseUrl}(${i + 1}).JPG`)
  }

  const images = generateImageUrls()

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      setDisplayedImages([])

      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const newImages = images.slice(startIndex, endIndex)

      await new Promise((resolve) => setTimeout(resolve, 300))

      setDisplayedImages(newImages)
      setLoading(false)
    }

    loadImages()
  }, [page, itemsPerPage])

  const openLightbox = useCallback(
    (index: number) => {
      setLightboxIndex((page - 1) * itemsPerPage + index)
      setLightboxOpen(true)
    },
    [page, itemsPerPage],
  )

  const closeLightbox = () => setLightboxOpen(false)
  const movePrev = () => setLightboxIndex((prevIndex) => (prevIndex + images.length - 1) % images.length)
  const moveNext = () => setLightboxIndex((prevIndex) => (prevIndex + 1) % images.length)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = Math.ceil(images.length / itemsPerPage)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920&text=Gallery+Background')] opacity-10" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffd700]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e22837]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-6 mt-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text leading-tight">
              GALLERY
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto">
              Explore the highlights and memorable moments from ARES events across Asia
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <h3 className="text-3xl font-bold text-[#ffd700] mb-2">200+</h3>
                <p className="text-white/80">Event Photos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <h3 className="text-3xl font-bold text-[#ffd700] mb-2">2</h3>
                <p className="text-white/80">Event Years</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <h3 className="text-3xl font-bold text-[#ffd700] mb-2">400+</h3>
                <p className="text-white/80">Attendees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Event{" "}
                <span className="text-transparent bg-gradient-to-r from-[#e22837] to-[#0078b6] bg-clip-text">
                  Photos
                </span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Browse through our collection of professional event photography capturing the essence of ARES
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setPage(1)
                  }}
                  className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0078b6] focus:border-transparent"
                >
                  <option value={8}>8 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>

                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid" ? "bg-[#0078b6] text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("masonry")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "masonry" ? "bg-[#0078b6] text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  First
                </Button>
                <Button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Last
                </Button>
              </div>
            </div>

            {/* Gallery Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0078b6]"></div>
              </div>
            ) : (
              <div
                className={`grid gap-6 mb-12 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {displayedImages.map((image, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white"
                    onClick={() => openLightbox(index)}
                  >
                    <div className={`overflow-hidden ${viewMode === "grid" ? "aspect-square" : "aspect-[4/3]"}`}>
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Event Image ${(page - 1) * itemsPerPage + index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm font-medium">ARES Event Photo</p>
                      <p className="text-xs text-white/80">#{(page - 1) * itemsPerPage + index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Pagination */}
            <div className="flex justify-center items-center gap-2 flex-wrap">
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </Button>

              {[...Array(Math.min(7, totalPages))].map((_, i) => {
                let pageNum
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (page <= 4) {
                  pageNum = i + 1
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = page - 3 + i
                }

                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`${
                      page === pageNum
                        ? "bg-gradient-to-r from-[#e22837] to-[#0078b6] text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Event Video Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Event{" "}
                <span className="text-transparent bg-gradient-to-r from-[#ffd700] to-[#f59e0b] bg-clip-text">
                  Highlights
                </span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Asian Real Estate Summit 2023</h3>
              <div className="flex items-center justify-center gap-2 mb-8">
                <MapPin className="text-[#ffd700]" size={20} />
                <span className="text-white/80 text-lg font-semibold">Bangkok, Thailand</span>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 group mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-[#e22837]/20 via-transparent to-[#0078b6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <video controls className="w-full h-auto relative z-10" poster="/video-cover.png">
                <source src="https://leuteriorealty.com/videos/ARES2023.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Play className="text-white" size={32} />
                </div>
              </div>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
                <h4 className="text-2xl font-bold text-[#ffd700] mb-6">Event Success Story</h4>
                <p className="text-white/90 text-lg leading-relaxed">
                  Thank you to our exceptional corporate sponsors, esteemed speakers, and incredible delegates for
                  making the Asian Real Estate Summit 2023 an outstanding success! With over 400 real estate
                  practitioner delegates and a dozen great speakers, ARES 2023 exceeded our wildest expectations! The
                  talks were filled with invaluable insights, fostering growth and innovation in our industry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CustomLightbox
        open={lightboxOpen}
        onClose={closeLightbox}
        currentImage={images[lightboxIndex] || ""}
        onPrev={movePrev}
        onNext={moveNext}
        imageCount={images.length}
        currentIndex={lightboxIndex}
      />
    </div>
  )
}

export default GalleryPage
