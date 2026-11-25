import { useState, useMemo } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import CampCard from '../components/CampCard'
import HeroScene from '../components/HeroScene'
import Icon, { CATEGORY_ICONS } from '../components/Icon'
import { getAllCamps } from '../lib/airtable'
import { FEATURED_CATEGORIES, CATEGORY_COLORS, categoryLabel } from '../lib/utils'
import { PLANNER_YEAR } from '../lib/season'
import { SITE } from '../lib/site'

export default function Home({ camps }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = useMemo(() => {
    const cats = [...new Set(camps.map((c) => c.category).filter(Boolean))]
      .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b)))
    return cats
  }, [camps])

  const categoryCounts = useMemo(() => {
    const counts = {}
    for (const c of camps) if (c.category) counts[c.category] = (counts[c.category] || 0) + 1
    return counts
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
    <Layout flushFooter>
      {/* Hero */}
      <section className="bg-brand-cream pt-14 sm:pt-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-ink mb-4 leading-tight">
            Find Your Perfect<br />
            <span className="text-brand-coral">{SITE.metro} Summer Camp</span>
          </h1>
          <p className="text-lg sm:text-xl text-brand-ink-soft mb-10 max-w-2xl mx-auto">
            {camps.length} camps across sports, arts, STEM, nature, and more, all in {SITE.area}. Start planning summer {PLANNER_YEAR}.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Try soccer, coding, Round Rock..."
              aria-label="Search camps"
              className="flex-grow min-w-0 px-4 py-3 rounded-xl border border-brand-border text-brand-ink placeholder-brand-ink-soft focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-brand-border text-brand-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{categoryLabel(cat)}</option>
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
        {/* Hill Country illustration along the bottom of the hero */}
        <HeroScene className="block w-full h-36 sm:h-auto sm:max-h-[300px] mt-6 sm:mt-4" />
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
              className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow border border-brand-border group flex flex-col items-center"
            >
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${CATEGORY_COLORS[cat.name] || 'bg-brand-cream text-brand-forest'}`}>
                <Icon name={CATEGORY_ICONS[cat.name] || 'dayCamp'} className="w-6 h-6" />
              </span>
              <span className="text-sm font-medium text-brand-ink group-hover:text-brand-coral transition-colors">
                {categoryLabel(cat.name)}
              </span>
              {categoryCounts[cat.name] > 0 && (
                <span className="text-xs text-brand-ink-soft mt-0.5">
                  {categoryCounts[cat.name]} camp{categoryCounts[cat.name] !== 1 ? 's' : ''}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured camps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink">
            {SITE.metro} Favorites
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
            Run a camp in {SITE.metro}?
          </h2>
          <p className="text-white/70 mb-8">
            Get your camp in front of {SITE.metro} parents planning their summer. Listing is free.
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
