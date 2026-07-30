import { useState, useMemo } from 'react'
import Layout from '../../components/Layout'
import CampCard from '../../components/CampCard'
import { getAllCamps } from '../../lib/airtable'
import { CATEGORY_LABELS } from '../../lib/utils'

// Parse "Ages 6–18", "Ages 5+", "All Ages", "K–12" → { min, max }
function parseAgeRange(text) {
  if (!text) return null
  const t = text.toLowerCase()
  if (t.includes('all ages')) return { min: 3, max: 18 }
  const range = t.match(/(\d+)\s*[–\-]\s*(\d+)/)
  if (range) return { min: parseInt(range[1]), max: parseInt(range[2]) }
  const plus = t.match(/(\d+)\s*\+/)
  if (plus) return { min: parseInt(plus[1]), max: 18 }
  if (t.includes('k') && (t.includes('12') || t.includes('8'))) return { min: 5, max: 18 }
  return null
}

// Extract a numeric price for sorting from text like "$400/week", "$240–$315/week"
function parsePrice(text) {
  if (!text) return null
  const m = text.match(/\$?([\d,]+)/)
  if (!m) return null
  return parseInt(m[1].replace(/,/g, ''))
}

// Detect if camp hours cover a full workday (pickup 4pm or later)
function isFullDay(hoursText) {
  if (!hoursText) return false
  const t = hoursText.toLowerCase()
  if (t.includes('full') && t.includes('day')) return true
  const times = [...t.matchAll(/(\d+)(?::(\d+))?\s*(am|pm)/g)]
  let latest = 0
  for (const m of times) {
    let h = parseInt(m[1])
    if (m[3] === 'pm' && h !== 12) h += 12
    if (m[3] === 'am' && h === 12) h = 0
    latest = Math.max(latest, h)
  }
  return latest >= 16
}

export default function CampsPage({ camps }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [campType, setCampType] = useState('')
  const [fullDayOnly, setFullDayOnly] = useState(false)
  const [age1, setAge1] = useState('')
  const [age2, setAge2] = useState('')
  const [sort, setSort] = useState('az')

  const categories = useMemo(() => {
    return [...new Set(camps.map((c) => c.category).filter(Boolean))].sort()
  }, [camps])

  const cities = useMemo(() => {
    return [...new Set(camps.map((c) => c.city).filter(Boolean))].sort()
  }, [camps])

  const campTypes = useMemo(() => {
    return [...new Set(camps.map((c) => c.campType).filter(Boolean))].sort()
  }, [camps])

  const filtered = useMemo(() => {
    const a1 = age1 ? parseInt(age1) : null
    const a2 = age2 ? parseInt(age2) : null

    return camps.filter((camp) => {
      if (search && !camp.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category && camp.category !== category) return false
      if (city && camp.city !== city) return false
      if (campType && camp.campType !== campType) return false
      if (fullDayOnly && !isFullDay(camp.hours)) return false
      if (a1 !== null || a2 !== null) {
        const range = parseAgeRange(camp.ageRange)
        if (!range) return false
        if (a1 !== null && (a1 < range.min || a1 > range.max)) return false
        if (a2 !== null && (a2 < range.min || a2 > range.max)) return false
      }
      return true
    }).sort((a, b) => {
      if (sort === 'az') return a.name.localeCompare(b.name)
      if (sort === 'za') return b.name.localeCompare(a.name)
      if (sort === 'price-asc') {
        const pa = parsePrice(a.priceRange) ?? Infinity
        const pb = parsePrice(b.priceRange) ?? Infinity
        return pa - pb
      }
      if (sort === 'price-desc') {
        const pa = parsePrice(a.priceRange) ?? -1
        const pb = parsePrice(b.priceRange) ?? -1
        return pb - pa
      }
      return 0
    })
  }, [camps, search, category, city, campType, fullDayOnly, age1, age2, sort])

  function clearFilters() {
    setSearch('')
    setCategory('')
    setCity('')
    setCampType('')
    setFullDayOnly(false)
    setAge1('')
    setAge2('')
    setSort('az')
  }

  const hasFilters = search || category || city || campType || fullDayOnly || age1 || age2 || sort !== 'az'

  return (
    <Layout
      title="Browse Austin Summer Camps | Camp Collective ATX"
      description={`Browse all ${camps.length}+ summer camps in Austin, TX and the greater area. Filter by category, city, and camp type to find the perfect fit.`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink mb-2">
            Austin Summer Camps
          </h1>
          <p className="text-gray-600">
            {camps.length}+ camps across Greater Austin — sports, arts, STEM, nature, and more.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 space-y-3">
          {/* Row 1: search + dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-brand-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-coral"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={campType}
              onChange={(e) => setCampType(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">All Types</option>
              {campTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Row 2: sibling ages + full-day */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-brand-ink-soft whitespace-nowrap">Child ages:</span>
              <input
                type="number"
                min="3" max="18"
                value={age1}
                onChange={(e) => setAge1(e.target.value)}
                placeholder="e.g. 7"
                className="w-20 px-3 py-2 rounded-lg border border-gray-300 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
              <span className="text-sm text-brand-ink-soft">&</span>
              <input
                type="number"
                min="3" max="18"
                value={age2}
                onChange={(e) => setAge2(e.target.value)}
                placeholder="e.g. 11"
                className="w-20 px-3 py-2 rounded-lg border border-gray-300 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fullDayOnly}
                onChange={(e) => setFullDayOnly(e.target.checked)}
                className="w-4 h-4 accent-brand-coral rounded"
              />
              <span className="text-sm text-brand-ink">Full day (pickup 4pm+)</span>
            </label>
          </div>
        </div>

        {/* Results count + sort + clear */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-brand-ink">{filtered.length}</span> of {camps.length} camps
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-brand-coral hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Camp grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-semibold text-brand-ink mb-2">No camps found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-brand-coral text-white rounded-lg text-sm font-medium hover:bg-opacity-90"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const camps = await getAllCamps()
  return {
    props: { camps },
    revalidate: 3600,
  }
}
