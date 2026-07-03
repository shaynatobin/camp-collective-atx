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

function parseRecord(record) {
  const f = record.fields
  const photoField = f['Logo/Photo'] || f['Logo'] || f['Photo']
  const photo = Array.isArray(photoField) && photoField.length > 0 ? photoField[0].url : null

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
    specialFeatures: f['Special Features'] || '',
    address: f['Address'] || '',
    photo,
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
      const params = new URLSearchParams({ pageSize: '100' })
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
