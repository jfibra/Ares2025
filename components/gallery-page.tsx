"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import CustomLightbox from "./custom-lightbox"

const GalleryPage = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [loading, setLoading] = useState(false)
  const [displayedImages, setDisplayedImages] = useState<string[]>([])

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

      await new Promise((resolve) => setTimeout(resolve, 500))

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
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div
        className="min-h-screen flex items-center text-white relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url(/GalleryBG.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/40 to-black/80" />

        <div className="container mx-auto px-4 mt-20 relative z-10">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-['Lato'] bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              GALLERY
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
            <p className="text-white/80 text-xl max-w-3xl mx-auto leading-relaxed">
              Immerse yourself in the moments captured during our past events and initiatives.
            </p>
          </div>

          {/* Animated film strip */}
          <div className="absolute bottom-20 left-0 right-0 overflow-hidden opacity-30">
            <div className="flex animate-marquee">
              {[...Array(8)].map((_, i) => (
                <img key={i} src="/video-tape.png" alt="Film strip" className="w-64 h-auto flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{
          backgroundImage: "url(/photo-gallery-bg.png)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/60" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#ffd700] to-white bg-clip-text font-['Lato'] mb-6">
              Photo Gallery
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full" />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
            >
              <option value={4} className="text-black">
                4 per page
              </option>
              <option value={8} className="text-black">
                8 per page
              </option>
              <option value={16} className="text-black">
                16 per page
              </option>
              <option value={32} className="text-black">
                32 per page
              </option>
            </select>

            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50"
              >
                First
              </Button>
              <Button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50"
              >
                Last
              </Button>
            </div>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#ffd700]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {displayedImages.map((image, index) => (
                <div
                  key={index}
                  className="group cursor-pointer relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-[#ffd700]/60 transition-all duration-300 hover:scale-105"
                  onClick={() => openLightbox(index)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Event Image ${(page - 1) * itemsPerPage + index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </Button>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i))
              return (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`${
                    page === pageNum
                      ? "bg-[#ffd700] text-black"
                      : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  }`}
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Event Video Section */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#ffd700] to-white bg-clip-text font-['Lato'] mb-6">
              Event Video
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Asian Real Estate Summit 2023</h3>
            <div className="flex items-center justify-center gap-2 mb-8">
              <MapPin className="text-[#ffd700]" size={20} />
              <span className="text-white/80 text-lg font-semibold">Bangkok, Thailand</span>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-black border border-[#ffd700]/30 group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#e22837]/20 via-transparent to-[#0078b6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <video controls className="w-full h-auto relative z-10" poster="/video-cover.png">
                <source src="https://leuteriorealty.com/videos/ARES2023.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <div className="text-center mt-12 max-w-4xl mx-auto">
            <h4 className="text-2xl font-bold text-[#ffd700] mb-6">Event Information</h4>
            <p className="text-white/90 text-lg leading-relaxed">
              Thank you to our exceptional corporate sponsors, esteemed speakers, and incredible delegates for making
              the Asian Real Estate Summit 2023 an outstanding success! With over 400 real estate practitioner delegates
              and a dozen great speakers, ARES 2023 exceeded our wildest expectations! The talks were filled with
              invaluable insights, fostering growth and innovation in our industry.
            </p>
          </div>
        </div>
      </div>

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
