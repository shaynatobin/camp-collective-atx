import { useState, useMemo } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import CampCard from '../components/CampCard'
import { getAllCamps } from '../lib/airtable'
import { FEATURED_CATEGORIES } from '../lib/utils'

export default function Home({ camps }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = useMemo(() => {
    const cats = [...new Set(camps.map((c) => c.category).filter(Boolean))].sort()
    return cats
  }, [camps])

  const featured = useMemo(() => {
    const withPhoto = camps.filter((c) => c.photo)
    return (withPhoto.length >= 6 ? withPhoto : camps).slice(0, 6)
  }, [camps])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category) params.set('category', category)
    window.location.href = `/camps${params.toString() ? `?${params}` : ''}`
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-brand-cream py-16 sm:py-24 border-b border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-ink mb-4 leading-tight">
            Find Your Perfect<br />
            <span className="text-brand-coral">Austin Summer Camp</span>
          </h1>
          <p className="text-lg sm:text-xl text-brand-ink-soft mb-10 max-w-2xl mx-auto">
            {camps.length}+ camps across sports, arts, STEM, nature, and more — all in Greater Austin.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search camps by name..."
              className="flex-grow px-4 py-3 rounded-xl border border-brand-border text-brand-ink placeholder-brand-ink-soft focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-brand-border text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-brand-coral text-white font-semibold rounded-xl hover:bg-brand-coral-dark transition-colors whitespace-nowrap"
            >
              Search Camps
            </button>
          </form>
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink mb-8 text-center">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow border border-brand-border group"
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <div className="text-sm font-medium text-brand-ink group-hover:text-brand-coral transition-colors">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-forest bg-opacity-10 border-y border-brand-forest border-opacity-20 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-display text-3xl font-bold text-brand-coral">{camps.length}+</div>
            <div className="text-sm text-brand-ink-soft mt-1">Camps Listed</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-brand-coral">10+</div>
            <div className="text-sm text-brand-ink-soft mt-1">Categories</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-brand-coral">ATX</div>
            <div className="text-sm text-brand-ink-soft mt-1">Greater Austin</div>
          </div>
        </div>
      </section>

      {/* Featured camps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink">
            Austin Favorites
          </h2>
          <Link href="/camps" className="text-sm font-medium text-brand-coral hover:underline">
            View all camps →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((camp) => (
            <CampCard key={camp.id} camp={camp} />
          ))}
        </div>
      </section>

      {/* Camp operator CTA */}
      <section className="bg-brand-forest-dark text-white py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
            Run a camp in Austin?
          </h2>
          <p className="text-white/70 mb-8">
            Get your camp in front of thousands of Austin parents searching for the perfect summer program.
          </p>
          <Link
            href="/submit-a-camp"
            className="inline-block px-8 py-3 bg-brand-coral text-white font-semibold rounded-xl hover:bg-brand-coral-dark transition-colors"
          >
            List Your Camp Free →
          </Link>
        </div>
      </section>
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
