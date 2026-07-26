import { useState, useMemo } from 'react'
import Layout from '../../components/Layout'
import CampCard from '../../components/CampCard'
import { getAllCamps } from '../../lib/airtable'

export default function CampsPage({ camps }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [campType, setCampType] = useState('')

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
    return camps.filter((camp) => {
      if (search && !camp.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category && camp.category !== category) return false
      if (city && camp.city !== city) return false
      if (campType && camp.campType !== campType) return false
      return true
    })
  }, [camps, search, category, city, campType])

  function clearFilters() {
    setSearch('')
    setCategory('')
    setCity('')
    setCampType('')
  }

  const hasFilters = search || category || city || campType

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
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
                <option key={cat} value={cat}>{cat}</option>
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
        </div>

        {/* Results count + clear */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-brand-ink">{filtered.length}</span> of {camps.length} camps
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-brand-coral hover:underline"
            >
              Clear filters
            </button>
          )}
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
