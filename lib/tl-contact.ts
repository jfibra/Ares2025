// How an agent reaches their team leader: the leader's Facebook link and contact number.
// Safe to import in the browser (no server code here).

/** Shown to an agent next to the payment details. */
export type LeaderContact = { facebook_url: string | null; contact_number: string | null }

const FACEBOOK_HOSTS = ["facebook.com", "fb.com", "fb.me", "m.me", "messenger.com"]

/**
 * A clean https link to a Facebook profile or Messenger chat, or null when the text is not one.
 * "facebook.com/juan.delacruz" -> "https://facebook.com/juan.delacruz".
 */
export function normalizeFacebookUrl(input: string): string | null {
  const raw = input.trim()
  if (!raw || raw.length > 300 || /\s/.test(raw)) return null
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase()
  if (!FACEBOOK_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) return null
  // The link must point at someone, not just at Facebook's front page.
  if (url.pathname.replace(/\/+$/, "") === "" && !url.searchParams.get("id")) return null
  url.protocol = "https:"
  url.hash = ""
  return url.toString()
}

export const FACEBOOK_LINK_HELP =
  "Open your Facebook profile, copy the link, and paste it here. Example: https://www.facebook.com/juan.delacruz"
