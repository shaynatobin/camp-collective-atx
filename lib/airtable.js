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

export async function getAllCamps() {
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

export async function getCampBySlug(slug) {
  const camps = await getAllCamps()
  return camps.find((c) => c.slug === slug) || null
}

export async function getReviewsForCamp(campId) {
  const token = process.env.AIRTABLE_API_TOKEN
  const tableId = process.env.AIRTABLE_REVIEWS_TABLE_ID
  if (!token || !tableId) return []

  const url = `https://api.airtable.com/v0/appnSbd15tWgR0ssk/${tableId}`
  const params = new URLSearchParams({
    filterByFormula: `AND({Status}='Approved',{Camp ID}='${campId}')`,
    sort: '[{"field":"Submitted At","direction":"desc"}]',
  })

  try {
    const res = await fetch(`${url}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.records.map((r) => ({
      id: r.id,
      reviewerName: r.fields['Reviewer Name'] || 'Anonymous',
      childAge: r.fields['Child Age'] || '',
      sessionYear: r.fields['Session Year'] || '',
      rating: r.fields['Rating'] || 5,
      review: r.fields['Review'] || '',
    }))
  } catch {
    return []
  }
}

export async function submitReview(campId, campName, data) {
  const token = process.env.AIRTABLE_API_TOKEN
  const tableId = process.env.AIRTABLE_REVIEWS_TABLE_ID
  if (!token || !tableId) throw new Error('Missing config')

  const url = `https://api.airtable.com/v0/appnSbd15tWgR0ssk/${tableId}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{
        fields: {
          'Camp Name': campName,
          'Camp ID': campId,
          'Reviewer Name': data.reviewerName,
          'Child Age': data.childAge,
          'Session Year': data.sessionYear,
          'Rating': parseInt(data.rating),
          'Review': data.review,
          'Status': 'Pending Review',
        },
      }],
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to submit review')
  }
  return res.json()
}
