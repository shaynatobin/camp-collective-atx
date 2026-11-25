import { track } from '@vercel/analytics'

// Adds a tag to links that leave the site, so camps can see the visits we send them
// in their own website stats. Leaves the address alone if it can't be read.
export function outboundUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    if (!u.searchParams.has('utm_source')) {
      u.searchParams.set('utm_source', 'campcollectiveatx')
      u.searchParams.set('utm_medium', 'directory')
    }
    return u.toString()
  } catch {
    return url
  }
}

// Counts a click through to a camp's own website (shows as a custom event in
// Vercel Web Analytics on plans that include custom events).
export function trackCampVisit(camp, from) {
  try {
    track('Visit camp site', { camp: camp.slug || camp.name, from })
  } catch {
    // never block the click
  }
}
