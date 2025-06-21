"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const CountdownContest = () => {
  const [showIntro, setShowIntro] = useState(true)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    whatsapp_number: "",
    leuterio_email: "",
    facebook_profile: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showHowToJoin, setShowHowToJoin] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
      setShowHowToJoin(true)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const required = ["first_name", "last_name"]
    for (const field of required) {
      if (!formData[field as keyof typeof formData].trim()) {
        return false
      }
    }
    if (formData.leuterio_email && !/^\S+@\S+\.\S+$/.test(formData.leuterio_email)) {
      alert("Please enter a valid email address for Leuterio Realty Account.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert("Please fill in at least your First Name and Last Name.")
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

      const response = await fetch("https://api.leuteriorealty.com/ares/v1/public/api/countdown-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number || null,
          whatsapp_number: formData.whatsapp_number || null,
          leuterio_email: formData.leuterio_email || null,
          facebook_profile: formData.facebook_profile || null,
          status: "Pending",
        }),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (data.success) {
        setTimeout(() => {
          setShowSuccess(true)
          setTimeout(() => {
            setShowSuccess(false)
            setFormData({
              first_name: "",
              last_name: "",
              phone_number: "",
              whatsapp_number: "",
              leuterio_email: "",
              facebook_profile: "",
            })
            setUploadProgress(0)
          }, 3000)
        }, 500)
      } else {
        throw new Error(data.message || "Submission failed")
      }
    } catch (error) {
      console.error("Submission error:", error)
      alert("There was an error submitting your entry. Please try again.")
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Intro Animation */}
      {showIntro && (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-[#0078b6] to-[#e22837] flex flex-col justify-center items-center z-[10000] animate-in fade-in duration-1000">
          <div className="relative">
            <div className="absolute w-72 h-72 bg-gradient-radial from-white/20 to-transparent rounded-full animate-pulse" />
            <img
              src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
              alt="ARES Logo"
              className="relative max-w-sm mx-auto h-auto filter drop-shadow-2xl animate-in zoom-in duration-1000"
            />
          </div>
          <div className="text-white text-center mt-8 animate-in slide-in-from-bottom duration-1000 delay-500">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-shadow-lg">COUNTDOWN CONTEST</h1>
            <p className="text-xl md:text-2xl font-bold">Share Your Excitement!</p>
          </div>
        </div>
      )}

      {/* How to Join Modal */}
      {showHowToJoin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[12000] p-4">
          <div className="relative bg-white rounded-2xl p-2 max-w-4xl max-h-[90vh] overflow-auto">
            <button
              className="absolute top-4 right-4 bg-[#e22837] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl hover:bg-[#d41e2d] transition-colors z-10"
              onClick={() => setShowHowToJoin(false)}
            >
              <X size={20} />
            </button>
            <img
              src="/howtojoin.jpeg"
              alt="How to Join"
              className="w-full h-auto rounded-xl"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=600&width=800&text=How+to+Join+Instructions"
              }}
            />
          </div>
        </div>
      )}

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white z-0" />

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Floating decorations */}
        <div className="absolute top-[10%] left-[5%] w-32 h-32 opacity-30 animate-float">
          <img
            src="/placeholder.svg?height=128&width=128&text=Thai+Shrine"
            alt="Decoration"
            className="w-full h-full"
          />
        </div>
        <div className="absolute top-[12%] right-[5%] w-28 h-28 opacity-30 animate-float delay-1000">
          <img
            src="/placeholder.svg?height=112&width=112&text=Thai+Temple"
            alt="Decoration"
            className="w-full h-full"
          />
        </div>
        <div className="absolute top-1/2 left-[2%] w-24 h-24 opacity-20 animate-bounce">
          <img src="/placeholder.svg?height=96&width=96&text=Thai+Statue" alt="Decoration" className="w-full h-full" />
        </div>
        <div className="absolute top-[55%] right-[2%] w-24 h-24 opacity-20 animate-bounce delay-500">
          <img src="/placeholder.svg?height=96&width=96&text=Thai+Statue" alt="Decoration" className="w-full h-full" />
        </div>
        <div className="absolute bottom-[5%] left-[8%] w-20 h-20 opacity-30 animate-float delay-2000">
          <img src="/placeholder.svg?height=80&width=80&text=Thai+Props" alt="Decoration" className="w-full h-full" />
        </div>
        <div className="absolute bottom-[8%] right-[8%] w-20 h-20 opacity-30 animate-float delay-3000">
          <img src="/placeholder.svg?height=80&width=80&text=Thai+Props" alt="Decoration" className="w-full h-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 pt-32 pb-20 animate-in slide-in-from-bottom duration-1000 delay-[4000ms]">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0078b6] mb-6 leading-tight animate-in slide-in-from-top duration-1000">
              ARES 2025 COUNTDOWN CONTEST
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#e22837] mb-8 animate-in slide-in-from-top duration-1000 delay-300">
              Share Your Excitement & Win Amazing Prizes!
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-in slide-in-from-top duration-1000 delay-500">
              Join our countdown contest by sharing your ARES 2025 countdown post on social media. Fill out the form
              below and stand a chance to win exclusive prizes and special recognition!
            </p>
          </div>

          {/* Form Container */}
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 animate-in zoom-in duration-1000 delay-700">
            <h3 className="text-3xl md:text-4xl font-black text-[#0078b6] text-center mb-8 relative">
              Contest Entry Form
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] rounded-full mt-2" />
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-bold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-bold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg font-medium"
                />
              </div>

              <div>
                <label htmlFor="whatsapp_number" className="block text-sm font-bold text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <Input
                  id="whatsapp_number"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg font-medium"
                />
              </div>

              <div>
                <label htmlFor="leuterio_email" className="block text-sm font-bold text-gray-700 mb-2">
                  Leuterio Realty Account Email
                </label>
                <Input
                  id="leuterio_email"
                  name="leuterio_email"
                  type="email"
                  value={formData.leuterio_email}
                  onChange={handleInputChange}
                  className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg font-medium"
                />
              </div>

              <div>
                <label htmlFor="facebook_profile" className="block text-sm font-bold text-gray-700 mb-2">
                  Facebook Profile URL
                </label>
                <Input
                  id="facebook_profile"
                  name="facebook_profile"
                  value={formData.facebook_profile}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/your-profile"
                  className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg font-medium"
                />
              </div>

              {/* Progress Bar */}
              {isSubmitting && uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0078b6] to-[#e22837] transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#e22837] to-[#d41e2d] hover:from-[#d41e2d] hover:to-[#c41f2d] text-white font-black py-6 text-xl rounded-2xl shadow-2xl hover:shadow-[#e22837]/30 transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? "Submitting Entry..." : "Submit Entry"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[11000] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 md:p-12 text-center max-w-md mx-4 animate-in zoom-in duration-500">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-green-500 mb-4">Entry Submitted Successfully!</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Thank you for participating in the ARES 2025 Countdown Contest. Good luck and stay tuned for the results!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CountdownContest
