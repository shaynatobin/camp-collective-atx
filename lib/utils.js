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
  'Arts & Creativity': 'Arts & Creativity',
  'STEM & Technology': 'STEM & Tech',
  'Nature & Outdoor': 'Nature & Outdoor',
  'Sports & Athletics': 'Sports',
  'Basketball': 'Basketball',
  'Baseball': 'Baseball',
  'Football': 'Football',
  'Soccer': 'Soccer',
  'Tennis': 'Tennis',
  'Volleyball': 'Volleyball',
  'Golf': 'Golf',
  'General Day Camp': 'Day Camp',
  'Municipal / Public': 'Municipal',
  'Faith-based / Christian': 'Faith-Based',
  'Faith-Based': 'Faith-Based',
  'Jewish / Cultural': 'Jewish / Cultural',
  'Special Needs / Inclusive': 'Inclusive',
  'Language Immersion': 'Language',
}

// Category color mapping (Tailwind classes)
export const CATEGORY_COLORS = {
  'Arts & Creativity': 'bg-purple-100 text-purple-800',
  'STEM & Technology': 'bg-blue-100 text-blue-800',
  'Nature & Outdoor': 'bg-green-100 text-green-800',
  'Sports & Athletics': 'bg-orange-100 text-orange-800',
  'Basketball': 'bg-orange-100 text-orange-800',
  'Baseball': 'bg-orange-100 text-orange-800',
  'Football': 'bg-orange-100 text-orange-800',
  'Soccer': 'bg-orange-100 text-orange-800',
  'Tennis': 'bg-orange-100 text-orange-800',
  'Volleyball': 'bg-orange-100 text-orange-800',
  'Golf': 'bg-green-100 text-green-800',
  'General Day Camp': 'bg-yellow-100 text-yellow-800',
  'Municipal / Public': 'bg-gray-100 text-gray-800',
  'Faith-based / Christian': 'bg-indigo-100 text-indigo-800',
  'Faith-Based': 'bg-indigo-100 text-indigo-800',
  'Jewish / Cultural': 'bg-indigo-100 text-indigo-800',
  'Special Needs / Inclusive': 'bg-pink-100 text-pink-800',
  'Language Immersion': 'bg-teal-100 text-teal-800',
}

// Main featured categories for homepage grid
export const FEATURED_CATEGORIES = [
  { name: 'Sports & Athletics', emoji: '⚽', slug: 'sports-athletics' },
  { name: 'Arts & Creativity', emoji: '🎨', slug: 'arts-creativity' },
  { name: 'STEM & Technology', emoji: '💻', slug: 'stem-technology' },
  { name: 'Nature & Outdoor', emoji: '🏕️', slug: 'nature-outdoor' },
  { name: 'General Day Camp', emoji: '☀️', slug: 'general-day-camp' },
  { name: 'Language Immersion', emoji: '🌍', slug: 'language-immersion' },
  { name: 'Special Needs / Inclusive', emoji: '🌟', slug: 'special-needs-inclusive' },
  { name: 'Faith-Based', emoji: '✨', slug: 'faith-based' },
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
  'Arts & Creativity': 'from-purple-400 to-purple-600',
  'STEM & Technology': 'from-blue-400 to-blue-600',
  'Nature & Outdoor': 'from-green-400 to-green-600',
  'Sports & Athletics': 'from-orange-400 to-orange-600',
  'Basketball': 'from-orange-400 to-red-500',
  'Baseball': 'from-red-400 to-red-600',
  'Football': 'from-yellow-500 to-orange-600',
  'Soccer': 'from-green-500 to-emerald-600',
  'Tennis': 'from-yellow-400 to-yellow-600',
  'Volleyball': 'from-orange-300 to-orange-500',
  'Golf': 'from-green-400 to-teal-500',
  'General Day Camp': 'from-yellow-400 to-amber-500',
  'Municipal / Public': 'from-gray-400 to-gray-600',
  'Faith-based / Christian': 'from-indigo-400 to-indigo-600',
  'Faith-Based': 'from-indigo-400 to-indigo-600',
  'Jewish / Cultural': 'from-blue-400 to-indigo-500',
  'Special Needs / Inclusive': 'from-pink-400 to-rose-500',
  'Language Immersion': 'from-teal-400 to-cyan-500',
}

export function getCategoryGradient(category) {
  return CATEGORY_GRADIENTS[category] || 'from-brand-sage to-brand-navy'
}
