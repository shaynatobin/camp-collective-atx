import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="font-display font-bold text-lg mb-2">
              Camp Collective <span className="text-brand-terracotta">ATX</span>
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The definitive summer camp directory for Austin, TX and the surrounding area.
            </p>
          </div>

          {/* Site links */}
          <div>
            <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Explore</p>
            <ul className="space-y-2">
              {[
                { href: '/camps', label: 'Browse All Camps' },
                { href: '/submit-a-camp', label: 'Submit a Camp' },
                { href: '/about', label: 'About Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Legal</p>
            <ul className="space-y-2">
              {[
                { href: '/privacy-policy', label: 'Privacy Policy' },
                { href: '/terms-of-service', label: 'Terms of Service' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Camp Collective ATX. All rights reserved. Built by Austin parents, for Austin parents.
        </div>
      </div>
    </footer>
  )
}
