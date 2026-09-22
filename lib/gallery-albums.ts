import { generatedAlbums } from "./gallery-photos.generated"

export type AlbumPhoto = {
  /** Small WebP used in the gallery grid */
  thumb: string
  /** Larger WebP used in the lightbox */
  full: string
}

export type GalleryAlbum = {
  /** Stable identifier used in URLs and filter state */
  slug: string
  /** Display name shown on the album filter and photo cards */
  title: string
  /** Short label used where space is tight (filter chips, badges) */
  shortTitle: string
  year: number
  /** Free-form tags for future filtering/search */
  tags: string[]
  location?: string
  /** Human readable event date, e.g. "July 1, 2025" */
  date?: string
  description?: string
  coverImage: string
  photos: AlbumPhoto[]
  /** Lower sorts first in the gallery */
  order: number
}

/**
 * Builds a list of sequentially numbered image URLs, e.g.
 * `.../Ares+Event+(1).JPG` … `.../Ares+Event+(218).JPG`
 */
export const buildSequentialPhotos = ({
  baseUrl,
  count,
  extension = "JPG",
  start = 1,
}: {
  baseUrl: string
  count: number
  extension?: string
  start?: number
}): AlbumPhoto[] =>
  Array.from({ length: count }, (_, i) => {
    const url = `${baseUrl}(${start + i}).${extension}`
    return { thumb: url, full: url }
  })

/* -------------------------------------------------------------------------- */
/* Remote albums (hosted on S3)                                               */
/* -------------------------------------------------------------------------- */

const ares2023Photos = buildSequentialPhotos({
  baseUrl: "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/ares/Event+Photos/Ares+Event+",
  count: 218,
})

const remoteAlbums: GalleryAlbum[] = [
  {
    slug: "ares-2023",
    title: "ARES 2023",
    shortTitle: "ARES 2023",
    year: 2023,
    tags: ["ares", "2023", "summit"],
    location: "Bangkok, Thailand",
    description: "Highlights and candid moments from the Asian Real Estate Summit 2023.",
    coverImage: ares2023Photos[0].thumb,
    photos: ares2023Photos,
    order: 90,
  },
]

/* -------------------------------------------------------------------------- */
/* Local albums (built from public/albums by scripts/build-gallery-derivatives) */
/* -------------------------------------------------------------------------- */

type AlbumMeta = {
  /** Overrides the folder-derived title, for albums the folder name under-labels */
  title?: string
  shortTitle?: string
  year: number
  tags: string[]
  location?: string
  date?: string
  description?: string
  order: number
}

/**
 * Curated metadata for the generated albums, keyed by slug. Titles default to
 * the source folder name; everything here is what a folder name can't express,
 * including a `title` override where the folder under-labels the album.
 * An album without an entry still shows up, using the fallback below.
 */
const localAlbumMeta: Record<string, AlbumMeta> = {
  "ares-2025-day-1": {
    year: 2025,
    tags: ["ares", "2025", "summit", "day-1"],
    location: "Bangkok, Thailand",
    date: "July 1, 2025",
    description: "Day one of the Asian Real Estate Summit 2025.",
    order: 10,
  },
  "day1-dinner-cruise": {
    title: "ARES 2025 DAY 1 - Dinner Cruise",
    year: 2025,
    tags: ["ares", "2025", "dinner-cruise", "day-1"],
    location: "Bangkok, Thailand",
    date: "July 1, 2025",
    description: "The day one delegates' dinner cruise.",
    order: 11,
  },
  "ares-2025-day-2": {
    year: 2025,
    tags: ["ares", "2025", "summit", "day-2"],
    location: "Bangkok, Thailand",
    date: "July 2, 2025",
    description: "Day two of the Asian Real Estate Summit 2025.",
    order: 12,
  },
  "day2-conference": {
    title: "ARES 2025 DAY 2 - Conference",
    year: 2025,
    tags: ["ares", "2025", "conference", "day-2"],
    location: "Bangkok, Thailand",
    date: "July 2, 2025",
    description: "The day two conference sessions.",
    order: 13,
  },
}

/** Used for any album dropped into public/albums without a metadata entry yet. */
const fallbackMeta = (title: string): AlbumMeta => ({
  year: Number(title.match(/(20\d{2})/)?.[1]) || new Date().getFullYear(),
  tags: [],
  order: 50,
})

const localAlbums: GalleryAlbum[] = Object.entries(generatedAlbums).map(([slug, generated]) => {
  const meta = localAlbumMeta[slug] ?? fallbackMeta(generated.title)
  const photos: AlbumPhoto[] = generated.photos.map((name) => ({
    thumb: `/gallery/${slug}/thumb/${name}.webp`,
    full: `/gallery/${slug}/full/${name}.webp`,
  }))

  const title = meta.title ?? generated.title

  return {
    slug,
    title,
    shortTitle: meta.shortTitle ?? title,
    year: meta.year,
    tags: meta.tags,
    location: meta.location,
    date: meta.date,
    description: meta.description,
    coverImage: photos[0]?.thumb ?? "",
    photos,
    order: meta.order,
  }
})

export const galleryAlbums: GalleryAlbum[] = [...localAlbums, ...remoteAlbums].sort((a, b) => a.order - b.order)

export const getAlbumBySlug = (slug: string): GalleryAlbum | undefined =>
  galleryAlbums.find((album) => album.slug === slug)

export type GalleryPhoto = AlbumPhoto & {
  album: GalleryAlbum
  /** 1-based position of the photo within its own album */
  indexInAlbum: number
}

/** Every photo across every album, in album order. */
export const allGalleryPhotos: GalleryPhoto[] = galleryAlbums.flatMap((album) =>
  album.photos.map((photo, i) => ({ ...photo, album, indexInAlbum: i + 1 })),
)

export const getPhotosForAlbum = (slug: string | "all"): GalleryPhoto[] =>
  slug === "all" ? allGalleryPhotos : allGalleryPhotos.filter((photo) => photo.album.slug === slug)

export const totalPhotoCount = allGalleryPhotos.length

export const eventYearCount = new Set(galleryAlbums.map((album) => album.year)).size
