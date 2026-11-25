import Head from 'next/head'
import { useRouter } from 'next/router'
import Header from './Header'
import Footer from './Footer'
import ShortlistDrawer from './ShortlistDrawer'
import { SITE } from '../lib/site'

const DEFAULT_TITLE = `${SITE.name} | ${SITE.metro} Summer Camp Directory`
const DEFAULT_DESCRIPTION =
  `Find the right summer camp in ${SITE.metro}, TX. Browse hundreds of camps in sports, arts, STEM, nature, and more across ${SITE.area}, filtered by age, area, price and aftercare.`
const SITE_URL = SITE.url

export default function Layout({ children, title, description, ogImage, canonical, flushFooter = false }) {
  const pageTitle = title || DEFAULT_TITLE
  const pageDesc = description || DEFAULT_DESCRIPTION
  const pageImage = ogImage || `${SITE_URL}/api/og?title=${encodeURIComponent(pageTitle)}`
  const router = useRouter()
  // Each page points search engines at its own address (without filters or anchors),
  // so browse, category and town pages aren't treated as copies of the home page.
  const path = (router?.asPath || '/').split(/[?#]/)[0]
  const canonicalUrl = canonical || `${SITE_URL}${path === '/' ? '' : path}`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={SITE.name} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={pageImage} />

        <meta name="google-site-verification" content="n2UeOJNS1eWt7GpW0eV_yLFYXd-p6TvB_ZFOQ0Ikcxk" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen flex flex-col bg-brand-paper">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer flush={flushFooter} />
        <ShortlistDrawer />
      </div>
    </>
  )
}
