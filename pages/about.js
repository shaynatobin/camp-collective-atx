import Link from 'next/link'
import Layout from '../components/Layout'

export default function About() {
  return (
    <Layout
      title="About Camp Collective ATX | Built by Austin Parents"
      description="Camp Collective ATX is a summer camp directory built by Austin parents, for Austin parents. Our mission is to make finding the perfect Austin summer camp effortless."
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="font-display text-4xl font-bold text-brand-navy mb-4">
          Built by Austin Parents,<br />
          <span className="text-brand-terracotta">for Austin Parents.</span>
        </h1>

        <div className="prose prose-lg text-gray-700 space-y-6">
          <p>
            We're Shane and Shayna Tobin — Austin parents who spent way too many hours across way too
            many browser tabs trying to find the right summer camp for our kids. We kept running into
            the same problem: there was no single place to see everything Austin had to offer.
          </p>
          <p>
            Camp Collective ATX is the directory we wished had existed. Our goal is simple: every summer
            camp in the Austin metro should be findable here, organized clearly, and easy to compare —
            so you can spend less time searching and more time actually enjoying summer with your family.
          </p>

          <h2 className="font-display text-2xl font-bold text-brand-navy pt-4">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose">
            {[
              { step: '1', title: 'Browse', desc: 'Search by category, city, price, or dates.' },
              { step: '2', title: 'Compare', desc: 'Read descriptions, check schedules, compare options side by side.' },
              { step: '3', title: 'Register', desc: 'Click through to the camp\'s own website to sign up.' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-brand-terracotta text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-brand-navy mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="font-display text-2xl font-bold text-brand-navy pt-4">Run a camp in Austin?</h2>
          <p>
            If your camp isn't listed — or if you'd like to update your information — we'd love to hear
            from you. Listings are free.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/submit-a-camp"
            className="px-6 py-3 bg-brand-terracotta text-white font-semibold rounded-xl hover:bg-opacity-90 transition-colors"
          >
            Submit Your Camp
          </Link>
          <Link
            href="/camps"
            className="px-6 py-3 border border-brand-navy text-brand-navy font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Browse All Camps
          </Link>
        </div>
      </div>
    </Layout>
  )
}
