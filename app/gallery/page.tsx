import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import GalleryPage from "@/components/gallery-page"
import { galleryAlbums, totalPhotoCount } from "@/lib/gallery-albums"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ares2025.com"
const pageUrl = `${baseUrl}/gallery`

// Built from the album data so the copy can't drift as albums are added.
const albumTitles = galleryAlbums.map((album) => album.title).join(", ")
const description =
  `📸 Browse ${totalPhotoCount.toLocaleString()} photos from the Asian Real Estate Summit across ` +
  `${galleryAlbums.length} albums: ${albumTitles}. Keynotes, conference sessions, the delegates' ` +
  `dinner cruise and more from ARES 2025 in Bangkok, Thailand.`
const shortDescription =
  `${totalPhotoCount.toLocaleString()} photos from ARES 2025 in Bangkok — keynotes, sessions and ` +
  `the delegates' dinner cruise. 🚀`

export const metadata: Metadata = {
  title: "ARES 2025 Gallery - Event Photos & Highlights | Asian Real Estate Summit",
  description,
  keywords: [
    "ARES 2025 Gallery",
    "ARES 2025 Photos",
    "Asian Real Estate Summit 2025",
    "ARES Bangkok 2025",
    "Bangkok",
    "Thailand",
    "Real Estate Events",
    "Conference Photos",
    "Industry Networking",
    "Property Summit",
    "Event Highlights",
  ],
  openGraph: {
    title: "📸 ARES 2025 Gallery - Event Photos & Highlights",
    description,
    url: pageUrl,
    siteName: "ARES 2025 - Asian Real Estate Summit",
    images: [
      {
        url: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png",
        width: 1200,
        height: 630,
        alt: "ARES 2025 Gallery - Event Photos & Highlights",
        type: "image/png",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "📸 ARES 2025 Gallery - Event Photos & Highlights",
    description: shortDescription,
    images: ["https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/logo/ARES+Landscape+LOGO.png"],
    creator: "@filipinohomes",
    site: "@ARES2025",
  },
  alternates: {
    canonical: pageUrl,
  },
}

export default function Gallery() {
  return (
    <>
      <Navbar />
      <GalleryPage />
      <Footer />
    </>
  )
}
