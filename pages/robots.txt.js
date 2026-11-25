import { SITE } from '../lib/site'

// robots.txt names this site's own sitemap, so each city's site points at itself.
export default function Robots() {
  return null
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400')
  res.write(`User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`)
  res.end()
  return { props: {} }
}
