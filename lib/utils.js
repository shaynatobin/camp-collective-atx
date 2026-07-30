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
