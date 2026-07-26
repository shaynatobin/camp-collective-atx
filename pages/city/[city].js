import Layout from '../../components/Layout'
import CampCard from '../../components/CampCard'
import Link from 'next/link'
import { getAllCamps } from '../../lib/airtable'
import { slugify } from '../../lib/utils'

export default function CityPage({ camps, cityName }) {
  return (
    <Layout
      title={`Summer Camps in ${cityName}, TX | Camp Collective ATX`}
      description={`Find summer camps in ${cityName}, TX. Browse ${camps.length} camps near ${cityName} for kids of all ages and interests.`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-coral">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/camps" className="hover:text-brand-coral">Camps</Link>
          <span className="mx-1.5">/</span>
          <span className="text-brand-ink font-medium">{cityName}</span>
        </nav>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink mb-2">
          Summer Camps in {cityName}, TX
        </h1>
        <p className="text-gray-600 mb-10">
          {camps.length} camp{camps.length !== 1 ? 's' : ''} found near {cityName}.
        </p>

        {camps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No camps found in {cityName} yet.</p>
            <Link href="/camps" className="mt-4 inline-block text-brand-coral hover:underline">
              Browse all camps →
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  const camps = await getAllCamps()
  const cities = [...new Set(camps.map((c) => c.city).filter(Boolean))]
  return {
    paths: cities.map((city) => ({ params: { city: slugify(city) } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const camps = await getAllCamps()
  const cities = [...new Set(camps.map((c) => c.city).filter(Boolean))]
  const cityName = cities.find((city) => slugify(city) === params.city)

  if (!cityName) return { notFound: true }

  const filtered = camps.filter((c) => c.city === cityName)

  return {
    props: { camps: filtered, cityName },
    revalidate: 3600,
  }
}
