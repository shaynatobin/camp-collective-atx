import '../styles/globals.css'
import { ShortlistProvider } from '../lib/ShortlistContext'
import { PlannerProvider } from '../lib/PlannerContext'

export default function App({ Component, pageProps }) {
  return (
    <ShortlistProvider>
      <PlannerProvider>
        <Component {...pageProps} />
      </PlannerProvider>
    </ShortlistProvider>
  )
}
