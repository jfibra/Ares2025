"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { MapPin, Mail, Phone, Play, Pause, Volume2, VolumeX, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import CustomLightbox from "./custom-lightbox"
import CountdownTimer from "./countdown-timer"

const HomePage = () => {
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
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasSeenVideoToday, setHasSeenVideoToday] = useState(false)

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

  useEffect(() => {
    // No sticky timer
  }, [])

  // Auto-play video when modal opens
  useEffect(() => {
    if (showVideoModal && videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current?.play()
        setIsPlaying(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showVideoModal])

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

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
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
      {/* Fixed Hollywood-Style Video Modal */}
      {showVideoModal && !hasSeenVideoToday && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-1000">
          {/* Close button - positioned at top right, always visible */}
          <button
            onClick={closeVideoModal}
            className="absolute top-4 right-4 z-[10000] bg-red-600/80 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-2xl"
          >
            <X size={24} />
          </button>

          <div className="relative w-full max-w-5xl max-h-[90vh] animate-in zoom-in duration-1000 delay-500">
            {/* Cinematic glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#ffd700]/30 via-[#e22837]/30 to-[#0078b6]/30 rounded-2xl blur-xl animate-pulse" />

            <div className="relative bg-gradient-to-br from-black/95 to-gray-900/95 rounded-xl overflow-hidden border border-[#ffd700]/40 shadow-2xl backdrop-blur-sm">
              {/* Compact Header */}
              <div className="text-center py-4 px-6 bg-gradient-to-r from-black/80 to-transparent">
                <div className="mb-3 animate-in slide-in-from-top duration-1000 delay-1000">
                  <img
                    src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
                    alt="ARES 2025"
                    className="max-w-xs mx-auto h-auto filter drop-shadow-lg"
                  />
                </div>
                <div className="bg-gradient-to-r from-[#e22837] to-[#0078b6] px-6 py-2 rounded-full inline-block shadow-lg animate-in slide-in-from-bottom duration-1000 delay-1200">
                  <p className="text-white font-bold text-sm uppercase tracking-wider">
                    BANGKOK, THAILAND | JULY 2, 2025
                  </p>
                </div>
              </div>

              {/* Video Container - Responsive */}
              <div className="relative group">
                <video
                  ref={videoRef}
                  className="w-full h-auto max-h-[60vh] object-cover"
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source
                    src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES+2025+TEASER.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={togglePlay}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Play button overlay when paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="bg-[#e22837]/90 hover:bg-[#e22837] text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-2xl animate-pulse"
                    >
                      <Play size={32} className="ml-1" />
                    </button>
                  </div>
                )}
              </div>

              {/* Compact Footer */}
              <div className="text-center py-4 bg-gradient-to-r from-transparent to-black/50">
                <Button
                  onClick={closeVideoModal}
                  className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-3 text-base font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Enter ARES 2025
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Hero Section */}
      <div
        className="min-h-screen flex items-center text-white relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url(/bangkok.png)",
        }}
      >
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/30 to-black/80" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffd700]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e22837]/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#0078b6]/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="container mx-auto px-4 mt-20 relative z-10">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            {/* Modern hero title */}
            <div className="space-y-4 animate-in slide-in-from-bottom duration-1000">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-['Lato'] bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                ARES 2025
              </h1>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold font-['Lato'] text-white/90 drop-shadow-lg">
                Asian Real Estate Summit
              </h2>
            </div>

            {/* Event details */}
            <div className="flex items-center justify-center space-x-3 animate-in slide-in-from-bottom duration-1000 delay-300">
              <div className="bg-gradient-to-r from-[#e22837] to-[#0078b6] p-1 rounded-full">
                <div className="bg-black/50 backdrop-blur-sm px-8 py-4 rounded-full flex items-center space-x-3">
                  <MapPin className="text-[#ffd700] text-2xl" />
                  <span className="text-xl md:text-2xl font-bold">Bangkok, Thailand</span>
                  <span className="text-[#ffd700] text-xl">•</span>
                  <span className="text-xl md:text-2xl font-bold">July 1-2, 2025</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in slide-in-from-bottom duration-1000 delay-500">
              <Link href="/about">
                <Button className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-2 border-white/20">
                  Discover ARES
                </Button>
              </Link>
              <Link href="/speakers">
                <Button
                  variant="outline"
                  className="border-2 border-white/50 text-white hover:bg-white/10 px-12 py-6 text-xl font-bold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Meet Speakers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Teaser Video Section */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-black py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920&text=Geometric+Pattern')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 animate-in slide-in-from-top duration-1000">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#ffd700] to-white bg-clip-text font-['Lato'] mb-6">
              Experience the Future
            </h2>
            <p className="text-white/80 text-xl max-w-3xl mx-auto leading-relaxed">
              Get an exclusive preview of Asia's most prestigious real estate summit
            </p>
          </div>

          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom duration-1000 delay-300">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-black border border-[#ffd700]/30 group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#e22837]/20 via-transparent to-[#0078b6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <video
                controls
                className="w-full h-auto relative z-10"
                poster="/placeholder.svg?height=600&width=1000&text=ARES+2025+Teaser"
              >
                <source
                  src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES+2025+TEASER.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Smaller Countdown Timer Below Video */}
          <div id="countdown-section" className="mt-16 animate-in slide-in-from-bottom duration-1000 delay-500">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-[#ffd700] mb-4">Event Countdown</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full" />
            </div>
            <div className="flex justify-center">
              <div className="transform scale-75 md:scale-90">
                <CountdownTimer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern About Section */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920&text=Subtle+Pattern')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-in slide-in-from-left duration-1000">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 rounded-3xl blur-xl" />
                <img
                  src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES+1.jpg"
                  alt="ARES Event"
                  className="relative w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                />
              </div>
            </div>

            <div className="animate-in slide-in-from-right duration-1000 delay-300">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#e22837] to-[#0078b6] bg-clip-text font-['Lato'] mb-6">
                    Redefining Real Estate
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] rounded-full mb-8" />
                </div>

                <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                  <p className="text-xl font-semibold text-gray-900">
                    ARES brings together the brightest minds in Asian real estate for an unprecedented summit of
                    innovation and collaboration.
                  </p>

                  <p>
                    Our bi-annual international conference unites hundreds of industry leaders, from seasoned developers
                    to cutting-edge proptech innovators, creating a dynamic ecosystem of knowledge exchange and
                    strategic partnerships.
                  </p>

                  <p>
                    Experience world-class presentations from twelve renowned experts, engage in interactive workshops,
                    and discover the latest trends shaping the future of real estate across Asia.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/about">
                    <Button className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      Learn More
                    </Button>
                  </Link>
                  <Link href="/speakers">
                    <Button
                      variant="outline"
                      className="border-2 border-[#0078b6] text-[#0078b6] hover:bg-[#0078b6] hover:text-white px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 hover:scale-105"
                    >
                      View Speakers
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Gallery Section */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e22837]/10 via-transparent to-[#0078b6]/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-in slide-in-from-top duration-1000">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#ffd700] to-white bg-clip-text font-['Lato'] mb-6">
              Moments of Excellence
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
            <p className="text-white/80 text-xl max-w-3xl mx-auto">Relive the highlights from previous ARES summits</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-1000 delay-300">
            {galleryImages.slice(0, 6).map((image, index) => (
              <div key={index} className="group cursor-pointer" onClick={() => handleImageClick(index)}>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`ARES Event ${index + 1}`}
                    className="w-full h-64 object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-in slide-in-from-bottom duration-1000 delay-500">
            <Link href="/gallery">
              <Button className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                Explore Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Contact Section */}
      <div
        className="min-h-screen flex items-center justify-center py-20 bg-cover bg-center relative"
        style={{
          backgroundImage: "url(/contact-us-background.png)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-blue-900/60 to-black/80" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative animate-in slide-in-from-left duration-1000">
              <div className="hidden lg:block">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#e22837]/30 to-[#0078b6]/30 rounded-3xl blur-xl" />
                <img
                  src="/lady-support.png"
                  alt="Customer Support"
                  className="relative w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                />
              </div>

              {/* Contact Info Cards */}
              <div className="lg:absolute lg:top-16 lg:-right-16 space-y-6">
                <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#0078b6] to-[#005a8b] text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Mail size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">Email Us</h3>
                      <p className="text-gray-600 text-lg">info@filipinohomes.com</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#e22837] to-[#d41e2d] text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Phone size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">Call Us</h3>
                      <p className="text-gray-600 text-lg">(+63) 977 815 0888</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-in slide-in-from-right duration-1000 delay-300">
              <div className="bg-white/95 backdrop-blur-sm p-8 lg:p-12 rounded-3xl shadow-2xl border border-white/20">
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-[#e22837] to-[#0078b6] bg-clip-text font-['Lato'] mb-4">
                    Get in Touch
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] rounded-full mb-6" />
                  <p className="text-gray-600 text-lg">
                    Ready to join ARES 2025? Contact us for more information about registration, sponsorship
                    opportunities, or any questions you may have.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      placeholder="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-white/80 border-gray-300 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg"
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-white/80 border-gray-300 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg"
                    />
                  </div>
                  <Input
                    placeholder="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="bg-white/80 border-gray-300 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg"
                  />
                  <Textarea
                    placeholder="Your Message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="bg-white/80 border-gray-300 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl text-lg"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white py-6 text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default HomePage
