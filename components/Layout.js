import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import ShortlistDrawer from './ShortlistDrawer'

const DEFAULT_TITLE = 'Camp Collective ATX | Austin Summer Camp Directory'
const DEFAULT_DESCRIPTION =
  'Find the perfect summer camp in Austin, TX. Browse 300+ camps in sports, arts, STEM, nature, and more across the Greater Austin area.'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://campcollectiveatx.com'

export default function Layout({ children, title, description, ogImage, canonical }) {
  const pageTitle = title || DEFAULT_TITLE
  const pageDesc = description || DEFAULT_DESCRIPTION
  const pageImage = ogImage || `${SITE_URL}/og-default.png`
  const canonicalUrl = canonical || SITE_URL

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
        <meta property="og:site_name" content="Camp Collective ATX" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={pageImage} />

        <meta name="google-site-verification" content="n2UeOJNS1eWt7GpW0eV_yLFYXd-p6TvB_ZFOQ0Ikcxk" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col bg-brand-paper">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <ShortlistDrawer />
      </div>
    </>
  )
}
