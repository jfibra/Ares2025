"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, Search, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Thailand-themed Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url(/bangkok.png)",
        }}
      />

      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-slate-900/80 to-black/70 z-10" />

      {/* Floating Thai Elements */}
      <div className="fixed inset-0 pointer-events-none z-20">
        <div className="absolute top-[10%] left-[5%] w-20 h-20 opacity-20 animate-float">
          <div className="w-full h-full bg-gradient-to-br from-[#ffd700] to-[#f59e0b] rounded-full flex items-center justify-center">
            <span className="text-2xl">🏛️</span>
          </div>
        </div>
        <div className="absolute top-[15%] right-[8%] w-16 h-16 opacity-25 animate-float delay-1000">
          <div className="w-full h-full bg-gradient-to-br from-[#e22837] to-[#d41e2d] rounded-full flex items-center justify-center">
            <span className="text-xl">🐘</span>
          </div>
        </div>
        <div className="absolute top-1/2 left-[3%] w-18 h-18 opacity-20 animate-bounce">
          <div className="w-full h-full bg-gradient-to-br from-[#0078b6] to-[#005a8b] rounded-full flex items-center justify-center">
            <span className="text-lg">🏮</span>
          </div>
        </div>
        <div className="absolute top-[60%] right-[5%] w-14 h-14 opacity-25 animate-bounce delay-500">
          <div className="w-full h-full bg-gradient-to-br from-[#ffd700] to-[#f59e0b] rounded-full flex items-center justify-center">
            <span className="text-lg">🌸</span>
          </div>
        </div>
        <div className="absolute bottom-[15%] left-[10%] w-16 h-16 opacity-20 animate-float delay-2000">
          <div className="w-full h-full bg-gradient-to-br from-[#e22837] to-[#0078b6] rounded-full flex items-center justify-center">
            <span className="text-lg">🏯</span>
          </div>
        </div>
        <div className="absolute bottom-[20%] right-[12%] w-12 h-12 opacity-30 animate-float delay-3000">
          <div className="w-full h-full bg-gradient-to-br from-[#0078b6] to-[#e22837] rounded-full flex items-center justify-center">
            <span className="text-sm">🎋</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* ARES Logo */}
          <div
            className={`mb-8 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <img
              src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
              alt="ARES 2025"
              className="max-w-sm mx-auto h-auto filter drop-shadow-2xl"
            />
          </div>

          {/* 404 Message */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="relative mb-8">
              <h1 className="text-8xl md:text-9xl font-black text-transparent bg-gradient-to-r from-[#ffd700] via-[#e22837] to-[#0078b6] bg-clip-text leading-none font-['Poppins']">
                404
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd700]/20 via-[#e22837]/20 to-[#0078b6]/20 rounded-3xl blur-3xl animate-pulse" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Poppins']">Oops! Page Not Found</h2>
            <p className="text-xl text-white/80 mb-2">{"Looks like you've wandered off the path to Bangkok! 🇹🇭"}</p>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              {
                "The page you're looking for doesn't exist, but don't worry - ARES 2025 is still happening and we're here to help you find your way back to the summit!"
              }
            </p>
          </div>

          {/* Event Info Card */}
          <div
            className={`bg-white/10 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-white/20 shadow-2xl mb-8 transition-all duration-1000 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <MapPin className="text-[#ffd700]" size={24} />
                <span className="font-semibold">Bangkok, Thailand</span>
              </div>
              <div className="hidden md:block w-px h-8 bg-white/30" />
              <div className="flex items-center gap-2">
                <Calendar className="text-[#ffd700]" size={24} />
                <span className="font-semibold">July 2, 2025</span>
              </div>
            </div>
            <p className="text-[#ffd700] font-bold text-lg mt-4">🌟 Asia's Premier Real Estate Summit 🌟</p>
          </div>

          {/* Action Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <Link href="/">
              <Button className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <Home className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                Back to Home
              </Button>
            </Link>

            <Link href="/speakers">
              <Button
                variant="outline"
                className="border-2 border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-black px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 group"
              >
                <Search className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                View Speakers
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div
            className={`mt-12 transition-all duration-1000 delay-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <p className="text-white/60 mb-4">Quick Links:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/about"
                className="text-[#0078b6] hover:text-[#ffd700] font-semibold transition-colors duration-300 hover:underline"
              >
                About ARES
              </Link>
              <span className="text-white/30">•</span>
              <Link
                href="/gallery"
                className="text-[#0078b6] hover:text-[#ffd700] font-semibold transition-colors duration-300 hover:underline"
              >
                Gallery
              </Link>
              <span className="text-white/30">•</span>
              <Link
                href="/contact-us"
                className="text-[#0078b6] hover:text-[#ffd700] font-semibold transition-colors duration-300 hover:underline"
              >
                Contact Us
              </Link>
              <span className="text-white/30">•</span>
              <Link
                href="/ares-2025-countdown-contest"
                className="text-[#0078b6] hover:text-[#ffd700] font-semibold transition-colors duration-300 hover:underline"
              >
                Contest
              </Link>
            </div>
          </div>

          {/* Thai Greeting */}
          <div
            className={`mt-8 transition-all duration-1000 delay-1200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <p className="text-2xl mb-2">🙏</p>
            <p className="text-white/70 italic">"สวัสดี" - See you in Bangkok for ARES 2025!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
