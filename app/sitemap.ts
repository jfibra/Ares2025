import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ares2025.com"

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/speakers`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ares-2025-countdown-contest`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]

  // Individual speaker pages
  const speakerSlugs = [
    "anthony-gerard-leuterio",
    "cesar-wee-jr",
    "jose-joe-soberano-iii",
    "carson-choa",
    "samantha-manigsaca",
    "may-antonette-leuterio",
    "dr-sopon-pornchokchai",
    "azela-honor",
    "george-sarmago",
    "gilbert-monecillo",
    "alejandro-manalac",
  ]

  const speakerPages = speakerSlugs.map((slug) => ({
    url: `${baseUrl}/speakers?speaker=${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...speakerPages]
}
