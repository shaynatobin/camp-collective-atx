import '../styles/globals.css'
import { ShortlistProvider } from '../lib/ShortlistContext'

export default function App({ Component, pageProps }) {
  return (
    <ShortlistProvider>
      <Component {...pageProps} />
    </ShortlistProvider>
  )
}
