"use client"

import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white text-gray-700 relative overflow-hidden border-t border-blue-100 shadow-lg">
      {/* Animated top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#0078b6] via-[#e22837] via-[#0078b6] to-transparent bg-[length:200%_100%] animate-pulse" />

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16">
          {/* Left Section */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <img
              src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+LOGO+WITH+SQUARE+A+(2).png"
              alt="ARES Logo"
              className="max-w-sm w-full h-auto mb-6 transition-transform hover:scale-105 filter drop-shadow-lg"
            />
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              © 2011 - {currentYear} Filipino Homes.
              <br />
              All Rights Reserved.
            </p>
          </div>

          {/* Right Section */}
          <div className="flex-1 max-w-2xl">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#0078b6] to-[#e22837] bg-clip-text text-transparent relative">
                About Ares
                <div className="absolute bottom-0 left-0 w-16 h-1 bg-gradient-to-r from-[#0078b6] to-[#e22837] rounded-full" />
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                The Asian Real Estate Summit (ARES) is an bi-annual international conference uniting real estate
                professionals across Asia. We facilitate knowledge exchange, networking, and collaboration among
                developers, brokers, agents, and proptech companies.
              </p>
            </div>

            {/* Social Media */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#0078b6] mb-4">Follow Us</h3>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="https://www.facebook.com/filipinohomes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-[#1877f2] to-[#0d5dbf] text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://www.instagram.com/filipinohomes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-[#e4405f] to-[#833ab4] text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://www.linkedin.com/company/filipino-homes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-[#0077b5] to-[#005885] text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="https://x.com/filipinohomes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-[#1da1f2] to-[#0d8bd9] text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap gap-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-[#0078b6] font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-[#0078b6] font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                About
              </Link>
              <Link
                href="/gallery"
                className="text-gray-600 hover:text-[#0078b6] font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Gallery
              </Link>
              <Link
                href="/contact-us"
                className="text-gray-600 hover:text-[#0078b6] font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
