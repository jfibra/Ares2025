"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Facebook, Twitter, Menu, X } from "lucide-react"
import ScrollToTop from "./scroll-to-top"

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Speakers", href: "/speakers" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact Us", href: "/contact-us" },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "visible"
    }
  }, [isOpen])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-400 ${
          isScrolled ? "mt-0" : "mt-12"
        } shadow-lg`}
      >
        {/* Main navbar container */}
        <div className="max-w-6xl mx-auto relative">
          {/* Background that extends left */}
          <div
            className={`absolute top-0 right-full w-screen h-full bg-gradient-to-r from-white to-gray-50 ${
              isScrolled ? "shadow-lg" : ""
            }`}
          />

          {/* Main navbar content */}
          <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 relative">
            <div className="flex justify-between items-center h-20 px-4">
              <div className="flex-shrink-0 z-10">
                <Link href="/" className="block transition-transform hover:scale-105">
                  <img
                    src="https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"
                    alt="Asian Real Estate Summit"
                    className="h-20 w-auto"
                  />
                </Link>
              </div>

              {/* Desktop Menu with Social Icons */}
              <div className="hidden md:flex items-center">
                <div className="flex items-center gap-1 mr-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 relative overflow-hidden ${
                        pathname === item.href
                          ? "bg-gradient-to-r from-[#0078b6] to-[#005a8b] text-white shadow-lg"
                          : "text-gray-700 hover:text-[#0078b6] hover:bg-gray-100"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Social Icons - positioned as part of navigation */}
                <div className="flex flex-col">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-10 bg-gradient-to-br from-[#1877f2] to-[#0d5dbf] text-white flex items-center justify-center hover:from-[#0d5dbf] hover:to-[#1877f2] transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <Facebook size={18} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-10 bg-gradient-to-br from-[#1da1f2] to-[#0d8bd9] text-white flex items-center justify-center hover:from-[#0d8bd9] hover:to-[#1da1f2] transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <Twitter size={18} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  </a>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden z-10">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 text-gray-700 hover:text-[#0078b6] transition-colors"
                  aria-label="Toggle navigation"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Background that extends right only when scrolled */}
          {isScrolled && (
            <div className="absolute top-0 left-full w-screen h-full bg-gradient-to-r from-white to-gray-50 shadow-lg" />
          )}
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-white z-[1001] transform transition-transform duration-400 shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-[#0078b6] hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close navigation"
          >
            <X size={24} />
          </button>
        </div>
        <div className="py-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-6 py-4 text-lg font-semibold transition-all duration-300 border-l-4 ${
                pathname === item.href
                  ? "text-[#0078b6] bg-gradient-to-r from-blue-50 to-red-50 border-l-[#e22837]"
                  : "text-gray-700 border-l-transparent hover:text-[#0078b6] hover:border-l-[#0078b6] hover:bg-gray-50"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[1000] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <ScrollToTop />
    </>
  )
}

export default Navbar
