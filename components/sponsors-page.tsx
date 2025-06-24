"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { MapPin, Mail, Phone, Play, Pause, Volume2, VolumeX, X, Users, Award, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import CustomLightbox from "./custom-lightbox"
import CountdownTimer from "./countdown-timer"

const SponsorsPage = () => {
  const [images, setImages] = useState<string[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [showVideoModal, setShowVideoModal] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true) // Start muted
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasSeenVideoToday, setHasSeenVideoToday] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)

  // Check if user has seen video today
  useEffect(() => {
    const today = new Date().toDateString()
    const lastSeen = localStorage.getItem("ares-video-seen")
    if (lastSeen === today) {
      setHasSeenVideoToday(true)
      setShowVideoModal(false)
    }
  }, [])

  const galleryImages = [
    "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/Event+Photos/Ares+Event+(56).JPG",
    "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/Event%20Photos/Ares+Event+(51).JPG",
    "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/Event%20Photos/Ares+Event+(95).JPG",
    "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/Event%20Photos/Ares+Event+(68).JPG",
    "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/Event%20Photos/Ares+Event+(4).JPG",
    "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/Event%20Photos/Ares+Event+(193).JPG",
  ]

  useEffect(() => {
    const imageUrls = [
      ...galleryImages,
      ...Array.from(
        { length: 198 },
        (_, i) =>
          `https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/Event Photos/Ares+Event+(${i + 1}).JPG`,
      ),
    ]
    const shuffled = imageUrls.sort(() => 0.5 - Math.random())
    setImages(shuffled.slice(0, 10))
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showVideoModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showVideoModal])

  const handleVideoPlay = () => {
    if (videoRef.current && userInteracted) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const togglePlay = () => {
    setUserInteracted(true)
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
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

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const handleLightboxClose = () => {
    setLightboxOpen(false)
  }

  const handleLightboxPrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const handleLightboxNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("https://api.leuteriorealty.com/ares/v1/public/api/ares/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Your message has been sent successfully!")
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        })
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Something went wrong. Please try again later.")
    }
  }

  return (
    <div className="flex-grow overflow-hidden">
      {/* Fixed Video Modal - No Autoplay */}
      {showVideoModal && !hasSeenVideoToday && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-1000">
          <button
            onClick={closeVideoModal}
            className="absolute top-6 right-6 z-[10000] bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-2xl border border-white/20"
          >
            <X size={24} />
          </button>

          <div className="relative w-full max-w-4xl max-h-[85vh] animate-in zoom-in duration-1000 delay-300">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd700]/20 via-[#e22837]/20 to-[#0078b6]/20 rounded-3xl blur-2xl animate-pulse" />

            <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl overflow-hidden border border-white/20 shadow-2xl backdrop-blur-sm">
              <div className="text-center py-6 px-8 border-b border-white/10">
                <img
                  src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
                  alt="ARES 2025"
                  className="max-w-xs mx-auto h-auto mb-4"
                />
                <div className="bg-gradient-to-r from-[#e22837] to-[#0078b6] px-6 py-2 rounded-full inline-block">
                  <p className="text-white font-semibold text-sm">BANGKOK, THAILAND • JULY 2, 2025</p>
                </div>
              </div>

              <div className="relative group">
                <video
                  ref={videoRef}
                  className="w-full h-auto max-h-[50vh] object-cover"
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  poster="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ares-thumbnail.png"
                >
                  <source
                    src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES+2025+TEASER.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={togglePlay}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300"
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300"
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="bg-[#e22837]/90 hover:bg-[#e22837] text-white p-6 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-2xl"
                    >
                      <Play size={40} className="ml-1" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center py-6 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                <Button
                  onClick={closeVideoModal}
                  className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Continue to Website
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Original Hero Section with Skewed Banners */}
      <section
        className="min-h-screen flex items-center text-white relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url(/bangkok.png)",
        }}
      >
        <div className="container mx-auto px-6 mt-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="hero-text-container animate-in slide-in-from-bottom duration-1000">
              <h1 className="hero-title blue-bg text-4xl md:text-6xl lg:text-7xl font-black font-['Poppins'] leading-tight mb-0 mobile-hero-text">
                Welcome to ARES 2025
              </h1>
              <h1 className="hero-title red-bg text-2xl md:text-4xl lg:text-5xl font-black font-['Poppins'] leading-tight mt-0 mobile-hero-text">
                Asian Real Estate Summit!
              </h1>
            </div>

            <div className="flex items-center mt-6 animate-in slide-in-from-bottom duration-1000 delay-300">
              <MapPin className="text-white mr-2 mt-1" size={35} />
              <h2 className="text-xl md:text-2xl lg:text-4xl font-bold font-['Poppins'] text-shadow">
                July 01 to 02, 2025 - Bangkok, Thailand
              </h2>
            </div>

            <div className="mt-12 animate-in slide-in-from-bottom duration-1000 delay-500">
              <Link href="/about">
                <Button className="premium-cta-button group relative overflow-hidden bg-gradient-to-r from-[#e22837] via-[#e22837] to-[#d41e2d] hover:from-[#d41e2d] hover:via-[#c41f2d] hover:to-[#b01e2a] text-white px-10 py-4 text-lg md:text-xl font-semibold font-['Poppins'] shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-0 rounded-none">
                  <span className="relative z-10 flex items-center gap-3">
                    About the Event
                    <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={20} />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0078b6] to-[#005a8b] transform skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  <div className="absolute top-0 right-0 w-0 h-full bg-[#0078b6] transform skew-x-[-30deg] group-hover:w-8 transition-all duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-white via-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-[#e22837] to-[#d41e2d] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">400+</h3>
              <p className="text-gray-600 font-medium">Industry Professionals</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-[#0078b6] to-[#005a8b] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">12</h3>
              <p className="text-gray-600 font-medium">Expert Speakers</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-[#ffd700] to-[#f59e0b] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">2</h3>
              <p className="text-gray-600 font-medium">Days of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Showcase Section - Enhanced Hollywood Style */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
        {/* Sparkling Stars Animation Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#e22837]/5 via-transparent to-[#0078b6]/5" />

          {/* Animated Stars */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div className="w-1 h-1 bg-white rounded-full opacity-60" />
            </div>
          ))}

          {/* Larger Twinkling Stars */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div className="w-2 h-2 bg-gradient-to-r from-[#ffd700] to-[#f59e0b] rounded-full opacity-40" />
            </div>
          ))}

          {/* Moving Light Streaks */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ffd700]/30 to-transparent animate-pulse" />
          <div
            className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#e22837]/30 to-transparent animate-pulse"
            style={{ animationDelay: "2s" }}
          />

          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffd700]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#e22837]/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#0078b6]/10 rounded-full blur-3xl animate-pulse delay-2000" />

          {/* Rotating Background Element */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-[#0078b6]/5 via-transparent to-[#e22837]/5 rounded-full blur-2xl animate-spin"
            style={{ animationDuration: "60s" }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Premium Header */}
          <div className="text-center mb-20">
            <div className="inline-block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd700]/20 via-[#e22837]/20 to-[#0078b6]/20 rounded-3xl blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-r from-[#1e40af] via-[#7c3aed] to-[#dc2626] px-16 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500 border border-white/20 backdrop-blur-sm">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-wide font-['Poppins']">
                  OUR PRESTIGIOUS
                </h2>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-[#ffd700] to-[#f59e0b] bg-clip-text mt-2">
                  PARTNER DEVELOPERS
                </div>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-white/80 mt-8 max-w-4xl mx-auto leading-relaxed">
              Celebrating the industry leaders who make ARES 2025 possible
            </p>
          </div>

          {/* Unified Developer Logos Container */}
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-[#ffd700]/10 via-[#e22837]/10 to-[#0078b6]/10 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
              {/* All Developer Logos in One Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 md:gap-8">
                {[
                  // Tier 1 - Larger logos
                  { src: "/developers/primary-logo.png", alt: "Primary Homes", size: "large" },
                  { src: "/developers/apple-one-logo.png", alt: "Apple One", size: "large" },
                  { src: "/developers/be-residences-logo.png", alt: "BE Residences", size: "large" },
                  { src: "/developers/italpinas-logo.png", alt: "Italpinas", size: "large" },

                  // Tier 2 - Medium logos
                  { src: "/developers/Keyland Logo.jpg", alt: "Keyland", size: "medium" },
                  { src: "/developers/grandland-logo.png", alt: "Grandland", size: "medium" },
                  { src: "/developers/a-brown-logo.png", alt: "A Brown Company", size: "medium" },
                  { src: "/developers/cli-logo.png", alt: "Cebu Landmasters", size: "medium" },
                  { src: "/developers/weecomm-logo.png", alt: "Weecomm", size: "medium" },

                  // Tier 3 & 4 - Standard logos
                  { src: "/developers/priland-logo.png", alt: "Priland", size: "standard" },
                  { src: "/developers/Primeworld Logo.jpg", alt: "Primeworld", size: "standard" },
                  { src: "/developers/eon-logo.png", alt: "EON Realty", size: "standard" },
                  { src: "/developers/ProFriends.png", alt: "ProFriends", size: "standard" },
                  { src: "/developers/king-logo.png", alt: "King Properties", size: "standard" },
                  { src: "/developers/explorer-logo.png", alt: "Explorer Davao", size: "standard" },
                  { src: "/developers/aeon-luxe-logo.png", alt: "Aeon Luxe", size: "standard" },
                  { src: "/developers/alsons-logo.png", alt: "Alsons", size: "standard" },
                  { src: "/developers/Jeco Logo.jpg", alt: "Jeco Development", size: "standard" },
                  { src: "/developers/First Georgetown Logo.jpg", alt: "First Georgetown", size: "standard" },
                  { src: "/developers/filinvest-logo.png", alt: "Filinvest", size: "standard" },
                  { src: "/developers/damosa-logo.png", alt: "Damosa Land", size: "standard" },
                  { src: "/developers/nexus-logo.png", alt: "Nexus", size: "standard" },
                  { src: "/developers/taft-logo.png", alt: "Taft Properties", size: "standard" },
                  { src: "/developers/wrld-logo.png", alt: "WRLD", size: "standard" },
                  { src: "/developers/Marrea Logo.jpg", alt: "Marrea", size: "standard" },
                  { src: "/developers/Mycollex Logo.jpg", alt: "Mycollex", size: "standard" },
                  { src: "/developers/johndorf-logo.png", alt: "Johndorf", size: "standard" },
                  { src: "/developers/Jamaica Logo.jpg", alt: "Jamaica", size: "standard" },
                  { src: "/developers/Eastland Logo.PNG", alt: "Eastland", size: "standard" },
                ].map((logo, index) => (
                  <div
                    key={index}
                    className={`group relative animate-in slide-in-from-bottom duration-1000 ${
                      logo.size === "large"
                        ? "col-span-2 sm:col-span-2 md:col-span-2"
                        : logo.size === "medium"
                          ? "col-span-1 sm:col-span-1 md:col-span-1"
                          : "col-span-1"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#ffd700]/20 via-[#e22837]/20 to-[#0078b6]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/30 group-hover:border-[#ffd700]/50 group-hover:bg-white/90">
                      <div className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-br from-[#ffd700] to-[#f59e0b] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <img
                        src={logo.src || "/placeholder.svg"}
                        alt={logo.alt}
                        className={`w-full object-contain group-hover:scale-110 transition-transform duration-500 filter group-hover:brightness-110 ${
                          logo.size === "large"
                            ? "h-20 md:h-24"
                            : logo.size === "medium"
                              ? "h-16 md:h-18"
                              : "h-12 md:h-14"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#ffd700]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-br from-[#ffd700]/30 to-[#f59e0b]/30 rounded-full blur-sm" />
              <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-[#e22837]/30 to-[#0078b6]/30 rounded-full blur-sm" />
              <div className="absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-br from-[#0078b6]/30 to-[#7c3aed]/30 rounded-full blur-sm" />
              <div className="absolute bottom-4 right-4 w-10 h-10 bg-gradient-to-br from-[#ffd700]/20 to-[#e22837]/20 rounded-full blur-lg" />
            </div>
          </div>

          {/* Premium Footer CTA */}
          <div className="text-center mt-20">
            <div className="inline-block relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#ffd700]/30 to-[#f59e0b]/30 rounded-2xl blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-r from-[#e22837] to-[#0078b6] px-12 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border border-white/20">
                <p className="text-white font-semibold text-lg md:text-xl">Join Our Network of Excellence</p>
                <p className="text-white/80 text-sm mt-1">Partnership opportunities available for ARES 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video & Countdown Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920&text=Geometric+Pattern')] opacity-5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Experience{" "}
              <span className="text-transparent bg-gradient-to-r from-[#ffd700] to-[#f59e0b] bg-clip-text">
                ARES 2025
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Get an exclusive preview of what awaits you at Asia's premier real estate summit
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 group">
              <video
                controls
                className="w-full h-auto"
                poster="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ares-thumbnail.png"
              >
                <source
                  src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES+2025+TEASER.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">Event Countdown</h3>
            <div className="flex justify-center">
              <div className="transform scale-90">
                <CountdownTimer />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Shaping the{" "}
                  <span className="text-transparent bg-gradient-to-r from-[#e22837] to-[#0078b6] bg-clip-text">
                    Future
                  </span>{" "}
                  of Real Estate
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] rounded-full mb-8" />
              </div>

              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p className="text-xl font-semibold text-gray-900">
                  ARES brings together the brightest minds in Asian real estate for an unprecedented summit of
                  innovation and collaboration.
                </p>
                <p>
                  Our biennial international conference unites hundreds of industry leaders, from seasoned developers to
                  cutting-edge proptech innovators, creating a dynamic ecosystem of knowledge exchange.
                </p>
                <p>
                  Experience world-class presentations, engage in interactive workshops, and discover the latest trends
                  shaping the future of real estate across Asia.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/about">
                  <Button className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Learn More
                  </Button>
                </Link>
                <Link href="/speakers">
                  <Button
                    variant="outline"
                    className="border-2 border-[#0078b6] text-[#0078b6] hover:bg-[#0078b6] hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
                  >
                    View Speakers
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 rounded-3xl blur-2xl" />
              <img
                src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES+1.jpg"
                alt="ARES Event"
                className="relative w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Moments of{" "}
              <span className="text-transparent bg-gradient-to-r from-[#ffd700] to-[#f59e0b] bg-clip-text">
                Excellence
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Relive the highlights and memorable moments from previous ARES summits
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {galleryImages.slice(0, 6).map((image, index) => (
              <div
                key={index}
                className="group cursor-pointer relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                onClick={() => handleImageClick(index)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`ARES Event ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/gallery">
              <Button className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                Explore Full Gallery
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920&text=Contact+Pattern')] opacity-5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="text-white space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to{" "}
                  <span className="text-transparent bg-gradient-to-r from-[#ffd700] to-[#f59e0b] bg-clip-text">
                    Join Us?
                  </span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] rounded-full mb-8" />
                <p className="text-xl text-white/80 leading-relaxed">
                  Connect with us for registration, sponsorship opportunities, or any questions about ARES 2025.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#0078b6] to-[#005a8b] rounded-xl flex items-center justify-center">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email Us</h3>
                    <p className="text-white/80">info@filipinohomes.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#e22837] to-[#d41e2d] rounded-xl flex items-center justify-center">
                    <Phone size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Call Us</h3>
                    <p className="text-white/80">(+63) 977 815 0888</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-white border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-3"
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-white border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-3"
                  />
                </div>
                <Input
                  placeholder="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="bg-white border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-3"
                />
                <Textarea
                  placeholder="Your Message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="bg-white border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl"
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <CustomLightbox
        open={lightboxOpen}
        onClose={handleLightboxClose}
        currentImage={images[currentImageIndex] || ""}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
        imageCount={images.length}
        currentIndex={currentImageIndex}
      />
    </div>
  )
}

export default SponsorsPage
