"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("https://api.leuteriorealty.com/ares/v1/public/api/ares/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      content: "info@filipinohomes.com",
      description: "Send us an email anytime",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      content: "(+63) 977 815 0888",
      description: "Mon-Fri 9AM-6PM (PHT)",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      content: "Cebu City, Philippines",
      description: "Our headquarters",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      content: "9:00 AM - 6:00 PM",
      description: "Monday to Friday",
    },
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0078b6]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e22837]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-6 mt-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-gradient-to-r from-[#ffd700] via-white to-[#ffd700] bg-clip-text leading-tight">
              CONTACT US
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] mx-auto rounded-full mb-8" />
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto">
              Ready to join ARES 2025? We're here to help with registration, sponsorship opportunities, and any
              questions you may have.
            </p>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-[#e22837] to-[#0078b6] w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                    {info.icon}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{info.title}</h3>
                  <p className="text-[#ffd700] font-medium mb-1">{info.content}</p>
                  <p className="text-white/60 text-sm">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Left Side - Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Let's{" "}
                    <span className="text-transparent bg-gradient-to-r from-[#e22837] to-[#0078b6] bg-clip-text">
                      Connect
                    </span>
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-[#e22837] to-[#0078b6] rounded-full mb-8" />
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Whether you're interested in attending, speaking, or sponsoring ARES 2025, we'd love to hear from
                    you. Our team is ready to assist you with all your inquiries.
                  </p>
                </div>

                {/* Enhanced Contact Cards */}
                <div className="space-y-6">
                  {contactInfo.slice(0, 2).map((info, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                      <div className="bg-gradient-to-r from-[#e22837] to-[#0078b6] w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                        <p className="text-lg font-semibold text-[#0078b6] mb-1">{info.content}</p>
                        <p className="text-gray-600">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Image */}
                <div className="relative hidden lg:block">
                  <div className="absolute -inset-6 bg-gradient-to-r from-[#e22837]/20 to-[#0078b6]/20 rounded-3xl blur-2xl" />
                  <img
                    src="/contact-us-page-left.png"
                    alt="Customer Support"
                    className="relative w-full h-[300px] object-cover rounded-3xl shadow-2xl"
                  />
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-2xl border border-gray-100">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white px-8 py-3 rounded-full"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h3>
                      <p className="text-gray-600">Fill out the form below and we'll respond as soon as possible.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                          <Input
                            placeholder="Enter your full name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                        <Input
                          placeholder="Enter your phone number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl py-4 text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                        <Textarea
                          placeholder="Tell us how we can help you..."
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="bg-gray-50 border-gray-200 focus:border-[#0078b6] focus:ring-[#0078b6] rounded-xl text-lg"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#e22837] to-[#0078b6] hover:from-[#d41e2d] hover:to-[#005a8b] text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Send size={20} />
                            Send Message
                          </div>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[500px] relative">
        <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2">Filipino Homes Headquarters</h3>
          <p className="text-gray-600 text-sm">Cebu City, Philippines</p>
        </div>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1962.7364133508831!2d123.88903657855424!3d10.303992717286546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a99956c12817ef%3A0xa4da7decf55d8a26!2sFilipinoHomes!5e0!3m2!1sen!2sph!4v1737531717312!5m2!1sen!2sph&disableDefaultUI=true&maptype=roadmap&style=feature:poi|visibility:off&style=feature:transit|visibility:off"
          width="100%"
          height="500"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale hover:grayscale-0 transition-all duration-500"
        />
      </section>
    </div>
  )
}

export default ContactPage
