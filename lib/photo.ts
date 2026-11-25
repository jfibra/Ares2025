// The formal photo each person uploads when they register, used for their ARES poster.
// Shared by the form (browser) and the API (server).

export const PHOTO_BUCKET = "agent-photos"
/** Largest file the server accepts, after the browser has shrunk the photo. */
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024
export const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }
export const PHOTO_ACCEPT = Object.keys(PHOTO_TYPES).join(",")

/** Longest side, in pixels, a photo is shrunk to before it is sent. */
const MAX_SIDE = 2000
/** A photo whose shortest side is under this is too small to print clearly. */
const MIN_SIDE = 500

export type PreparedPhoto = { ok: true; file: File } | { ok: false; message: string }

/**
 * Browser only. Checks the photo an agent picked and shrinks a large one to a JPEG, so a
 * phone photo of many megabytes still uploads quickly.
 */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (!PHOTO_TYPES[file.type]) return { ok: false, message: "Please upload your photo as a JPG, PNG or WEBP image." }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
  } catch {
    return { ok: false, message: "We could not open that photo. Please choose a different JPG or PNG image." }
  }

  try {
    const { width, height } = bitmap
    if (Math.min(width, height) < MIN_SIDE) {
      return { ok: false, message: "That photo is too small to print clearly. Please upload a larger, clearer photo." }
    }

    const scale = Math.min(1, MAX_SIDE / Math.max(width, height))
    if (scale === 1 && file.size <= MAX_PHOTO_BYTES) return { ok: true, file }

    const canvas = document.createElement("canvas")
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const context = canvas.getContext("2d")
    if (!context) return { ok: false, message: "We could not prepare that photo. Please try a different one." }
    context.fillStyle = "#ffffff" // a see-through PNG gets a white background, not black
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9))
    if (!blob || blob.size > MAX_PHOTO_BYTES) {
      return { ok: false, message: "That photo is too large. Please upload one under 3 MB." }
    }
    return { ok: true, file: new File([blob], "photo.jpg", { type: "image/jpeg" }) }
  } finally {
    bitmap.close()
  }
}
