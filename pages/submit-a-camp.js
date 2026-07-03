import { useState } from 'react'
import Layout from '../components/Layout'

const CATEGORIES = [
  'Arts & Creativity',
  'STEM & Technology',
  'Nature & Outdoor',
  'Sports & Athletics',
  'Basketball',
  'Baseball',
  'Football',
  'Soccer',
  'Tennis',
  'Volleyball',
  'Golf',
  'General Day Camp',
  'Municipal / Public',
  'Faith-based / Christian',
  'Jewish / Cultural',
  'Special Needs / Inclusive',
  'Language Immersion',
]

const CITIES = ['Austin', 'Round Rock', 'Cedar Park', 'Georgetown', 'Other']

export default function SubmitACamp() {
  const [form, setForm] = useState({
    name: '', url: '', category: '', city: '', description: '',
    priceRange: '', hours: '', email: '', notes: '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/submit-camp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Submission failed')
      setStatus('success')
    } catch {
      setError('Something went wrong. Please try again or email us at shayna.tobin@gmail.com.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <Layout title="Camp Submitted | Camp Collective ATX">
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="font-display text-3xl font-bold text-brand-navy mb-3">Thanks for submitting!</h1>
          <p className="text-gray-600 mb-8">
            We'll review your submission and add it to the directory within 2 business days.
          </p>
          <a href="/camps" className="px-6 py-3 bg-brand-terracotta text-white font-semibold rounded-xl hover:bg-opacity-90">
            Browse All Camps
          </a>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Submit a Camp | Camp Collective ATX"
      description="Is your Austin summer camp missing from our directory? Submit it here and we'll add it within 2 business days. Listings are always free."
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-navy mb-2">
          Submit a Camp
        </h1>
        <p className="text-gray-600 mb-10">
          Is your camp missing from our directory? We'll add it within 2 business days. Listings are always free.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Camp Name <span className="text-brand-terracotta">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-brand-navy"
              placeholder="e.g. Barton Springs Summer Camp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Camp Website</label>
            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-brand-navy"
              placeholder="https://www.yourcamp.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">
                Category <span className="text-brand-terracotta">*</span>
              </label>
              <select
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-brand-navy"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">
                City <span className="text-brand-terracotta">*</span>
              </label>
              <select
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-brand-navy"
              >
                <option value="">Select a city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-brand-navy resize-none"
              placeholder="2–3 sentences about the camp and what makes it special."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">Price Range</label>
              <input
                type="text"
                name="priceRange"
                value={form.priceRange}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-brand-navy"
                placeholder="e.g. $275/week"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">Hours</label>
              <input
                type="text"
                name="hours"
                value={form.hours}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-brand-navy"
                placeholder="e.g. 9am–4pm Mon–Fri"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Your Email <span className="text-brand-terracotta">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-brand-navy"
              placeholder="For follow-up only, won't be published"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Anything else we should know?</label>
            <textarea
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta text-brand-navy resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 bg-brand-terracotta text-white font-semibold rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Submitting...' : 'Submit Camp'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
