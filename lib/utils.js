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
  'STEM': 'STEM',
  'Nature & Outdoor': 'Nature & Outdoor',
  'Nature / Farm': 'Nature & Farm',
  'Sports & Athletics': 'Sports',
  'Multi-Activity / Sports': 'Multi-Sport',
  'Basketball': 'Basketball',
  'Baseball': 'Baseball',
  'Football': 'Football',
  'Soccer': 'Soccer',
  'Tennis': 'Tennis',
  'Volleyball': 'Volleyball',
  'Golf': 'Golf',
  'Lacrosse': 'Lacrosse',
  'Swimming / Aquatics': 'Aquatics',
  'Gymnastics': 'Gymnastics',
  'Dance': 'Dance',
  'General Day Camp': 'Day Camp',
  'Municipal / Public': 'Municipal',
  'Community & Religious': 'Community',
  'Faith-based / Christian': 'Faith-Based',
  'Jewish / Cultural': 'Jewish / Cultural',
  'Special Needs / Inclusive': 'Inclusive',
  'Language Immersion (Spanish)': 'Spanish Immersion',
  'Language Immersion (Mandarin)': 'Mandarin Immersion',
  'Performing Arts': 'Performing Arts',
  'Theater / Improv': 'Theater',
  'Music': 'Music',
  'Film / Media': 'Film & Media',
  'Culinary & Cooking': 'Culinary',
  'Equestrian': 'Equestrian',
  'Rock Climbing': 'Rock Climbing',
  'Montessori & Educational': 'Montessori',
  'Writing / Literature': 'Writing',
  'Circus / Aerial Arts': 'Circus Arts',
  'Yoga / Mindfulness': 'Yoga',
  'Archery': 'Archery',
  'Fencing': 'Fencing',
}

// Category color mapping (Tailwind classes)
export const CATEGORY_COLORS = {
  'Art & Creativity': 'bg-purple-100 text-purple-800',
  'STEM & Coding': 'bg-blue-100 text-blue-800',
  'STEM': 'bg-blue-100 text-blue-800',
  'Nature & Outdoor': 'bg-green-100 text-green-800',
  'Nature / Farm': 'bg-green-100 text-green-800',
  'Sports & Athletics': 'bg-orange-100 text-orange-800',
  'Multi-Activity / Sports': 'bg-orange-100 text-orange-800',
  'Basketball': 'bg-orange-100 text-orange-800',
  'Baseball': 'bg-orange-100 text-orange-800',
  'Football': 'bg-orange-100 text-orange-800',
  'Soccer': 'bg-orange-100 text-orange-800',
  'Tennis': 'bg-orange-100 text-orange-800',
  'Volleyball': 'bg-orange-100 text-orange-800',
  'Golf': 'bg-green-100 text-green-800',
  'Lacrosse': 'bg-orange-100 text-orange-800',
  'Swimming / Aquatics': 'bg-sky-100 text-sky-800',
  'Gymnastics': 'bg-pink-100 text-pink-800',
  'Dance': 'bg-pink-100 text-pink-800',
  'General Day Camp': 'bg-yellow-100 text-yellow-800',
  'Municipal / Public': 'bg-gray-100 text-gray-800',
  'Community & Religious': 'bg-indigo-100 text-indigo-800',
  'Faith-based / Christian': 'bg-indigo-100 text-indigo-800',
  'Jewish / Cultural': 'bg-indigo-100 text-indigo-800',
  'Special Needs / Inclusive': 'bg-pink-100 text-pink-800',
  'Language Immersion (Spanish)': 'bg-teal-100 text-teal-800',
  'Language Immersion (Mandarin)': 'bg-teal-100 text-teal-800',
  'Performing Arts': 'bg-purple-100 text-purple-800',
  'Theater / Improv': 'bg-purple-100 text-purple-800',
  'Music': 'bg-purple-100 text-purple-800',
  'Film / Media': 'bg-purple-100 text-purple-800',
  'Culinary & Cooking': 'bg-amber-100 text-amber-800',
  'Equestrian': 'bg-amber-100 text-amber-800',
  'Rock Climbing': 'bg-stone-100 text-stone-800',
  'Montessori & Educational': 'bg-blue-100 text-blue-800',
  'Writing / Literature': 'bg-purple-100 text-purple-800',
  'Circus / Aerial Arts': 'bg-rose-100 text-rose-800',
  'Yoga / Mindfulness': 'bg-green-100 text-green-800',
  'Archery': 'bg-stone-100 text-stone-800',
  'Fencing': 'bg-stone-100 text-stone-800',
}

// Main featured categories for homepage grid
export const FEATURED_CATEGORIES = [
  { name: 'Sports & Athletics', emoji: '⚽', slug: 'sports-athletics' },
  { name: 'Art & Creativity', emoji: '🎨', slug: 'art-creativity' },
  { name: 'STEM & Coding', emoji: '💻', slug: 'stem-coding' },
  { name: 'Nature & Outdoor', emoji: '🏕️', slug: 'nature-outdoor' },
  { name: 'General Day Camp', emoji: '☀️', slug: 'general-day-camp' },
  { name: 'Language Immersion', emoji: '🌍', slug: 'language-immersion-spanish' },
  { name: 'Special Needs / Inclusive', emoji: '🌟', slug: 'special-needs-inclusive' },
  { name: 'Faith-Based', emoji: '✨', slug: 'faith-based-christian' },
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
  'STEM': 'from-blue-400 to-blue-600',
  'Nature & Outdoor': 'from-green-400 to-green-600',
  'Nature / Farm': 'from-green-400 to-green-600',
  'Sports & Athletics': 'from-orange-400 to-orange-600',
  'Multi-Activity / Sports': 'from-orange-400 to-orange-600',
  'Basketball': 'from-orange-400 to-red-500',
  'Baseball': 'from-red-400 to-red-600',
  'Football': 'from-yellow-500 to-orange-600',
  'Soccer': 'from-green-500 to-emerald-600',
  'Tennis': 'from-yellow-400 to-yellow-600',
  'Volleyball': 'from-orange-300 to-orange-500',
  'Golf': 'from-green-400 to-teal-500',
  'Lacrosse': 'from-orange-400 to-red-500',
  'Swimming / Aquatics': 'from-sky-400 to-blue-500',
  'Gymnastics': 'from-pink-400 to-rose-500',
  'Dance': 'from-pink-400 to-fuchsia-500',
  'General Day Camp': 'from-yellow-400 to-amber-500',
  'Municipal / Public': 'from-gray-400 to-gray-600',
  'Community & Religious': 'from-indigo-400 to-indigo-600',
  'Faith-based / Christian': 'from-indigo-400 to-indigo-600',
  'Jewish / Cultural': 'from-blue-400 to-indigo-500',
  'Special Needs / Inclusive': 'from-pink-400 to-rose-500',
  'Language Immersion (Spanish)': 'from-teal-400 to-cyan-500',
  'Language Immersion (Mandarin)': 'from-teal-400 to-cyan-500',
  'Performing Arts': 'from-purple-400 to-fuchsia-500',
  'Theater / Improv': 'from-purple-400 to-purple-600',
  'Music': 'from-violet-400 to-purple-600',
  'Film / Media': 'from-slate-400 to-slate-600',
  'Culinary & Cooking': 'from-amber-400 to-orange-500',
  'Equestrian': 'from-amber-500 to-yellow-600',
  'Rock Climbing': 'from-stone-400 to-stone-600',
  'Montessori & Educational': 'from-blue-400 to-cyan-500',
  'Writing / Literature': 'from-violet-400 to-purple-500',
  'Circus / Aerial Arts': 'from-rose-400 to-pink-600',
  'Yoga / Mindfulness': 'from-emerald-400 to-teal-500',
  'Archery': 'from-stone-400 to-stone-600',
  'Fencing': 'from-slate-400 to-gray-600',
}

export function getCategoryGradient(category) {
  return CATEGORY_GRADIENTS[category] || 'from-brand-forest to-brand-forest-dark'
}
