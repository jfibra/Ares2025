import { createClient } from "@supabase/supabase-js"

/**
 * Supabase client that uses the secret key, so it bypasses row level security.
 * Server only: never import this from a "use client" file.
 */
export function createSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!url || !secretKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set")
  }
  return createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
}
