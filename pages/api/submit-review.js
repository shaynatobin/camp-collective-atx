import { submitReview } from '../../lib/airtable'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { campId, campName, reviewerName, childAge, sessionYear, rating, review } = req.body

  if (!campId || !reviewerName || !rating || !review) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' })
  }

  if (review.trim().length < 10) {
    return res.status(400).json({ error: 'Review must be at least 10 characters' })
  }

  try {
    await submitReview(campId, campName, { reviewerName, childAge, sessionYear, rating, review })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Review submission error:', err)
    return res.status(500).json({ error: 'Failed to submit review' })
  }
}
