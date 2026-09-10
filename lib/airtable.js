const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appnSbd15tWgR0ssk'
const TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'tblJu3iphW7Hkx76N'
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`

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

  return {
    id: record.id,
    slug: '',
    name: f['Camp Name'] || '',
    url: f['URL'] || '',
    description: f['Description'] || '',
    city: f['City'] || '',
    state: f['State'] || 'TX',
    category: f['Primary Category'] || '',
    campType: f['Camp Type'] || '',
    sessionStart: f['Session Start'] || '',
    sessionEnd: f['Session End'] || '',
    priceRange: f['Price Range'] || '',
    hours: f['Hours'] || '',
    ageRange: f['Age Range'] || '',
    specialFeatures: f['Special Features'] || '',
    address: f['Address'] || '',
    photo,
    weeklyRate: f['Weekly Rate'] || null,
    isLogo,
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

  const parsed = allRecords.map(parseRecord)
  return assignSlugs(parsed)
}

export async function getAllCamps() {
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

// The Reviews table's "Camp" field is a linked-record field, so filterByFormula
// can't match it against a plain campId (it renders as the linked camp's name,
// not its record ID). Fetch all approved reviews once and filter by campId in
// JS instead — cached the same way as getAllCamps to avoid re-fetching per page.
const REVIEWS_CACHE_TTL_MS = 60 * 60 * 1000
const REVIEWS_FAILURE_CACHE_TTL_MS = 60 * 1000
let approvedReviewsCache = null
let approvedReviewsCacheExpiry = 0
let approvedReviewsFetchPromise = null

async function fetchApprovedReviewsFromAirtable() {
  const token = process.env.AIRTABLE_API_TOKEN
  const tableId = process.env.AIRTABLE_REVIEWS_TABLE_ID
  if (!token || !tableId) return { records: [], ok: false }

  const url = `https://api.airtable.com/v0/appnSbd15tWgR0ssk/${tableId}`
  let allRecords = []
  let offset = null

  try {
    do {
      const params = new URLSearchParams({
        pageSize: '100',
        filterByFormula: '{Approved}=1',
      })
      params.append('sort[0][field]', 'Date Submitted')
      params.append('sort[0][direction]', 'desc')
      if (offset) params.append('offset', offset)

      const res = await fetch(`${url}?${params}`, {
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

export async function getReviewsForCamp(campId) {
  const now = Date.now()
  if (!(approvedReviewsCache && now < approvedReviewsCacheExpiry)) {
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
    approvedReviewsCache = await approvedReviewsFetchPromise
  }

  return (approvedReviewsCache || [])
    .filter((r) => Array.isArray(r.fields['Camp']) && r.fields['Camp'].includes(campId))
    .map((r) => ({
      id: r.id,
      reviewerName: r.fields['Reviewer Name'] || 'Anonymous',
      childAge: r.fields['Child Age'] || '',
      sessionYear: r.fields['Session Year'] || '',
      location: r.fields['Location'] || '',
      rating: Number(r.fields['Star Rating']) || 5,
      review: r.fields['Review Text'] || '',
    }))
}

export async function submitReview(campId, data) {
  const token = process.env.AIRTABLE_API_TOKEN
  const tableId = process.env.AIRTABLE_REVIEWS_TABLE_ID
  if (!token || !tableId) throw new Error('Missing config')

  const url = `https://api.airtable.com/v0/appnSbd15tWgR0ssk/${tableId}`
  const fields = {
    'Camp': [campId],
    'Reviewer Name': data.reviewerName,
    'Star Rating': String(data.rating),
    'Review Text': data.review,
  }
  if (data.childAge) fields['Child Age'] = data.childAge
  if (data.sessionYear) fields['Session Year'] = data.sessionYear
  if (data.location) fields['Location'] = data.location

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [{ fields }] }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to submit review')
  }
  return res.json()
}
