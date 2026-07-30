export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (req.headers['x-revalidate-secret'] !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ error: 'Invalid secret' })
  }

  try {
    await res.revalidate('/camps')
    await res.revalidate('/')
    return res.json({ revalidated: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
