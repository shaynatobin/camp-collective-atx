import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const navLinks = [
    { href: '/camps', label: 'Browse Camps' },
    { href: '/category/arts-creativity', label: 'Categories' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-brand-cream border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-xl text-brand-navy tracking-tight">
              Camp Collective
              <span className="text-brand-terracotta"> ATX</span>
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
                    ? 'text-brand-terracotta'
                    : 'text-brand-navy hover:text-brand-terracotta'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit-a-camp"
              className="ml-2 px-4 py-2 bg-brand-terracotta text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors duration-150"
            >
              List Your Camp
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-brand-navy hover:bg-gray-100"
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
        <div className="md:hidden border-t border-gray-200 bg-brand-cream px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-brand-navy hover:text-brand-terracotta"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/submit-a-camp"
            className="block mt-2 px-4 py-2 bg-brand-terracotta text-white text-sm font-medium rounded-lg text-center"
            onClick={() => setMenuOpen(false)}
          >
            List Your Camp
          </Link>
        </div>
      )}
    </header>
  )
}
