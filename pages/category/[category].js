import { useState, useMemo } from 'react'
import Layout from '../../components/Layout'
import CampCard from '../../components/CampCard'
import Link from 'next/link'
import { getAllCamps } from '../../lib/airtable'
import { slugify, CATEGORY_LABELS } from '../../lib/utils'

const SPORT_KEYWORDS = {
  'Soccer': ['soccer', 'futbol', 'fútbol'],
  'Basketball': ['basketball', 'hoops'],
  'Football': ['football', 'flag football', 'tackle'],
  'Baseball / Softball': ['baseball', 'softball', 'pitching', 'batting'],
  'Tennis': ['tennis', 'pickleball'],
  'Swimming': ['swim', 'aquatic', 'water polo', 'diving'],
  'Gymnastics / Cheer': ['gymnastics', 'tumbling', 'cheer', 'cheerleading'],
  'Volleyball': ['volleyball'],
  'Golf': ['golf'],
  'Lacrosse': ['lacrosse'],
  'Martial Arts': ['martial arts', 'karate', 'taekwondo', 'jiu-jitsu', 'judo', 'kung fu', 'krav maga', 'bjj', 'boxing', 'wrestling', 'mma'],
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

export default function CategoryPage({ camps, categoryName }) {
  const displayName = CATEGORY_LABELS[categoryName] || categoryName
  const isSports = categoryName === 'Sports & Athletics'
  const [sportFilter, setSportFilter] = useState('All')

  const sportsWithCounts = useMemo(() => {
    if (!isSports) return {}
    const counts = {}
    camps.forEach((c) => {
      const s = detectSport(c)
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [camps, isSports])

  const sportTabs = useMemo(() => {
    if (!isSports) return []
    return ['All', ...Object.keys(sportsWithCounts).sort()]
  }, [sportsWithCounts, isSports])

  const visibleCamps = useMemo(() => {
    if (!isSports || sportFilter === 'All') return camps
    return camps.filter((c) => detectSport(c) === sportFilter)
  }, [camps, isSports, sportFilter])

  return (
    <Layout
      title={`${displayName} Camps in Austin TX | Camp Collective ATX`}
      description={`Find the best ${displayName} summer camps in Austin, TX. Browse ${camps.length} camps for kids across Greater Austin.`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-coral">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/camps" className="hover:text-brand-coral">Camps</Link>
          <span className="mx-1.5">/</span>
          <span className="text-brand-ink font-medium">{displayName}</span>
        </nav>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink mb-2">
          {displayName} Camps in Austin
        </h1>
        <p className="text-gray-600 mb-6">
          {visibleCamps.length} camp{visibleCamps.length !== 1 ? 's' : ''} found in Greater Austin.
        </p>

        {/* Sport sub-filters */}
        {isSports && sportTabs.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {sportTabs.map((sport) => (
              <button
                key={sport}
                onClick={() => setSportFilter(sport)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                  sportFilter === sport
                    ? 'bg-brand-coral text-white'
                    : 'bg-white border border-brand-border text-brand-ink-soft hover:border-brand-coral hover:text-brand-coral'
                }`}
              >
                {sport}
                {sport !== 'All' && (
                  <span className={`ml-1.5 text-xs ${sportFilter === sport ? 'opacity-80' : 'opacity-50'}`}>
                    {sportsWithCounts[sport]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {visibleCamps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCamps.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No {sportFilter !== 'All' ? sportFilter : ''} camps found yet.</p>
            <button
              onClick={() => setSportFilter('All')}
              className="mt-4 inline-block text-brand-coral hover:underline"
            >
              Show all sports →
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  const camps = await getAllCamps()
  const categories = [...new Set(camps.map((c) => c.category).filter(Boolean))]
  const paths = categories.map((cat) => ({ params: { category: slugify(cat) } }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const camps = await getAllCamps()
  const categories = [...new Set(camps.map((c) => c.category).filter(Boolean))]
  const categoryName = categories.find((cat) => slugify(cat) === params.category)

  if (!categoryName) return { notFound: true }

  const filtered = camps.filter((c) => c.category === categoryName)

  return {
    props: { camps: filtered, categoryName },
    revalidate: 3600,
  }
}
