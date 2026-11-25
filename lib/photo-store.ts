import { randomUUID } from "crypto"
import { MAX_PHOTO_BYTES, PHOTO_BUCKET, PHOTO_TYPES } from "@/lib/photo"
import { createSupabaseAdmin } from "@/lib/supabase-server"

// Server only. Checks and stores the formal photos sent with a registration.

/** The photos in a submitted form: every non-empty file sent as "photo". */
export const photosIn = (form: FormData) =>
  form.getAll("photo").filter((entry): entry is File => entry instanceof File && entry.size > 0)

/** Null when there is one good photo per person joining, else what to tell them. */
export function photosProblem(photos: File[], attendeeCount: number): string | null {
  if (photos.length !== attendeeCount) {
    return attendeeCount === 2 ? "Please upload a clear, formal photo of each of you." : "Please upload a clear, formal photo of yourself."
  }
  if (photos.some((photo) => !PHOTO_TYPES[photo.type])) return "Your photo must be a JPG, PNG or WEBP image."
  if (photos.some((photo) => photo.size > MAX_PHOTO_BYTES)) return "Your photo is larger than 3 MB."
  return null
}

export async function removePhotos(paths: string[]) {
  if (paths.length) await createSupabaseAdmin().storage.from(PHOTO_BUCKET).remove(paths)
}

/** Stores the photos and returns their paths, in order. If one fails, none are kept. */
export async function storePhotos(photos: File[]): Promise<string[]> {
  const supabase = createSupabaseAdmin()
  const folder = randomUUID()
  const paths: string[] = []
  for (const [index, photo] of photos.entries()) {
    const path = `${folder}/${index + 1}.${PHOTO_TYPES[photo.type]}`
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type, upsert: false })
    if (error) {
      await removePhotos(paths)
      throw error
    }
    paths.push(path)
  }
  return paths
}
