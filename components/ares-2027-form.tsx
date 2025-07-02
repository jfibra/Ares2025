"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CheckCircle, Rocket, Star, Zap, Globe, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const Ares2027Form = () => {
  const [showIntro, setShowIntro] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    team: "",
    city: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deviceInfo, setDeviceInfo] = useState({
    ip_address: "",
    device_type: "",
    browser: "",
    operating_system: "",
    country: "",
    region: "",
    city_from_ip: "",
    isp: "",
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Detect device information
    const detectDeviceInfo = async () => {
      try {
        // Get basic device info
        const userAgent = navigator.userAgent
        let deviceType = "Desktop"
        let browser = "Unknown"
        let operatingSystem = "Unknown"

        // Detect device type
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
          deviceType = /iPad/i.test(userAgent) ? "Tablet" : "Mobile"
        }

        // Detect browser
        if (userAgent.includes("Chrome")) browser = "Chrome"
        else if (userAgent.includes("Firefox")) browser = "Firefox"
        else if (userAgent.includes("Safari")) browser = "Safari"
        else if (userAgent.includes("Edge")) browser = "Edge"

        // Detect OS
        if (userAgent.includes("Windows")) operatingSystem = "Windows"
        else if (userAgent.includes("Mac")) operatingSystem = "macOS"
        else if (userAgent.includes("Linux")) operatingSystem = "Linux"
        else if (userAgent.includes("Android")) operatingSystem = "Android"
        else if (userAgent.includes("iOS")) operatingSystem = "iOS"

        try {
          // Get IP and location info
          const ipResponse = await fetch("https://api.ipify.org?format=json")
          const ipData = await ipResponse.json()
          const ip = ipData.ip

          // Get detailed location info
          const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`)
          const locationData = await locationResponse.json()

          setDeviceInfo({
            ip_address: ip,
            device_type: deviceType,
            browser: browser,
            operating_system: operatingSystem,
            country: locationData.country_name || "",
            region: locationData.region || "",
            city_from_ip: locationData.city || "",
            isp: locationData.org || "",
          })
        } catch (locationError) {
          console.warn("Could not get location info:", locationError)
          setDeviceInfo({
            ip_address: "",
            device_type: deviceType,
            browser: browser,
            operating_system: operatingSystem,
            country: "",
            region: "",
            city_from_ip: "",
            isp: "",
          })
        }
      } catch (error) {
        console.error("Error detecting device info:", error)
      }
    }

    detectDeviceInfo()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert("Please enter your name.")
      return false
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert("Please enter a valid email address.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 15
        })
      }, 200)

      const submitData = {
        ...formData,
        ...deviceInfo,
      }

      console.log("Submitting data:", submitData)

      // Try HTTPS first, then HTTP as fallback
      let response
      try {
        response = await fetch("https://api.leuteriorealty.com/ares/v1/public/api/ares2027", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          body: JSON.stringify(submitData),
        })
      } catch (httpsError) {
        console.warn("HTTPS failed, trying HTTP:", httpsError)
        response = await fetch("http://api.leuteriorealty.com/ares/v1/public/api/ares2027", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          body: JSON.stringify(submitData),
        })
      }

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Response data:", data)

      if (data.success) {
        setTimeout(() => {
          setShowSuccess(true)
          setTimeout(() => {
            setShowSuccess(false)
            setFormData({
              name: "",
              mobile: "",
              whatsapp: "",
              email: "",
              team: "",
              city: "",
            })
            setUploadProgress(0)
          }, 4000)
        }, 500)
      } else {
        throw new Error(data.message || "Submission failed")
      }
    } catch (error) {
      console.error("Submission error:", error)

      let errorMessage = "There was an error submitting your information. Please try again."

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMessage =
          "Network error: Unable to connect to the server. Please check your internet connection and try again."
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`
      }

      alert(errorMessage)
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Intro Animation */}
      {showIntro && (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#0078b6] via-purple-600 to-[#e22837] flex flex-col justify-center items-center z-[10000] animate-in fade-in duration-1000">
          <div className="relative">
            <div className="absolute w-80 h-80 bg-gradient-radial from-white/30 to-transparent rounded-full animate-pulse" />
            <div className="absolute w-60 h-60 bg-gradient-radial from-cyan-400/20 to-transparent rounded-full animate-ping" />
            <img
              src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
              alt="ARES Logo"
              className="relative max-w-sm mx-auto h-auto filter drop-shadow-2xl animate-in zoom-in duration-1000"
            />
          </div>
          <div className="text-white text-center mt-8 animate-in slide-in-from-bottom duration-1000 delay-500">
            <h1 className="text-5xl md:text-7xl font-black mb-4 text-shadow-lg bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              ARES 2027
            </h1>
            <p className="text-2xl md:text-3xl font-bold">The Future Awaits!</p>
            <div className="flex justify-center mt-4">
              <Rocket className="w-8 h-8 text-cyan-300 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-0" />

      {/* Futuristic Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Floating Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Neon Stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`neon-star-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Moving Light Streaks */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`streak-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
            style={{
              width: "200px",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Floating Orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute w-4 h-4 rounded-full animate-pulse"
            style={{
              background: `radial-gradient(circle, ${
                ["#00f5ff", "#ff00ff", "#00ff00", "#ffff00"][Math.floor(Math.random() * 4)]
              }, transparent)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Rotating Cosmic Ring */}
        <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 opacity-10">
          <div
            className="w-full h-full rounded-full border-2 border-dashed border-cyan-400 animate-spin"
            style={{ animationDuration: "20s" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 pt-32 pb-20 animate-in slide-in-from-bottom duration-1000 delay-[4000ms]">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" />
                <div className="relative bg-white rounded-full p-4 m-1">
                  <Rocket className="w-12 h-12 text-blue-600" />
                </div>
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-tight animate-in slide-in-from-top duration-1000">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                ARES 2027
              </span>
            </h1>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 animate-in slide-in-from-top duration-1000 delay-300">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Join the Future of Real Estate!
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-cyan-100 max-w-4xl mx-auto leading-relaxed animate-in slide-in-from-top duration-1000 delay-500">
              Be among the first to secure your place in the most revolutionary Asian Real Estate Summit yet. Register
              your interest now and unlock exclusive early access to ARES 2027!
            </p>

            {/* Feature Icons */}
            <div className="flex justify-center space-x-8 mt-12 animate-in slide-in-from-top duration-1000 delay-700">
              <div className="text-center">
                <Globe className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                <p className="text-cyan-200 font-semibold">Global Network</p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-200 font-semibold">Elite Community</p>
              </div>
              <div className="text-center">
                <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-yellow-200 font-semibold">Innovation Hub</p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 animate-in zoom-in duration-1000 delay-700">
            <h3 className="text-4xl md:text-5xl font-black text-center mb-8 relative">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Reserve Your Future
              </span>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mt-2" />
            </h3>

            <div className="text-center mb-8">
              <p className="text-lg text-cyan-100 leading-relaxed">
                Join thousands of visionaries who are shaping the future of Asian real estate. Fill out the form below
                to receive exclusive updates and early bird access!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-cyan-200 mb-2">
                  Full Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl py-4 text-lg font-medium backdrop-blur-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="mobile" className="block text-sm font-bold text-cyan-200 mb-2">
                    Mobile Number
                  </label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl py-4 text-lg font-medium backdrop-blur-sm"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-bold text-cyan-200 mb-2">
                    WhatsApp Number
                  </label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl py-4 text-lg font-medium backdrop-blur-sm"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-cyan-200 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl py-4 text-lg font-medium backdrop-blur-sm"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="team" className="block text-sm font-bold text-cyan-200 mb-2">
                    Company/Team
                  </label>
                  <Input
                    id="team"
                    name="team"
                    value={formData.team}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl py-4 text-lg font-medium backdrop-blur-sm"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-bold text-cyan-200 mb-2">
                    City
                  </label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl py-4 text-lg font-medium backdrop-blur-sm"
                    placeholder="Your city"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {isSubmitting && uploadProgress > 0 && (
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-black py-6 text-xl rounded-2xl shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 border-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Securing Your Spot...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Rocket className="w-6 h-6 mr-3" />
                    Launch Into the Future
                  </span>
                )}
              </Button>
            </form>

            {/* Benefits Section */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Early Bird Access</h4>
                <p className="text-cyan-200 text-sm">Get exclusive early registration privileges</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">VIP Updates</h4>
                <p className="text-purple-200 text-sm">Receive insider news and announcements</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <Globe className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Global Network</h4>
                <p className="text-cyan-200 text-sm">Connect with industry leaders worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[11000] animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-cyan-50 rounded-3xl p-8 md:p-12 text-center max-w-md mx-4 animate-in zoom-in duration-500 border-2 border-cyan-200">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" />
              <div className="relative bg-white rounded-full p-3 m-1">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text mb-4">
              Welcome to the Future!
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Your interest in ARES 2027 has been successfully registered!
            </p>
            <p className="text-gray-600 leading-relaxed">
              We'll keep you updated with exclusive news, early bird offers, and VIP access to this revolutionary event.
            </p>
            <div className="flex justify-center mt-4">
              <Rocket className="w-8 h-8 text-blue-500 animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ares2027Form
