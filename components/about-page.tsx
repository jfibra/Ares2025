"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const sponsors = [
    { name: "Cebu Landmasters", image: "/cebulandmasters.webp" },
    { name: "Weecomm", image: "/weecomm.webp" },
    { name: "Filinvest", image: "/filinvest.webp" },
    { name: "BE Residences", image: "/beresidences.webp" },
    { name: "Grandland", image: "/grandland.webp" },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div
        className="min-h-screen flex items-center text-white relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url(/bangkok.png)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/40 to-black/80" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffd700]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e22837]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 mt-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className={`space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-['Lato'] bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text text-transparent drop-shadow-2xl leading-tight mb-6">
                  ABOUT ARES
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] rounded-full mb-8" />
              </div>

              <div className="space-y-6 text-white/90 text-lg leading-relaxed">
                <p className="text-xl font-semibold">
                  ARES is a bi-annual international conference that brings together hundreds of participants from the
                  real estate industry across the Asian region.
                </p>

                <p>
                  Our event provides knowledge exchange, networking, and collaboration among real estate developers,
                  brokers, sales agents, and proptech companies. At ARES, we believe in the power of learning from each
                  other.
                </p>

                <p>
                  We invite twelve of the most prominent real estate experts from across the Asian region to share their
                  best practices in digital marketing. Our speakers provide insights into how they use digital marketing
                  strategies to grow their businesses and reach a wider audience.
                </p>

                <p>
                  This event is an excellent chance to expand your network, make valuable connections, and stay on top
                  of the latest trends and developments in the real estate industry.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/speakers">
                  <Button className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Meet Our Speakers
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button
                    variant="outline"
                    className="border-2 border-white/50 text-white hover:bg-white/10 px-8 py-4 text-lg font-bold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    View Gallery
                  </Button>
                </Link>
              </div>
            </div>

            <div
              className={`relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#e22837]/30 to-[#0078b6]/30 rounded-3xl blur-xl" />
              <img
                src="/about-us-icon.png"
                alt="About ARES"
                className="relative w-full max-w-lg mx-auto h-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920&text=Subtle+Pattern')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#e22837] to-[#0078b6] bg-clip-text font-['Lato'] mb-6">
              Our Mission
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p className="text-xl font-semibold text-gray-900">
                To create a dynamic and collaborative learning environment that promotes growth and success in the real
                estate industry across Asia.
              </p>
              <p>
                We provide a world-class conference experience for all our attendees with carefully curated speakers,
                engaging panel discussions, and interactive workshops.
              </p>
              <p>
                Join us at ARES and be part of the conversation shaping the future of real estate in the Asian region.
                We look forward to welcoming you to our community of like-minded professionals!
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 rounded-3xl blur-xl" />
              <img
                src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES+1.jpg"
                alt="ARES Mission"
                className="relative w-full h-[400px] object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Backdrop */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#ffd700] to-white bg-clip-text font-['Lato'] mb-6">
              ARES Experience
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#e22837]/20 via-transparent to-[#0078b6]/20" />
            <img src="/Backdrop.webp" alt="ARES Backdrop" className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Sponsors Section */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#e22837] to-[#0078b6] bg-clip-text font-['Lato'] mb-6">
              Our Partners
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              We're proud to partner with industry leaders who share our vision for advancing real estate across Asia.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
            {sponsors.map((sponsor, index) => (
              <div
                key={sponsor.name}
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <img
                  src={sponsor.image || "/placeholder.svg?height=100&width=200&text=" + sponsor.name}
                  alt={sponsor.name}
                  className="w-full h-16 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
