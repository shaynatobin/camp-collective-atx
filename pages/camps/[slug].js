import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import Layout from '../../components/Layout'
import CampCard from '../../components/CampCard'
import CategoryBadge from '../../components/CategoryBadge'
import { StarDisplay, StarInput } from '../../components/StarRating'
import { getAllCamps, getReviewsForCamp } from '../../lib/airtable'
import { getCategoryGradient, truncate, categoryLabel, formatAges, formatWeeklyPrice, campAgeRange } from '../../lib/utils'
import { outboundUrl, trackCampVisit } from '../../lib/outbound'
import { formatSessionDates, seasonNote, PLANNER_YEAR } from '../../lib/season'
import { usePlanner } from '../../lib/PlannerContext'
import Icon from '../../components/Icon'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://campcollectiveatx.com'

function ReviewForm({ campId }) {
  const [form, setForm] = useState({ reviewerName: '', reviewerEmail: '', childAge: '', sessionYear: '', location: '', rating: 0, review: '', website: '' })
  const [startedAt] = useState(() => Date.now())
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
        body: JSON.stringify({ campId, startedAt, ...form }),
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
        <p className="text-sm text-gray-600 mt-1">We read every review before it goes up. Yours should appear here within a few days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <div role="group" aria-labelledby="review-rating-label">
        <p id="review-rating-label" className="block text-sm font-medium text-brand-ink mb-1">Your Rating *</p>
        <StarInput value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="review-name" className="block text-sm font-medium text-brand-ink mb-1">Your Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Sarah M."
            id="review-name"
            value={form.reviewerName}
            onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
          />
        </div>
        <div>
          <label htmlFor="review-child-age" className="block text-sm font-medium text-brand-ink mb-1">Child's Age <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. 8"
            id="review-child-age"
            value={form.childAge}
            onChange={(e) => setForm({ ...form, childAge: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
          />
        </div>
      </div>
      <div>
        <label htmlFor="review-email" className="block text-sm font-medium text-brand-ink mb-1">Your Email *</label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          id="review-email"
            value={form.reviewerEmail}
          onChange={(e) => setForm({ ...form, reviewerEmail: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
        />
        <p className="text-xs text-gray-500 mt-1">Only used to confirm you're a real parent. Never shown or shared.</p>
      </div>
      {/* Honeypot: hidden from people, bots fill it in */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="review-session-year" className="block text-sm font-medium text-brand-ink mb-1">Session Year <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            placeholder={`e.g. ${PLANNER_YEAR - 1}`}
            id="review-session-year"
            value={form.sessionYear}
            onChange={(e) => setForm({ ...form, sessionYear: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
          />
        </div>
        <div>
          <label htmlFor="review-location" className="block text-sm font-medium text-brand-ink mb-1">Your Location <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. Round Rock"
            id="review-location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
          />
        </div>
      </div>
      <div>
        <label htmlFor="review-text" className="block text-sm font-medium text-brand-ink mb-1">Your Review *</label>
        <textarea
          required
          minLength={20}
          maxLength={3000}
          rows={4}
          placeholder="Tell other parents what you and your child loved (or didn't) about this camp..."
          id="review-text"
          value={form.review}
          onChange={(e) => setForm({ ...form, review: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral resize-none"
        />
      </div>
      {errorMsg && <p role="alert" className="text-sm text-red-600">{errorMsg}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 bg-brand-coral text-white text-sm font-semibold rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
      <p className="text-xs text-gray-400">Reviews are checked by a person before they're published.</p>
    </form>
  )
}

export default function CampPage({ camp, relatedCamps, reviews }) {
  const [showForm, setShowForm] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)
  const { openAddModal } = usePlanner()
  const router = useRouter()
  const reviewsSectionRef = useRef(null)

  // Deep link (e.g. /camps/slug?review=1) auto-opens the review form and
  // scrolls to it, so outreach links can drop someone straight into it.
  useEffect(() => {
    if (router.query.review === '1') {
      setShowForm(true)
      reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [router.query.review])

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

  const ages = formatAges(camp)
  const price = formatWeeklyPrice(camp) || camp.priceRange
  const sessionDates = formatSessionDates(camp) || (camp.season && !seasonNote(camp) ? `Summer ${camp.season}` : '')
  const hours = camp.dayStart && camp.latestPickup
    ? `${camp.dayStart} – ${camp.latestPickup}`
    : (/facility/i.test(camp.hours || '') ? '' : camp.hours)
  // Some addresses already include the city, state and ZIP; don't repeat them.
  const addressHasCity = !!camp.address && (
    /\bTX\b|\bTexas\b|\d{5}/i.test(camp.address) ||
    (camp.city && camp.address.toLowerCase().includes(camp.city.toLowerCase()))
  )
  const fullAddress = camp.address
    ? (addressHasCity || !camp.city ? camp.address : `${camp.address}, ${camp.city}, TX`)
    : ''
  const updateListingHref = `mailto:hello@campcollectiveatx.com?subject=${encodeURIComponent(`Update listing: ${camp.name}`)}`
  const note = seasonNote(camp)

  // Highlights are often one line separated by semicolons; show each as its own bullet.
  const features = camp.specialFeatures
    ? camp.specialFeatures
        .split(/\n|;|•/)
        .map((f) => f.replace(/^\s*[-*]\s*/, '').trim())
        .filter(Boolean)
    : []
  const location = camp.city
    ? `${camp.city}, TX${camp.region && camp.region !== camp.city ? ` · ${camp.region}` : ''}`
    : ''
  const glance = [
    ages && { icon: 'ages', label: 'Ages', value: ages },
    price && { icon: 'price', label: 'Price', value: price },
    sessionDates && { icon: 'calendar', label: 'Dates', value: sessionDates },
    hours && { icon: 'clock', label: 'Hours', value: hours },
    camp.aftercare && { icon: 'moon', label: 'Aftercare', value: `Available${camp.latestPickup ? `, until ${camp.latestPickup}` : ''}` },
    (fullAddress || location) && { icon: 'pin', label: 'Where', value: fullAddress || location },
  ].filter(Boolean)

  return (
    <Layout title={pageTitle} description={pageDesc} ogImage={camp.photo} canonical={canonicalUrl}>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                {categoryLabel(camp.category)}
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

          {/* Where and how it's rated; the rest is in the side card */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-ink-soft">
            {location && (
              <span className="flex items-center gap-1">
                <Icon name="pin" className="w-4 h-4 text-brand-forest" />
                {location}
              </span>
            )}
            {avgRating && (
              <span className="flex items-center gap-1.5">
                <StarDisplay rating={Math.round(avgRating)} />
                <span>{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </span>
            )}
          </div>
          {note && (
            <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
              Dates and prices shown are from summer {camp.season}. {PLANNER_YEAR} details aren't posted yet, so check the camp's website.
            </p>
          )}
        </div>

        {/* Phone: photo, then the at-a-glance card, then details.
            Desktop: details on the left, the card stays in view on the right. */}
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-10 lg:gap-y-8">
          {/* Photo, logo or placeholder */}
          <div className="lg:col-start-1 lg:row-start-1">
            {(() => {
              if (!camp.photo || photoFailed) {
                return (
                  <div className={`relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <span className="text-white text-5xl font-display font-bold opacity-60">
                      {camp.name.charAt(0)}
                    </span>
                  </div>
                )
              }
              if (camp.isLogo) {
                return (
                  <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden bg-white border border-brand-border">
                    <Image
                      src={camp.photo}
                      alt={camp.name}
                      fill
                      className="object-contain p-6 sm:p-8 [filter:drop-shadow(0_0_0.6px_rgba(38,36,31,0.55))]"
                      sizes="(max-width: 1024px) 100vw, 760px"
                      priority
                      onError={() => setPhotoFailed(true)}
                    />
                  </div>
                )
              }
              return (
                <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden">
                  <Image
                    src={camp.photo}
                    alt={camp.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 760px"
                    priority
                    onError={() => setPhotoFailed(true)}
                  />
                </div>
              )
            })()}
          </div>

          {/* At a glance */}
          <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-5">
              <h2 className="font-display text-lg font-bold text-brand-ink mb-4">At a glance</h2>
              {glance.length > 0 && (
                <dl className="space-y-3 mb-5">
                  {glance.map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-brand-cream text-brand-forest flex items-center justify-center flex-shrink-0">
                        <Icon name={row.icon} className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs text-brand-ink-soft">{row.label}</dt>
                        <dd className="text-sm text-brand-ink break-words">{row.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )}
              <div className="flex flex-col gap-2">
                {camp.url && (
                  <a
                    href={outboundUrl(camp.url)}
                    target="_blank"
                    rel="noopener"
                    onClick={() => trackCampVisit(camp, 'camp page')}
                    className="px-5 py-2.5 text-center bg-brand-coral text-white font-semibold rounded-xl hover:bg-brand-coral-dark transition-colors"
                  >
                    Visit Camp Website →
                  </a>
                )}
                <button
                  onClick={() => openAddModal(camp)}
                  className="px-5 py-2.5 bg-brand-forest text-white font-semibold rounded-xl hover:bg-brand-forest-dark transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="calendarPlus" className="w-4 h-4" />
                  Add to Planner
                </button>
                {camp.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${camp.name}, ${fullAddress}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 text-center border border-brand-border text-brand-ink font-medium rounded-xl hover:bg-brand-paper transition-colors"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-brand-ink-soft text-center">
              Is this your camp?{' '}
              <a href={updateListingHref} className="text-brand-coral underline hover:text-brand-coral-dark">
                Update your listing
              </a>
            </p>
          </aside>

          {/* Details */}
          <div className="lg:col-start-1 lg:row-start-2 min-w-0">
            {camp.description && (
              <div className="mb-8">
                <h2 className="font-display text-xl font-bold text-brand-ink mb-3">About This Camp</h2>
                <p className="text-brand-ink leading-relaxed">{camp.description}</p>
              </div>
            )}

            {features.length > 0 && (
              <div className="mb-10 bg-white rounded-2xl p-6 border border-brand-border shadow-sm">
                <h2 className="font-display text-xl font-bold text-brand-ink mb-4">Highlights</h2>
                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-brand-ink">
                      <Icon name="check" className="w-4 h-4 text-brand-forest mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews section */}
            <div ref={reviewsSectionRef} className="mb-10 border-t border-brand-border pt-10 scroll-mt-24">
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
                            {[r.location, r.childAge && `Child age ${r.childAge}`, r.sessionYear && `Summer ${r.sessionYear}`].filter(Boolean).join(' · ')}
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
                  <ReviewForm campId={camp.id} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related camps */}
        {relatedCamps.length > 0 && (
          <div className="border-t border-brand-border pt-10 mt-2">
            <h2 className="font-display text-2xl font-bold text-brand-ink mb-6">
              More {categoryLabel(camp.category)} Camps
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
                See all {categoryLabel(camp.category)} camps →
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

// Same category first, then favor camps in the same area and overlapping ages.
function pickRelatedCamps(camp, camps) {
  const ages = campAgeRange(camp)
  const score = (c) => {
    let n = 0
    if (camp.region && c.region === camp.region) n += 3
    if (camp.city && c.city === camp.city) n += 2
    const r = campAgeRange(c)
    if (ages && r && r.min <= ages.max && r.max >= ages.min) n += 2
    if (c.photo) n += 1
    return n
  }
  return camps
    .filter((c) => c.id !== camp.id && c.category === camp.category)
    .map((c) => ({ c, n: score(c) }))
    .sort((a, b) => b.n - a.n || a.c.name.localeCompare(b.c.name))
    .slice(0, 3)
    .map(({ c }) => c)
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const camps = await getAllCamps()
  const camp = camps.find((c) => c.slug === params.slug)

  if (!camp) return { notFound: true }

  const [relatedCamps, reviews] = await Promise.all([
    Promise.resolve(pickRelatedCamps(camp, camps)),
    getReviewsForCamp(camp.id),
  ])

  return {
    props: { camp, relatedCamps, reviews },
    revalidate: 3600,
  }
}
