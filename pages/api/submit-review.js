import { submitReview, campExists } from '../../lib/airtable'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_FILL_MS = 3000 // a person can't read the form and write a review in under 3 seconds

function clean(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body || {}

  // Spam protection. Bots fill every field, including the hidden "website"
  // one, and submit instantly. Pretend it worked so they don't retry.
  if (body.website) return res.status(200).json({ success: true })
  const startedAt = Number(body.startedAt)
  if (startedAt && Date.now() - startedAt < MIN_FILL_MS) {
    return res.status(200).json({ success: true })
  }

  const campId = clean(body.campId, 20)
  const reviewerName = clean(body.reviewerName, 80)
  const reviewerEmail = clean(body.reviewerEmail, 120).toLowerCase()
  const childAge = clean(body.childAge, 20)
  const sessionYear = clean(body.sessionYear, 10)
  const location = clean(body.location, 80)
  const review = clean(body.review, 3000)
  const rating = parseInt(body.rating, 10)

  if (!/^rec[A-Za-z0-9]{14}$/.test(campId) || !reviewerName || !reviewerEmail || !review) {
    return res.status(400).json({ error: 'Please fill in your name, email, rating and review.' })
  }
  if (!EMAIL_RE.test(reviewerEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (!(rating >= 1 && rating <= 5)) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' })
  }
  if (review.length < 20) {
    return res.status(400).json({ error: 'Please write at least a sentence or two (20+ characters).' })
  }
  if ((review.match(/https?:\/\//gi) || []).length > 1) {
    return res.status(400).json({ error: 'Please leave out links.' })
  }

  try {
    if (!(await campExists(campId))) {
      return res.status(400).json({ error: 'We could not find that camp.' })
    }
    await submitReview(campId, { reviewerName, reviewerEmail, childAge, sessionYear, location, rating, review })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Review submission error:', err.message)
    return res.status(500).json({ error: 'We could not save your review just now. Please try again in a minute.' })
  }
}
