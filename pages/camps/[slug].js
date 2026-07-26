import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import Layout from '../../components/Layout'
import CampCard from '../../components/CampCard'
import CategoryBadge from '../../components/CategoryBadge'
import { StarDisplay, StarInput } from '../../components/StarRating'
import { getAllCamps, getReviewsForCamp } from '../../lib/airtable'
import { getCategoryGradient, truncate } from '../../lib/utils'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://campcollectiveatx.com'

function ReviewForm({ campId, campName }) {
  const [form, setForm] = useState({ reviewerName: '', childAge: '', sessionYear: '', rating: 0, review: '' })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.rating === 0) { setErrorMsg('Please select a star rating.'); return }
    setSubmitting(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campId, campName, ...form }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-brand-forest bg-opacity-10 border border-brand-forest border-opacity-30 rounded-xl p-6 text-center">
        <div className="text-2xl mb-2">🎉</div>
        <p className="font-semibold text-brand-ink">Thank you for your review!</p>
        <p className="text-sm text-gray-600 mt-1">It will appear here after moderation, usually within a day or two.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-ink mb-1">Your Rating *</label>
        <StarInput value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1">Your Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Sarah M."
            value={form.reviewerName}
            onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1">Child's Age <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. 8"
            value={form.childAge}
            onChange={(e) => setForm({ ...form, childAge: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-ink mb-1">Session Year <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          type="text"
          placeholder="e.g. 2025"
          value={form.sessionYear}
          onChange={(e) => setForm({ ...form, sessionYear: e.target.value })}
          className="w-full sm:w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-ink mb-1">Your Review *</label>
        <textarea
          required
          minLength={10}
          rows={4}
          placeholder="Tell other parents what you and your child loved (or didn't) about this camp..."
          value={form.review}
          onChange={(e) => setForm({ ...form, review: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral resize-none"
        />
      </div>
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 bg-brand-coral text-white text-sm font-semibold rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
      <p className="text-xs text-gray-400">Reviews are moderated before publishing.</p>
    </form>
  )
}

export default function CampPage({ camp, relatedCamps, reviews }) {
  const [showForm, setShowForm] = useState(false)

  if (!camp) return null

  const gradient = getCategoryGradient(camp.category)
  const pageTitle = `${camp.name} | Austin Summer Camp | Camp Collective ATX`
  const pageDesc = truncate(camp.description || `${camp.name} is a summer camp in ${camp.city || 'Austin'}, TX.`, 160)
  const canonicalUrl = `${SITE_URL}/camps/${camp.slug}`

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null

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
    ...(avgRating && reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
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
          <Link href="/" className="hover:text-brand-coral">Home</Link>
          <span>/</span>
          <Link href="/camps" className="hover:text-brand-coral">Camps</Link>
          {camp.category && (
            <>
              <span>/</span>
              <Link
                href={`/category/${camp.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="hover:text-brand-coral"
              >
                {camp.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-brand-ink font-medium">{camp.name}</span>
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
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink mb-3">
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
            {avgRating && (
              <span className="flex items-center gap-1.5">
                <StarDisplay rating={Math.round(avgRating)} />
                <span>{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
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
              className="px-6 py-3 bg-brand-coral text-white font-semibold rounded-xl hover:bg-opacity-90 transition-colors"
            >
              Visit Camp Website →
            </a>
          )}
          {camp.address && (
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(camp.address + ' ' + camp.city + ' TX')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-300 text-brand-ink font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              View on Google Maps
            </a>
          )}
        </div>

        {/* Description */}
        {camp.description && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold text-brand-ink mb-3">About This Camp</h2>
            <p className="text-gray-700 leading-relaxed">{camp.description}</p>
          </div>
        )}

        {/* Special features */}
        {features.length > 0 && (
          <div className="mb-8 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-display text-xl font-bold text-brand-ink mb-4">Highlights</h2>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-brand-forest font-bold mt-0.5">✓</span>
                  <span>{feature.replace(/^[-•*]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Address */}
        {camp.address && (
          <div className="mb-10 text-sm text-gray-600">
            <strong className="text-brand-ink">Address:</strong> {camp.address}{camp.city ? `, ${camp.city}, TX` : ''}
          </div>
        )}

        {/* Reviews section */}
        <div className="mb-10 border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-brand-ink">
              Parent Reviews
              {reviews.length > 0 && (
                <span className="ml-2 text-lg font-normal text-gray-500">({reviews.length})</span>
              )}
            </h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-sm font-medium text-brand-coral border border-brand-coral rounded-lg px-4 py-1.5 hover:bg-brand-coral hover:text-white transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-6 mb-8">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-semibold text-brand-ink text-sm">{r.reviewerName}</p>
                      <p className="text-xs text-gray-400">
                        {[r.childAge && `Child age ${r.childAge}`, r.sessionYear && `Summer ${r.sessionYear}`].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <StarDisplay rating={r.rating} />
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{r.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-6">No reviews yet — be the first to share your experience!</p>
          )}

          {showForm && (
            <div className="bg-brand-cream rounded-xl p-6 border border-gray-200">
              <h3 className="font-display text-lg font-bold text-brand-ink mb-4">Share Your Experience</h3>
              <ReviewForm campId={camp.id} campName={camp.name} />
            </div>
          )}
        </div>

        {/* Related camps */}
        {relatedCamps.length > 0 && (
          <div className="border-t border-gray-200 pt-10">
            <h2 className="font-display text-2xl font-bold text-brand-ink mb-6">
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
                className="text-sm font-medium text-brand-coral hover:underline"
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

  const [relatedCamps, reviews] = await Promise.all([
    Promise.resolve(camps.filter((c) => c.id !== camp.id && c.category === camp.category).slice(0, 3)),
    getReviewsForCamp(camp.id),
  ])

  return {
    props: { camp, relatedCamps, reviews },
    revalidate: 3600,
  }
}
