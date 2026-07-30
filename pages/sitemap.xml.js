import { getAllCamps } from '../lib/airtable'
import { slugify } from '../lib/utils'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://campcollectiveatx.com'

function generateSitemap(camps) {
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/camps', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/submit-a-camp', priority: '0.6', changefreq: 'monthly' },
  ]

  const categories = [...new Set(camps.map((c) => c.category).filter(Boolean))]
  const categoryPages = categories.map((cat) => ({
    url: `/category/${slugify(cat)}`,
    priority: '0.8',
    changefreq: 'weekly',
  }))

  const cities = [...new Set(camps.map((c) => c.city).filter(Boolean))]
  const cityPages = cities.map((city) => ({
    url: `/city/${slugify(city)}`,
    priority: '0.7',
    changefreq: 'weekly',
  }))

  const campPages = camps.map((camp) => ({
    url: `/camps/${camp.slug}`,
    priority: '0.6',
    changefreq: 'weekly',
  }))

  const allPages = [...staticPages, ...categoryPages, ...cityPages, ...campPages]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    ({ url, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`
}

export default function Sitemap() {
  return null
}

export async function getServerSideProps({ res }) {
  const camps = await getAllCamps()
  const sitemap = generateSitemap(camps)

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.write(sitemap)
  res.end()

  return { props: {} }
}
