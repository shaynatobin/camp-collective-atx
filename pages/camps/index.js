import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import CampCard from '../../components/CampCard'
import { getAllCamps } from '../../lib/airtable'
import { categoryLabel, campAgeRange, campWeeklyPrice, latestHour } from '../../lib/utils'
import { SUMMER_WEEKS, PLANNER_YEAR, campRunsDuringWeek } from '../../lib/season'

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

// Full workday: Day Length says Full day, or pickup is 4pm or later.
function isFullDay(camp) {
  if (camp.dayLength?.includes('Full day')) return true
  const t = (camp.hours || '').toLowerCase()
  if (t.includes('full') && t.includes('day')) return true
  const latest = latestHour(camp.latestPickup) ?? latestHour(camp.hours)
  return latest != null && latest >= 16
}

// Aftercare: the Aftercare Available box, a pickup of 5pm or later, or the
// listing's hours/extended-care text says so.
function hasAftercare(camp) {
  if (camp.aftercare) return true
  const latest = latestHour(camp.latestPickup) ?? latestHour(camp.hours)
  if (latest != null && latest >= 17) return true
  const t = `${camp.hours || ''} ${camp.extendedCare || ''}`.toLowerCase()
  if (camp.extendedCare && !/^\s*(no|none|n\/a|not offered)/i.test(camp.extendedCare)) return true
  return /aftercare|after care|extended care|extended day|wrap.?around/.test(t)
}

function hasFinancialAid(camp) {
  if (camp.financialAid) return true
  const text = ((camp.description || '') + ' ' + (camp.specialFeatures || '') + ' ' + (camp.priceRange || '') + ' ' + (camp.priceNotes || '')).toLowerCase()
  return /scholarship|campership|financial aid|need.based|sliding scale|subsid|reduced.fee|assistance available/.test(text)
}

function hasMealsIncluded(camp) {
  if (camp.mealsIncluded) return true
  const text = ((camp.description || '') + ' ' + (camp.specialFeatures || '') + ' ' + (camp.hours || '')).toLowerCase()
  return /meals?\s+(included|provided|served)|lunch\s+(included|provided)|breakfast\s+(included|provided)|snacks?\s+provided|food\s+provided/.test(text)
}

function hasTransportation(camp) {
  if (camp.transportation) return true
  const text = ((camp.description || '') + ' ' + (camp.specialFeatures || '')).toLowerCase()
  return /\bbus\b(?:\s+service|\s+pickup|\s+transport)?|shuttle|transportation\s+(provided|available)|bus\s+pickup/.test(text)
}

const PRICE_CAPS = [200, 300, 400, 500, 750]

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
  const [region, setRegion] = useState('')
  const [campType, setCampType] = useState('')
  const [week, setWeek] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [fullDayOnly, setFullDayOnly] = useState(false)
  const [aftercareOnly, setAftercareOnly] = useState(false)
  const [financialAidOnly, setFinancialAidOnly] = useState(false)
  const [mealsOnly, setMealsOnly] = useState(false)
  const [transportOnly, setTransportOnly] = useState(false)
  const [age1, setAge1] = useState('')
  const [age2, setAge2] = useState('')
  const [sort, setSort] = useState('az')
  const [sportFilter, setSportFilter] = useState('All')
  const [urlLoaded, setUrlLoaded] = useState(false)

  // Filters live in the address (?q=soccer&age1=8...), so the back button,
  // a refresh or a shared link brings back the same results.
  useEffect(() => {
    if (!router.isReady) return
    const q = router.query
    const str = (k) => (typeof q[k] === 'string' ? q[k] : '')
    const on = (k) => q[k] === '1'
    setSearch(str('q'))
    setCategory(str('category'))
    setRegion(str('region'))
    setCity(str('city'))
    setCampType(str('type'))
    setWeek(str('week'))
    setMaxPrice(str('price'))
    setAge1(str('age1'))
    setAge2(str('age2'))
    setSort(str('sort') || 'az')
    setSportFilter(str('sport') || 'All')
    setFullDayOnly(on('fullday'))
    setAftercareOnly(on('aftercare'))
    setFinancialAidOnly(on('aid'))
    setMealsOnly(on('meals'))
    setTransportOnly(on('bus'))
    setUrlLoaded(true)
  }, [router.isReady]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!urlLoaded) return
    const params = {
      q: search.trim(), category, region, city, type: campType, week, price: maxPrice,
      age1, age2, sort: sort !== 'az' ? sort : '', sport: sportFilter !== 'All' ? sportFilter : '',
      fullday: fullDayOnly ? '1' : '', aftercare: aftercareOnly ? '1' : '', aid: financialAidOnly ? '1' : '',
      meals: mealsOnly ? '1' : '', bus: transportOnly ? '1' : '',
      shortlist: typeof router.query.shortlist === 'string' ? router.query.shortlist : '',
    }
    const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''))
    const t = setTimeout(() => {
      router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false })
    }, 300)
    return () => clearTimeout(t)
  }, [urlLoaded, search, category, region, city, campType, week, maxPrice, age1, age2, sort, sportFilter, fullDayOnly, aftercareOnly, financialAidOnly, mealsOnly, transportOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const regions = useMemo(() => {
    return [...new Set(camps.map((c) => c.region).filter(Boolean))].sort()
  }, [camps])

  // Only offer the week filter once some listings have real dates.
  const campsWithDates = useMemo(() => camps.filter((c) => c.firstSessionStart).length, [camps])

  const categories = useMemo(() => {
    return [...new Set(camps.map((c) => c.category).filter(Boolean))]
      .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b)))
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

    const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const cap = maxPrice ? parseInt(maxPrice, 10) : null
    const weekObj = week !== '' ? SUMMER_WEEKS[parseInt(week, 10)] : null

    return camps.filter((camp) => {
      if (sharedSlugs && !sharedSlugs.has(camp.slug)) return false
      if (words.length) {
        // Search the name, place, category, description and highlights; every word must match.
        const text = [
          camp.name, camp.city, camp.region, categoryLabel(camp.category), camp.campType,
          camp.description, camp.specialFeatures,
          camp.category === 'Sports & Athletics' ? detectSport(camp) : '',
        ].join(' ').toLowerCase()
        if (!words.every((w) => text.includes(w))) return false
      }
      if (region && camp.region !== region) return false
      if (weekObj && campRunsDuringWeek(camp, weekObj) !== true) return false
      if (cap !== null) {
        const p = campWeeklyPrice(camp)
        if (p === null || p > cap) return false
      }
      if (category && camp.category !== category) return false
      if (category === 'Sports & Athletics' && sportFilter !== 'All' && detectSport(camp) !== sportFilter) return false
      if (city && camp.city !== city) return false
      if (campType && camp.campType !== campType) return false
      if (fullDayOnly && !isFullDay(camp)) return false
      if (aftercareOnly && !hasAftercare(camp)) return false
      if (financialAidOnly && !hasFinancialAid(camp)) return false
      if (mealsOnly && !hasMealsIncluded(camp)) return false
      if (transportOnly && !hasTransportation(camp)) return false
      if (a1 !== null || a2 !== null) {
        const range = campAgeRange(camp)
        if (!range) return false
        if (a1 !== null && (a1 < range.min || a1 > range.max)) return false
        if (a2 !== null && (a2 < range.min || a2 > range.max)) return false
      }
      return true
    }).sort((a, b) => {
      if (sort === 'az') return a.name.localeCompare(b.name)
      if (sort === 'za') return b.name.localeCompare(a.name)
      if (sort === 'price-asc') {
        const pa = campWeeklyPrice(a) ?? Infinity
        const pb = campWeeklyPrice(b) ?? Infinity
        return pa - pb || a.name.localeCompare(b.name)
      }
      if (sort === 'price-desc') {
        const pa = campWeeklyPrice(a) ?? -1
        const pb = campWeeklyPrice(b) ?? -1
        return pb - pa || a.name.localeCompare(b.name)
      }
      if (sort === 'rating') {
        return (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount - a.reviewCount) || a.name.localeCompare(b.name)
      }
      return 0
    })
  }, [camps, sharedSlugs, search, region, week, maxPrice, category, sportFilter, city, campType, fullDayOnly, aftercareOnly, financialAidOnly, mealsOnly, transportOnly, age1, age2, sort])

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
    setRegion('')
    setWeek('')
    setMaxPrice('')
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

  const hasFilters = search || category || city || region || week !== '' || maxPrice || campType || fullDayOnly || aftercareOnly || financialAidOnly || mealsOnly || transportOnly || age1 || age2 || sort !== 'az'

  return (
    <Layout
      title="Browse Austin Summer Camps | Camp Collective ATX"
      description={`Browse ${camps.length} summer camps in Austin, TX and the greater area. Filter by age, area, price, aftercare and more for summer ${PLANNER_YEAR}.`}
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
              : `${camps.length} camps across Greater Austin for summer ${PLANNER_YEAR}: sports, arts, STEM, nature, and more.`}
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
              placeholder="Search camps, activities or towns..."
              aria-label="Search camps"
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-brand-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-coral"
            />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setSportFilter('All') }}
              aria-label="Category"
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{categoryLabel(cat)}</option>
              ))}
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              aria-label="Area"
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">All Areas</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="City"
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Row 2: ages, week, price, type */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-brand-ink-soft whitespace-nowrap">Child ages:</span>
              <input
                type="number"
                min="3" max="18"
                value={age1}
                onChange={(e) => setAge1(e.target.value)}
                placeholder="e.g. 7"
                aria-label="First child's age"
                className="w-20 px-3 py-2 rounded-lg border border-gray-300 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
              <span className="text-sm text-brand-ink-soft">&</span>
              <input
                type="number"
                min="3" max="18"
                value={age2}
                onChange={(e) => setAge2(e.target.value)}
                placeholder="e.g. 11"
                aria-label="Second child's age (optional)"
                className="w-20 px-3 py-2 rounded-lg border border-gray-300 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
            </div>
            {campsWithDates > 0 && (
              <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                aria-label="Week of summer"
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
              >
                <option value="">Any week</option>
                {SUMMER_WEEKS.map((w) => (
                  <option key={w.idx} value={w.idx}>Week of {w.label}</option>
                ))}
              </select>
            )}
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Maximum price per week"
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">Any price</option>
              {PRICE_CAPS.map((p) => (
                <option key={p} value={p}>Up to ${p}/week</option>
              ))}
            </select>
            <select
              value={campType}
              onChange={(e) => setCampType(e.target.value)}
              aria-label="Camp type"
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">All Types</option>
              {campTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {(age1 || age2 || maxPrice || week !== '') && (
            <p className="text-xs text-brand-ink-soft">
              Camps that haven't listed {[(age1 || age2) && 'ages', maxPrice && 'a weekly price', week !== '' && 'dates'].filter(Boolean).join(' or ')} are hidden while this filter is on.
            </p>
          )}

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
                aria-pressed={state}
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
              aria-label="Sort camps"
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
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
