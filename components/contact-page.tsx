"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

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
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div
        className="min-h-screen flex items-center text-white relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url(/contact-us-layer.png)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0078b6]/80 via-black/60 to-black/80" />

        <div className="container mx-auto px-4 mt-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-['Lato'] bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text text-transparent drop-shadow-2xl leading-tight mb-6">
                  CONTACT US
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] rounded-full mb-8" />
              </div>

              <div className="space-y-6 text-white/90 text-lg leading-relaxed max-w-2xl">
                <p className="text-xl font-semibold">
                  The Asian Real Estate Summit (ARES) is a bi-annual international conference uniting real estate
                  professionals across Asia.
                </p>
                <p>
                  We facilitate knowledge exchange, networking, and collaboration among developers, brokers, agents, and
                  proptech companies. Ready to join us? Get in touch today!
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#e22837]/30 to-[#0078b6]/30 rounded-3xl blur-xl" />
              <img
                src="/contact-us-icon.png"
                alt="Contact ARES"
                className="relative w-full max-w-lg mx-auto h-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="hidden lg:block">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#e22837]/30 to-[#0078b6]/30 rounded-3xl blur-xl" />
                <img
                  src="/contact-us-page-left.png"
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

            <div>
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

      {/* Map Section */}
      <div className="h-[550px] relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1962.7364133508831!2d123.88903657855424!3d10.303992717286546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a99956c12817ef%3A0xa4da7decf55d8a26!2sFilipinoHomes!5e0!3m2!1sen!2sph!4v1737531717312!5m2!1sen!2sph&disableDefaultUI=true&maptype=roadmap&style=feature:poi|visibility:off&style=feature:transit|visibility:off"
          width="100%"
          height="550"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale hover:grayscale-0 transition-all duration-500"
        />
      </div>
    </div>
  )
}

export default ContactPage
