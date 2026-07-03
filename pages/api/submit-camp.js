const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appnSbd15tWgR0ssk'
const TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'tblJu3iphW7Hkx76N'
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, url, category, city, description, priceRange, hours, email, notes } = req.body

  if (!name || !category || !city || !email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const fields = {
    'Camp Name': name,
    'Primary Category': category,
    'Description': description || undefined,
    'Price Range': priceRange || undefined,
    'Hours': hours || undefined,
    'Special Features': notes ? `Submitted by: ${email}\n\n${notes}` : `Submitted by: ${email}`,
  }

  // Only include City if it's one of the confirmed valid values
  const validCities = ['Austin', 'Round Rock', 'Cedar Park', 'Georgetown']
  if (validCities.includes(city)) {
    fields['City'] = city
  }

  if (url) fields['URL'] = url

  // Remove undefined values
  Object.keys(fields).forEach((key) => {
    if (fields[key] === undefined) delete fields[key]
  })

  try {
    const airtableRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields }] }),
    })

    if (!airtableRes.ok) {
      const errData = await airtableRes.json()
      console.error('Airtable error:', errData)
      return res.status(500).json({ error: 'Failed to save submission' })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Submit camp error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
