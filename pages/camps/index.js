import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
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

const SPORT_KEYWORDS = {
  'Soccer': ['soccer', 'futbol'],
  'Basketball': ['basketball', 'hoops'],
  'Football': ['football', 'flag football'],
  'Baseball / Softball': ['baseball', 'softball'],
  'Tennis': ['tennis', 'pickleball'],
  'Swimming': ['swim', 'aquatic', 'water polo'],
  'Gymnastics / Cheer': ['gymnastics', 'tumbling', 'cheer', 'cheerleading'],
  'Volleyball': ['volleyball'],
  'Golf': ['golf'],
  'Lacrosse': ['lacrosse'],
  'Martial Arts': ['martial arts', 'karate', 'taekwondo', 'jiu-jitsu', 'judo', 'boxing', 'wrestling'],
  'Rock Climbing': ['rock climbing', 'climbing', 'bouldering'],
  'Archery': ['archery'],
  'Fencing': ['fencing'],
  'Ninja / Obstacle': ['ninja', 'obstacle'],
}

function detectSport(camp) {
  const text = (camp.name + ' ' + (camp.description || '')).toLowerCase()
  for (const [sport, keywords] of Object.entries(SPORT_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return sport
  }
  return 'Multi-Sport'
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

// Detect aftercare: explicit keywords OR closes at 5pm or later
function hasAftercareHours(hoursText) {
  if (!hoursText) return false
  const t = hoursText.toLowerCase()
  if (/aftercare|extended care|extended day|wrap.?around/.test(t)) return true
  const times = [...t.matchAll(/(\d+)(?::(\d+))?\s*(am|pm)/g)]
  let latest = 0
  for (const m of times) {
    let h = parseInt(m[1])
    if (m[3] === 'pm' && h !== 12) h += 12
    if (m[3] === 'am' && h === 12) h = 0
    latest = Math.max(latest, h)
  }
  return latest >= 17
}

export default function CampsPage({ camps }) {
  const router = useRouter()
  const sharedSlugs = useMemo(() => {
    const param = router.query.shortlist
    if (!param) return null
    return new Set(param.split(',').map((s) => s.trim()).filter(Boolean))
  }, [router.query.shortlist])

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [campType, setCampType] = useState('')
  const [fullDayOnly, setFullDayOnly] = useState(false)
  const [aftercareOnly, setAftercareOnly] = useState(false)
  const [financialAidOnly, setFinancialAidOnly] = useState(false)
  const [mealsOnly, setMealsOnly] = useState(false)
  const [transportOnly, setTransportOnly] = useState(false)
  const [age1, setAge1] = useState('')
  const [age2, setAge2] = useState('')
  const [sort, setSort] = useState('az')
  const [sportFilter, setSportFilter] = useState('All')

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
      if (sharedSlugs && !sharedSlugs.has(camp.slug)) return false
      if (search && !camp.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category && camp.category !== category) return false
      if (category === 'Sports & Athletics' && sportFilter !== 'All' && detectSport(camp) !== sportFilter) return false
      if (city && camp.city !== city) return false
      if (campType && camp.campType !== campType) return false
      if (fullDayOnly && !isFullDay(camp.hours)) return false
      if (aftercareOnly && !camp.aftercareAvailable && !hasAftercareHours(camp.hours)) return false
      if (financialAidOnly && !camp.financialAid) return false
      if (mealsOnly && !camp.mealsIncluded) return false
      if (transportOnly && !camp.transportationProvided) return false
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
  }, [camps, sharedSlugs, search, category, sportFilter, city, campType, fullDayOnly, aftercareOnly, financialAidOnly, mealsOnly, transportOnly, age1, age2, sort])

  const isSports = category === 'Sports & Athletics'

  const sportCounts = useMemo(() => {
    if (!isSports) return {}
    const sportCamps = camps.filter((c) => c.category === 'Sports & Athletics')
    const counts = {}
    sportCamps.forEach((c) => {
      const s = detectSport(c)
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [camps, isSports])

  const sportTabs = useMemo(() => {
    if (!isSports) return []
    return ['All', ...Object.keys(sportCounts).sort()]
  }, [sportCounts, isSports])

  function clearFilters() {
    setSearch('')
    setCategory('')
    setSportFilter('All')
    setCity('')
    setCampType('')
    setFullDayOnly(false)
    setAftercareOnly(false)
    setFinancialAidOnly(false)
    setMealsOnly(false)
    setTransportOnly(false)
    setAge1('')
    setAge2('')
    setSort('az')
  }

  const hasFilters = search || category || city || campType || fullDayOnly || aftercareOnly || financialAidOnly || mealsOnly || transportOnly || age1 || age2 || sort !== 'az'

  return (
    <Layout
      title="Browse Austin Summer Camps | Camp Collective ATX"
      description={`Browse all ${camps.length}+ summer camps in Austin, TX and the greater area. Filter by category, city, and camp type to find the perfect fit.`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink mb-2">
            {sharedSlugs ? 'Shared Camp List' : 'Austin Summer Camps'}
          </h1>
          <p className="text-gray-600">
            {sharedSlugs
              ? `Someone shared ${sharedSlugs.size} camp${sharedSlugs.size !== 1 ? 's' : ''} with you.`
              : `${camps.length}+ camps across Greater Austin — sports, arts, STEM, nature, and more.`}
          </p>
        </div>

        {/* Shared list banner */}
        {sharedSlugs && (
          <div className="bg-brand-coral bg-opacity-10 border border-brand-coral border-opacity-30 rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-brand-ink">You're viewing a shared shortlist.</p>
            <a href="/camps" className="text-sm font-medium text-brand-coral hover:underline">Browse all camps →</a>
          </div>
        )}

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
              onChange={(e) => { setCategory(e.target.value); setSportFilter('All') }}
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

          {/* Row 2: sibling ages */}
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
          </div>

          {/* Row 3: feature filter chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Full day (4pm+)', state: fullDayOnly, set: setFullDayOnly },
              { label: 'Aftercare (5pm+)', state: aftercareOnly, set: setAftercareOnly },
              { label: 'Financial aid', state: financialAidOnly, set: setFinancialAidOnly },
              { label: 'Meals included', state: mealsOnly, set: setMealsOnly },
              { label: 'Transportation', state: transportOnly, set: setTransportOnly },
            ].map(({ label, state, set }) => (
              <button
                key={label}
                onClick={() => set(!state)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150 ${
                  state
                    ? 'bg-brand-forest text-white border-brand-forest'
                    : 'bg-white text-brand-ink-soft border-gray-300 hover:border-brand-forest hover:text-brand-forest'
                }`}
              >
                {state ? '✓ ' : ''}{label}
              </button>
            ))}
          </div>
        </div>

        {/* Sport sub-filters */}
        {isSports && sportTabs.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {sportTabs.map((sport) => (
              <button
                key={sport}
                onClick={() => setSportFilter(sport)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                  sportFilter === sport
                    ? 'bg-brand-coral text-white'
                    : 'bg-white border border-gray-300 text-brand-ink-soft hover:border-brand-coral hover:text-brand-coral'
                }`}
              >
                {sport}
                {sport !== 'All' && (
                  <span className={`ml-1.5 text-xs ${sportFilter === sport ? 'opacity-80' : 'opacity-50'}`}>
                    {sportCounts[sport]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

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
