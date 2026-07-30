import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

function LogoMark({ size = 40 }) {
  const s = size / 40
  return (
    <div className="relative flex-shrink-0" style={{ width: 40 * s, height: 34 * s }}>
      {/* Sun circle — sits behind peaks, peeks above */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 14 * s,
        height: 14 * s,
        borderRadius: '50%',
        backgroundColor: '#F2C14E',
        zIndex: 1,
      }} />
      {/* Back peak — forest green */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 32 * s,
        height: 24 * s,
        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
        backgroundColor: '#3B6E52',
        zIndex: 2,
      }} />
      {/* Front peak — coral */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26 * s,
        height: 20 * s,
        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
        backgroundColor: '#E8794A',
        zIndex: 3,
      }} />
    </div>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const navLinks = [
    { href: '/camps', label: 'Browse Camps' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-brand-paper border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={40} />
            <span className="font-display font-semibold text-xl text-brand-ink leading-none">
              Camp Collective<span className="text-brand-coral"> ATX</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-150 ${
                  router.pathname.startsWith(link.href)
                    ? 'text-brand-coral'
                    : 'text-brand-ink hover:text-brand-coral'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit-a-camp"
              className="ml-2 px-4 py-2 bg-brand-coral text-white text-sm font-medium rounded-[10px] hover:bg-brand-coral-dark transition-colors duration-150"
            >
              List Your Camp
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-brand-ink hover:bg-brand-cream"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-brand-border bg-brand-paper px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-brand-ink hover:text-brand-coral"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit-a-camp"
            className="block mt-2 px-4 py-2 bg-brand-coral text-white text-sm font-medium rounded-[10px] text-center"
            onClick={() => setMenuOpen(false)}
          >
            List Your Camp
          </Link>
        </div>
      )}
    </header>
  )
}
