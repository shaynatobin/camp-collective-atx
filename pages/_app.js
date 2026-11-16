import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { ShortlistProvider } from '../lib/ShortlistContext'
import { PlannerProvider } from '../lib/PlannerContext'

export default function App({ Component, pageProps }) {
  return (
    <ShortlistProvider>
      <PlannerProvider>
        <Component {...pageProps} />
        <Analytics />
      </PlannerProvider>
    </ShortlistProvider>
  )
}
