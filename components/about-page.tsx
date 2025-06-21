"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Target, Award, Globe, ArrowRight, CheckCircle } from "lucide-react"

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Industry Leaders",
      description: "Connect with top executives, developers, and innovators from across Asia's real estate sector.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Strategic Insights",
      description: "Gain valuable market intelligence and strategic perspectives to drive your business forward.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Expert Knowledge",
      description: "Learn from 12 renowned speakers sharing their expertise and best practices.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Regional Network",
      description: "Build lasting connections with professionals from Thailand, Philippines, and beyond.",
    },
  ]

  const sponsors = [
    { name: "Cebu Landmasters", image: "/cebulandmasters.webp" },
    { name: "Weecomm", image: "/weecomm.webp" },
    { name: "Filinvest", image: "/filinvest.webp" },
    { name: "BE Residences", image: "/beresidences.webp" },
    { name: "Grandland", image: "/grandland.webp" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url(/bangkok.png)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-800/80 to-black/70" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffd700]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e22837]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-6 mt-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div
              className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text leading-tight mb-6">
                ABOUT ARES
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto">
                Asia's premier real estate summit bringing together industry leaders, innovators, and visionaries to
                shape the future of real estate across the region.
              </p>
            </div>

            <div
              className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <Link href="/speakers">
                <Button className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                  Meet Our Speakers
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button
                  variant="outline"
                  className="border-2 border-white/30 text-black hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  View Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our{" "}
                <span className="text-transparent bg-gradient-to-r from-[#e22837] to-[#0078b6] bg-clip-text">
                  Mission
                </span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                To create a dynamic platform for knowledge exchange, networking, and collaboration among real estate
                professionals across Asia.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {features.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-[#e22837] to-[#0078b6] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">What Makes ARES Special</h3>
                <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                  <p>
                    ARES is more than just a conference—it's a transformative experience that brings together the
                    brightest minds in Asian real estate. Our bi-annual summit creates an unparalleled opportunity for
                    learning, networking, and business development.
                  </p>
                  <p>
                    We carefully curate our speaker lineup to include industry pioneers, successful entrepreneurs, and
                    innovative thought leaders who share practical insights and actionable strategies.
                  </p>
                  <p>
                    From interactive workshops to panel discussions, every session is designed to provide maximum value
                    and foster meaningful connections that extend far beyond the event.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 rounded-3xl blur-2xl" />
                <img
                  src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/ARES+1.jpg"
                  alt="ARES Mission"
                  className="relative w-full h-full object-cover rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">

            <div className="text-center">
              <div className="bg-gradient-to-r from-[#e22837]/10 to-[#0078b6]/10 p-8 rounded-3xl border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready for ARES 2025?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Join us in Bangkok for an even bigger and better summit. Register now to secure your spot at Asia's
                  most prestigious real estate event.
                </p>
                <Link href="/contact-us">
                  <Button className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
