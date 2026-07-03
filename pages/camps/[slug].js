import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import Layout from '../../components/Layout'
import CampCard from '../../components/CampCard'
import CategoryBadge from '../../components/CategoryBadge'
import { getAllCamps, getCampBySlug } from '../../lib/airtable'
import { getCategoryGradient, truncate } from '../../lib/utils'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://campcollectiveatx.com'

export default function CampPage({ camp, relatedCamps }) {
  if (!camp) return null

  const gradient = getCategoryGradient(camp.category)
  const pageTitle = `${camp.name} | Austin Summer Camp | Camp Collective ATX`
  const pageDesc = truncate(camp.description || `${camp.name} is a summer camp in ${camp.city || 'Austin'}, TX.`, 160)
  const canonicalUrl = `${SITE_URL}/camps/${camp.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: camp.name,
    description: camp.description || undefined,
    url: camp.url || undefined,
    image: camp.photo || undefined,
    address: camp.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: camp.address,
          addressLocality: camp.city || 'Austin',
          addressRegion: 'TX',
          addressCountry: 'US',
        }
      : undefined,
  }

  const features = camp.specialFeatures
    ? camp.specialFeatures.split('\n').filter((f) => f.trim())
    : []

  return (
    <Layout title={pageTitle} description={pageDesc} ogImage={camp.photo} canonical={canonicalUrl}>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-brand-terracotta">Home</Link>
          <span>/</span>
          <Link href="/camps" className="hover:text-brand-terracotta">Camps</Link>
          {camp.category && (
            <>
              <span>/</span>
              <Link
                href={`/category/${camp.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="hover:text-brand-terracotta"
              >
                {camp.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-brand-navy font-medium">{camp.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <CategoryBadge category={camp.category} size="lg" />
            {camp.campType && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                {camp.campType}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-navy mb-3">
            {camp.name}
          </h1>

          {/* Quick info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {camp.city && (
              <span className="flex items-center gap-1">
                📍 {camp.city}, TX
              </span>
            )}
            {camp.priceRange && (
              <span className="flex items-center gap-1">
                💰 {camp.priceRange}
              </span>
            )}
            {camp.hours && (
              <span className="flex items-center gap-1">
                🕐 {camp.hours}
              </span>
            )}
            {(camp.sessionStart || camp.sessionEnd) && (
              <span className="flex items-center gap-1">
                📅 {camp.sessionStart}{camp.sessionEnd && camp.sessionEnd !== camp.sessionStart ? ` – ${camp.sessionEnd}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Photo or gradient placeholder */}
        <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
          {camp.photo ? (
            <Image
              src={camp.photo}
              alt={camp.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-white text-5xl font-display font-bold opacity-60">
                {camp.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          {camp.url && (
            <a
              href={camp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-brand-terracotta text-white font-semibold rounded-xl hover:bg-opacity-90 transition-colors"
            >
              Visit Camp Website →
            </a>
          )}
          {camp.address && (
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(camp.address + ' ' + camp.city + ' TX')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-300 text-brand-navy font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              View on Google Maps
            </a>
          )}
        </div>

        {/* Description */}
        {camp.description && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold text-brand-navy mb-3">About This Camp</h2>
            <p className="text-gray-700 leading-relaxed">{camp.description}</p>
          </div>
        )}

        {/* Special features */}
        {features.length > 0 && (
          <div className="mb-8 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-display text-xl font-bold text-brand-navy mb-4">Highlights</h2>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-brand-sage font-bold mt-0.5">✓</span>
                  <span>{feature.replace(/^[-•*]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Address */}
        {camp.address && (
          <div className="mb-10 text-sm text-gray-600">
            <strong className="text-brand-navy">Address:</strong> {camp.address}{camp.city ? `, ${camp.city}, TX` : ''}
          </div>
        )}

        {/* Google Reviews nudge */}
        <div className="mb-10 p-4 bg-brand-gold bg-opacity-10 border border-brand-gold border-opacity-30 rounded-xl text-sm text-brand-navy">
          <strong>Want to know what other parents think?</strong> Check out{' '}
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(camp.name + ' Austin TX reviews')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-brand-terracotta"
          >
            Google Reviews for {camp.name}
          </a>
          .
        </div>

        {/* Related camps */}
        {relatedCamps.length > 0 && (
          <div className="border-t border-gray-200 pt-10">
            <h2 className="font-display text-2xl font-bold text-brand-navy mb-6">
              More {camp.category} Camps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedCamps.map((c) => (
                <CampCard key={c.id} camp={c} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href={`/category/${camp.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="text-sm font-medium text-brand-terracotta hover:underline"
              >
                See all {camp.category} camps →
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  const camps = await getAllCamps()
  return {
    paths: camps.map((c) => ({ params: { slug: c.slug } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const camps = await getAllCamps()
  const camp = camps.find((c) => c.slug === params.slug)

  if (!camp) return { notFound: true }

  const relatedCamps = camps
    .filter((c) => c.id !== camp.id && c.category === camp.category)
    .slice(0, 3)

  return {
    props: { camp, relatedCamps },
    revalidate: 3600,
  }
}
