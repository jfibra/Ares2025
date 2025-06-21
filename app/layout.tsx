import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import AnalyticsWrapper from "@/components/analytics-wrapper"
import { Suspense } from "react"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ares2025.com"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ARES 2025 - Asian Real Estate Summit | Bangkok, Thailand",
    template: "%s | ARES 2025",
  },
  description:
    "🌟 Join Asia's premier real estate summit! ARES 2025 brings together industry legends, visionaries, and game-changers in Bangkok, Thailand. July 2, 2025 - Don't miss this epic event!",
  keywords: [
    "ARES 2025",
    "Asian Real Estate Summit",
    "Bangkok",
    "Thailand",
    "Real Estate Conference",
    "Property Summit",
    "Real Estate Networking",
    "Industry Leaders",
    "Property Investment",
    "Real Estate Professionals",
  ],
  authors: [{ name: "Filipino Homes", url: "https://filipinohomes.com" }],
  creator: "Filipino Homes",
  publisher: "ARES 2025",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "ARES 2025 - Asian Real Estate Summit",
    title: "ARES 2025 - Asian Real Estate Summit | Bangkok, Thailand",
    description:
      "🌟 Join Asia's premier real estate summit! Industry legends, visionaries, and game-changers in Bangkok, Thailand. July 2, 2025",
    images: [
      {
        url: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png",
        width: 1200,
        height: 630,
        alt: "ARES 2025 - Asian Real Estate Summit",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ARES 2025 - Asian Real Estate Summit",
    description: "🌟 Join Asia's premier real estate summit in Bangkok, Thailand! July 2, 2025 🚀",
    images: ["https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"],
    creator: "@filipinohomes",
    site: "@ARES2025",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual Google verification code
    yandex: "your-yandex-verification-code", // Replace with actual Yandex verification code
    yahoo: "your-yahoo-verification-code", // Replace with actual Yahoo verification code
  },
  alternates: {
    canonical: baseUrl,
  },
  other: {
    "fb:app_id": "your-facebook-app-id", // Replace with actual Facebook App ID
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <head>
        {/* Additional SEO meta tags */}
        <meta name="theme-color" content="#0078b6" />
        <meta name="msapplication-TileColor" content="#0078b6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          as="style"
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: "ARES 2025 - Asian Real Estate Summit",
              description:
                "Asia's premier real estate summit bringing together industry leaders, visionaries, and game-changers.",
              startDate: "2025-07-02T09:00:00+07:00",
              endDate: "2025-07-02T18:00:00+07:00",
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              location: {
                "@type": "Place",
                name: "Bangkok, Thailand",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Bangkok",
                  addressCountry: "Thailand",
                },
              },
              organizer: {
                "@type": "Organization",
                name: "Filipino Homes",
                url: "https://filipinohomes.com",
              },
              image: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png",
              url: baseUrl,
            }),
          }}
        />
      </head>
      <body>
        <Suspense fallback={"Loading..."}>
          {children}
          <AnalyticsWrapper />
        </Suspense>
      </body>
    </html>
  )
}
