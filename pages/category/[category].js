import Layout from '../../components/Layout'
import CampCard from '../../components/CampCard'
import Link from 'next/link'
import { getAllCamps } from '../../lib/airtable'
import { slugify } from '../../lib/utils'

export default function CategoryPage({ camps, categoryName }) {
  return (
    <Layout
      title={`${categoryName} Camps in Austin TX | Camp Collective ATX`}
      description={`Find the best ${categoryName} summer camps in Austin, TX. Browse ${camps.length} camps for kids across Greater Austin.`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-terracotta">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/camps" className="hover:text-brand-terracotta">Camps</Link>
          <span className="mx-1.5">/</span>
          <span className="text-brand-navy font-medium">{categoryName}</span>
        </nav>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-navy mb-2">
          {categoryName} Camps in Austin
        </h1>
        <p className="text-gray-600 mb-10">
          {camps.length} camp{camps.length !== 1 ? 's' : ''} found in the Greater Austin area.
        </p>

        {camps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No camps found in this category yet.</p>
            <Link href="/camps" className="mt-4 inline-block text-brand-terracotta hover:underline">
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
  const categories = [...new Set(camps.map((c) => c.category).filter(Boolean))]
  return {
    paths: categories.map((cat) => ({ params: { category: slugify(cat) } })),
    fallback: 'blocking',
  }
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
