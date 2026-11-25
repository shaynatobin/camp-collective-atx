import { inThisMetro, regionFor } from './site'
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appnSbd15tWgR0ssk'
const TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'tblJu3iphW7Hkx76N'
const REVIEWS_TABLE_ID = process.env.AIRTABLE_REVIEWS_TABLE_ID || 'tblbhEhr6Omv7RU9L'
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`
const REVIEWS_API_URL = `https://api.airtable.com/v0/${BASE_ID}/${REVIEWS_TABLE_ID}`

// Airtable's REST API returns select fields as plain strings, but be tolerant
// of {name} objects too.
function selectName(v) {
  if (!v) return ''
  if (typeof v === 'string') return v
  return v.name || ''
}

function numOrNull(v) {
  const n = typeof v === 'number' ? v : parseFloat(v)
  return Number.isFinite(n) ? n : null
}

// Many listings store a bare domain ("dbat.com/austin"), which the browser
// treats as a path on our own site. Add https:// when there's no scheme, and
// drop values that aren't links at all ("Contact via website").
function normalizeUrl(raw) {
  if (!raw) return ''
  const v = String(raw).trim()
  if (/^https?:\/\//i.test(v)) return v
  if (/\s/.test(v) || !/\.[a-z]{2,}/i.test(v)) return ''
  return `https://${v.replace(/^\/+/, '')}`
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function isLogoImage(url, attachment) {
  if (!url) return false
  const u = url.toLowerCase()
  if (u.endsWith('.svg') || u.endsWith('.gif')) return true
  if (u.includes('logo') || u.includes('icon') || u.includes('badge')) return true
  // Detect from attachment metadata: small (≤400px wide) and roughly square
  if (attachment) {
    const { width, height, filename = '' } = attachment
    if (filename.toLowerCase().includes('logo') || filename.toLowerCase().includes('icon')) return true
    if (width && height && width <= 400 && Math.abs(width - height) / Math.max(width, height) < 0.35) return true
  }
  return false
}

function parseRecord(record) {
  const f = record.fields
  const photoField = f['Photos']
  const attachment = Array.isArray(photoField) && photoField.length > 0 ? photoField[0] : null
  const logoUrl = f['Logo URL'] || null
  // Prefer Logo URL (permanent CDN) if the attachment looks like a logo; otherwise prefer attachment
  const attachmentIsLogo = attachment ? isLogoImage(attachment.url, attachment) : false
  const photo = attachmentIsLogo ? (logoUrl || attachment.url) : (attachment?.url || logoUrl)
  const isLogo = isLogoImage(photo, attachmentIsLogo ? attachment : null) || !!logoUrl

  const dayLength = Array.isArray(f['Day Length']) ? f['Day Length'].map(selectName).filter(Boolean) : []

  return {
    id: record.id,
    slug: '',
    name: f['Camp Name'] || '',
    url: normalizeUrl(f['URL']),
    description: f['Description'] || '',
    city: selectName(f['City']),
    state: selectName(f['State']) || 'TX',
    region: regionFor(selectName(f['City']), selectName(f['Region'])),
    category: selectName(f['Primary Category']),
    campType: selectName(f['Camp Type']),
    season: selectName(f['Season']),
    sessionStart: selectName(f['Session Start']),
    sessionEnd: selectName(f['Session End']),
    firstSessionStart: f['First Session Start'] || null,
    lastSessionEnd: f['Last Session End'] || null,
    registrationOpensDate: f['Registration Opens Date'] || null,
    priceRange: f['Price Range'] || '',
    priceNotes: f['Price Notes'] || '',
    weeklyPriceMin: numOrNull(f['Weekly Price Min']),
    weeklyPriceMax: numOrNull(f['Weekly Price Max']),
    hours: f['Hours'] || '',
    dayLength,
    dayStart: f['Day Start'] || '',
    latestPickup: f['Latest Pickup'] || '',
    extendedCare: f['Extended Care'] || '',
    aftercare: !!f['Aftercare Available'],
    financialAid: !!f['Financial Aid'],
    mealsIncluded: !!f['Meals Included'],
    transportation: !!f['Transportation'],
    ageRange: selectName(f['Age Range']),
    minAge: numOrNull(f['Min Age']),
    maxAge: numOrNull(f['Max Age']),
    specialFeatures: f['Special Features'] || '',
    address: f['Address'] || '',
    photo: photo || null,
    weeklyRate: numOrNull(f['Weekly Rate']),
    isLogo,
    rating: null,
    reviewCount: 0,
  }
}

function assignSlugs(camps) {
  const slugCount = {}
  camps.forEach((camp) => {
    const base = slugify(camp.name || camp.id)
    slugCount[base] = (slugCount[base] || 0) + 1
  })

  const slugUsed = {}
  return camps.map((camp) => {
    const base = slugify(camp.name || camp.id)
    if (slugCount[base] > 1) {
      const suffix = camp.id.replace('rec', '').slice(-6).toLowerCase()
      const unique = `${base}-${suffix}`
      slugUsed[unique] = true
      return { ...camp, slug: unique }
    }
    slugUsed[base] = true
    return { ...camp, slug: base }
  })
}

// Every page (index, camps list, each camp, each city, each category) calls
// getAllCamps() independently, and ISR revalidation re-runs it hourly per page.
// Cache the parsed result in-process so repeated calls within the same warm
// instance reuse one fetch instead of re-pulling the whole table each time.
const CAMPS_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour, matches page `revalidate` window
const CAMPS_FAILURE_CACHE_TTL_MS = 60 * 1000 // don't hammer Airtable during an outage/rate limit
let campsCache = null
let campsCacheExpiry = 0
let campsFetchPromise = null

async function fetchAllCampsFromAirtable() {
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) {
    console.error('AIRTABLE_API_TOKEN is not set')
    return []
  }

  let allRecords = []
  let offset = null

  try {
    do {
      const params = new URLSearchParams({
        pageSize: '100',
        filterByFormula: "OR({Status}='Active',{Status}='')",
      })
      if (offset) params.append('offset', offset)

      const res = await fetch(`${API_URL}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        console.error(`Airtable error: ${res.status} ${res.statusText}`)
        break
      }

      const data = await res.json()
      allRecords = [...allRecords, ...data.records]
      offset = data.offset || null
    } while (offset)
  } catch (err) {
    console.error('Failed to fetch from Airtable:', err)
    return []
  }

  // One table holds every metro's camps; keep only this site's.
  const parsed = allRecords.filter((r) => inThisMetro(r.fields['Metro'])).map(parseRecord)
  return assignSlugs(parsed)
}

export async function getAllCamps() {
  const [camps, summaries] = await Promise.all([getAllCampsRaw(), getReviewSummaries()])
  if (!summaries.size) return camps
  return camps.map((c) => {
    const s = summaries.get(c.id)
    return s ? { ...c, rating: s.rating, reviewCount: s.count } : c
  })
}

async function getAllCampsRaw() {
  const now = Date.now()
  if (campsCache && now < campsCacheExpiry) {
    return campsCache
  }
  if (campsFetchPromise) {
    return campsFetchPromise
  }

  campsFetchPromise = fetchAllCampsFromAirtable()
    .then((camps) => {
      campsCache = camps
      campsCacheExpiry = Date.now() + (camps.length > 0 ? CAMPS_CACHE_TTL_MS : CAMPS_FAILURE_CACHE_TTL_MS)
      return camps
    })
    .finally(() => {
      campsFetchPromise = null
    })

  return campsFetchPromise
}

export async function getCampBySlug(slug) {
  const camps = await getAllCamps()
  return camps.find((c) => c.slug === slug) || null
}

// Reviews only appear on the site once approved in Airtable: either the
// "Review Status" select is set to Approved, or the older "Approved" checkbox
// is ticked. New submissions are saved with Review Status = New.
//
// The Reviews table's "Camp" field is a linked-record field, so filterByFormula
// can't match it against a plain campId. Fetch all approved reviews once and
// filter by campId in JS instead, cached like getAllCamps.
const REVIEWS_CACHE_TTL_MS = 60 * 60 * 1000
const REVIEWS_FAILURE_CACHE_TTL_MS = 60 * 1000
let approvedReviewsCache = null
let approvedReviewsCacheExpiry = 0
let approvedReviewsFetchPromise = null

async function fetchApprovedReviewsFromAirtable() {
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) return { records: [], ok: false }

  let allRecords = []
  let offset = null

  try {
    do {
      const params = new URLSearchParams({
        pageSize: '100',
        filterByFormula: "OR({Review Status}='Approved',{Approved}=1)",
      })
      params.append('sort[0][field]', 'Date Submitted')
      params.append('sort[0][direction]', 'desc')
      if (offset) params.append('offset', offset)

      const res = await fetch(`${REVIEWS_API_URL}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        console.error(`Airtable reviews error: ${res.status} ${res.statusText}`)
        return { records: [], ok: false }
      }

      const data = await res.json()
      allRecords = [...allRecords, ...data.records]
      offset = data.offset || null
    } while (offset)
  } catch (err) {
    console.error('Failed to fetch reviews from Airtable:', err)
    return { records: [], ok: false }
  }

  return { records: allRecords, ok: true }
}

async function getApprovedReviews() {
  const now = Date.now()
  if (approvedReviewsCache && now < approvedReviewsCacheExpiry) return approvedReviewsCache
  if (!approvedReviewsFetchPromise) {
    approvedReviewsFetchPromise = fetchApprovedReviewsFromAirtable()
      .then(({ records, ok }) => {
        approvedReviewsCache = records
        approvedReviewsCacheExpiry = Date.now() + (ok ? REVIEWS_CACHE_TTL_MS : REVIEWS_FAILURE_CACHE_TTL_MS)
        return records
      })
      .finally(() => {
        approvedReviewsFetchPromise = null
      })
  }
  return approvedReviewsFetchPromise
}

function reviewRating(r) {
  const n = parseInt(selectName(r.fields['Star Rating']), 10)
  return n >= 1 && n <= 5 ? n : null
}

// campId -> { rating (average, 1 decimal), count }
async function getReviewSummaries() {
  const records = await getApprovedReviews()
  const totals = new Map()
  for (const r of records || []) {
    const rating = reviewRating(r)
    if (!rating) continue
    for (const campId of r.fields['Camp'] || []) {
      const t = totals.get(campId) || { sum: 0, count: 0 }
      t.sum += rating
      t.count += 1
      totals.set(campId, t)
    }
  }
  const out = new Map()
  totals.forEach((t, id) => out.set(id, { rating: Math.round((t.sum / t.count) * 10) / 10, count: t.count }))
  return out
}

export async function getReviewsForCamp(campId) {
  const records = await getApprovedReviews()
  return (records || [])
    .filter((r) => Array.isArray(r.fields['Camp']) && r.fields['Camp'].includes(campId))
    .filter((r) => reviewRating(r))
    .map((r) => ({
      id: r.id,
      reviewerName: r.fields['Reviewer Name'] || 'Anonymous',
      childAge: r.fields['Child Age'] || '',
      sessionYear: r.fields['Session Year'] || '',
      location: r.fields['Location'] || '',
      rating: reviewRating(r),
      review: r.fields['Review Text'] || '',
    }))
}

// Saves a review for moderation. Never shown until approved in Airtable.
// The reviewer's email is stored privately and never sent to the browser.
export async function submitReview(campId, data) {
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) throw new Error('Missing config')

  const fields = {
    'Camp': [campId],
    'Reviewer Name': data.reviewerName,
    'Reviewer Email': data.reviewerEmail,
    'Star Rating': String(data.rating),
    'Review Text': data.review,
    'Review Status': 'New',
  }
  if (data.childAge) fields['Child Age'] = data.childAge
  if (data.sessionYear) fields['Session Year'] = data.sessionYear
  if (data.location) fields['Location'] = data.location

  const res = await fetch(REVIEWS_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [{ fields }] }),
  })
  if (!res.ok) {
    let message = `Airtable ${res.status}`
    try {
      const err = await res.json()
      message = err.error?.message || err.error?.type || message
    } catch {}
    throw new Error(message)
  }
  return res.json()
}

// Used by the review API to confirm a camp ID is real before writing.
export async function campExists(campId) {
  const camps = await getAllCampsRaw()
  return camps.some((c) => c.id === campId)
}
