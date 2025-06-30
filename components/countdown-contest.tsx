"use client"

import { useState, useEffect } from "react"
import { Clock, Trophy, Star } from "lucide-react"

const CountdownContest = () => {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

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
            <p className="text-xl md:text-2xl font-bold">Submissions Closed!</p>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white z-0" />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Sparkling Stars */}
        {[...Array(30)].map((_, i) => (
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

        {/* Golden Stars */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`golden-star-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}

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
              Submissions Have Officially Closed!
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-in slide-in-from-top duration-1000 delay-500">
              Thank you to everyone who participated in our exciting countdown contest! We received amazing entries from
              our community.
            </p>
          </div>

          {/* Closed Notice Container */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 animate-in zoom-in duration-1000 delay-700">
            <div className="text-center">
              {/* Clock Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e22837] to-[#0078b6] rounded-full animate-pulse" />
                  <div className="relative bg-white rounded-full p-6 m-1">
                    <Clock className="w-16 h-16 text-[#0078b6]" />
                  </div>
                </div>
              </div>

              <h3 className="text-3xl md:text-5xl font-black text-[#e22837] mb-6">Contest Submissions Closed</h3>

              <div className="bg-gradient-to-r from-[#0078b6]/10 to-[#e22837]/10 rounded-2xl p-8 mb-8">
                <Trophy className="w-12 h-12 text-[#e22837] mx-auto mb-4" />
                <h4 className="text-2xl md:text-3xl font-bold text-[#0078b6] mb-4">Winners Announcement Tomorrow!</h4>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  Stay tuned for the exciting announcement of our contest winners. We'll be revealing the lucky
                  participants who will receive amazing prizes and special recognition!
                </p>
              </div>

              {/* Thank You Message */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 mb-8">
                <div className="flex justify-center space-x-2 mb-4">
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                </div>
                <h5 className="text-xl font-bold text-gray-800 mb-3">Thank You for Your Participation!</h5>
                <p className="text-gray-600 leading-relaxed">
                  Your enthusiasm and creativity made this contest a huge success. The ARES 2025 community continues to
                  amaze us with your passion for the Asian Real Estate Summit.
                </p>
              </div>

              {/* Social Media Reminder */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-lg font-semibold text-[#0078b6] mb-2">
                  Follow us on social media for the winners announcement!
                </p>
                <p className="text-gray-600">Don't miss out on the exciting reveal and other ARES 2025 updates.</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12 animate-in slide-in-from-bottom duration-1000 delay-1000">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Keep an eye on your email and our official channels for the winners announcement. Thank you for being part
              of the ARES 2025 journey!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CountdownContest
