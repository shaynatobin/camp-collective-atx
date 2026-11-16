// Generate URL-safe slug from text
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Category to display label mapping
export const CATEGORY_LABELS = {
  'Art & Creativity': 'Art & Creativity',
  'STEM & Coding': 'STEM & Coding',
  'Nature & Outdoor': 'Nature & Outdoor',
  'Sports & Athletics': 'Sports & Athletics',
  'General Day Camp': 'Day Camp',
  'Community & Religious': 'Community & Religious',
  'Special Needs / Inclusive': 'Inclusive',
  'Language Immersion (Spanish)': 'Language Immersion',
  'Performing Arts': 'Performing Arts',
  'Music': 'Music',
  'Film / Media': 'Film & Media',
  'Culinary & Cooking': 'Culinary',
  'Equestrian': 'Equestrian',
  'Montessori & Educational': 'Academic & Enrichment',
}

// Category color mapping (Tailwind classes)
export const CATEGORY_COLORS = {
  'Art & Creativity': 'bg-purple-100 text-purple-800',
  'STEM & Coding': 'bg-blue-100 text-blue-800',
  'Nature & Outdoor': 'bg-green-100 text-green-800',
  'Sports & Athletics': 'bg-orange-100 text-orange-800',
  'General Day Camp': 'bg-yellow-100 text-yellow-800',
  'Community & Religious': 'bg-indigo-100 text-indigo-800',
  'Special Needs / Inclusive': 'bg-pink-100 text-pink-800',
  'Language Immersion (Spanish)': 'bg-teal-100 text-teal-800',
  'Performing Arts': 'bg-fuchsia-100 text-fuchsia-800',
  'Music': 'bg-violet-100 text-violet-800',
  'Film / Media': 'bg-slate-100 text-slate-800',
  'Culinary & Cooking': 'bg-amber-100 text-amber-800',
  'Equestrian': 'bg-amber-100 text-amber-800',
  'Montessori & Educational': 'bg-sky-100 text-sky-800',
}

// Main featured categories for homepage grid
export const FEATURED_CATEGORIES = [
  { name: 'Sports & Athletics', emoji: '⚽', slug: 'sports-athletics' },
  { name: 'Art & Creativity', emoji: '🎨', slug: 'art-creativity' },
  { name: 'STEM & Coding', emoji: '💻', slug: 'stem-coding' },
  { name: 'Nature & Outdoor', emoji: '🏕️', slug: 'nature-outdoor' },
  { name: 'General Day Camp', emoji: '☀️', slug: 'general-day-camp' },
  { name: 'Performing Arts', emoji: '🎭', slug: 'performing-arts' },
  { name: 'Music', emoji: '🎵', slug: 'music' },
  { name: 'Special Needs / Inclusive', emoji: '🌟', slug: 'special-needs-inclusive' },
]

// Truncate text to a max length, breaking at word boundary
export function truncate(text, maxLength = 160) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, text.lastIndexOf(' ', maxLength)) + '...'
}

// Format city name for display (capitalize each word)
export function formatCity(city) {
  if (!city) return ''
  return city
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get initials from a camp name for placeholder avatars
export function getInitials(name) {
  if (!name) return '??'
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Category to gradient colors for placeholder cards
export const CATEGORY_GRADIENTS = {
  'Art & Creativity': 'from-purple-400 to-purple-600',
  'STEM & Coding': 'from-blue-400 to-blue-600',
  'Nature & Outdoor': 'from-green-400 to-green-600',
  'Sports & Athletics': 'from-orange-400 to-orange-600',
  'General Day Camp': 'from-yellow-400 to-amber-500',
  'Community & Religious': 'from-indigo-400 to-indigo-600',
  'Special Needs / Inclusive': 'from-pink-400 to-rose-500',
  'Language Immersion (Spanish)': 'from-teal-400 to-cyan-500',
  'Performing Arts': 'from-purple-400 to-fuchsia-500',
  'Music': 'from-violet-400 to-purple-600',
  'Film / Media': 'from-slate-400 to-slate-600',
  'Culinary & Cooking': 'from-amber-400 to-orange-500',
  'Equestrian': 'from-amber-500 to-yellow-600',
  'Montessori & Educational': 'from-sky-400 to-blue-500',
}

export function getCategoryGradient(category) {
  return CATEGORY_GRADIENTS[category] || 'from-brand-forest to-brand-forest-dark'
}

// One display name per category, used everywhere (home, browse, badges, breadcrumbs).
export function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category || ''
}

// Fallback for listings without Min/Max Age: parse "Ages 6–18", "Ages 5+".
function parseAgeText(text) {
  if (!text) return null
  const t = text.toLowerCase()
  if (t.includes('all ages')) return null // usually wrong; treat as unknown
  const range = t.match(/(\d+)\s*[–\-]\s*(\d+)/)
  if (range) return { min: parseInt(range[1], 10), max: parseInt(range[2], 10) }
  const plus = t.match(/(\d+)\s*\+/)
  if (plus) return { min: parseInt(plus[1], 10), max: 18 }
  return null
}

// { min, max } from the structured fields, falling back to the Age Range text.
export function campAgeRange(camp) {
  if (camp.minAge != null || camp.maxAge != null) {
    return { min: camp.minAge ?? 3, max: camp.maxAge ?? 18 }
  }
  return parseAgeText(camp.ageRange)
}

export function formatAges(camp) {
  const r = campAgeRange(camp)
  if (!r) return ''
  if (r.max >= 18 && r.min > 3) return `Ages ${r.min}+`
  return r.min === r.max ? `Age ${r.min}` : `Ages ${r.min}–${r.max}`
}

// Lowest weekly price we know, for filtering and sorting. null = unknown.
export function campWeeklyPrice(camp) {
  if (camp.weeklyPriceMin != null) return camp.weeklyPriceMin
  if (camp.weeklyRate != null) return camp.weeklyRate
  return null
}

export function formatWeeklyPrice(camp) {
  const lo = camp.weeklyPriceMin
  const hi = camp.weeklyPriceMax
  if (lo == null && hi == null) return ''
  const fmt = (n) => `$${Math.round(n).toLocaleString('en-US')}`
  if (lo != null && hi != null && hi !== lo) return `${fmt(lo)}–${fmt(hi)}/week`
  return `${fmt(lo ?? hi)}/week`
}

// Latest time of day in a text like "9am–3pm" or "6:00 PM", as hours (17.5 = 5:30 PM).
export function latestHour(text) {
  if (!text) return null
  const times = [...text.toLowerCase().matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/g)]
  if (!times.length) return null
  let latest = 0
  for (const m of times) {
    let h = parseInt(m[1], 10)
    const pm = m[3].startsWith('p')
    if (pm && h !== 12) h += 12
    if (!pm && h === 12) h = 0
    latest = Math.max(latest, h + (m[2] ? parseInt(m[2], 10) / 60 : 0))
  }
  return latest
}
