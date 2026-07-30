import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useShortlist } from '../lib/ShortlistContext'
import { getCategoryGradient, getInitials, CATEGORY_LABELS } from '../lib/utils'

function CampThumb({ camp }) {
  const gradient = getCategoryGradient(camp.category)
  const [failed, setFailed] = useState(false)
  return (
    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-brand-cream">
      {camp.photo && !failed ? (
        <Image src={camp.photo} alt={camp.name} fill className="object-contain p-1" onError={() => setFailed(true)} />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-white text-sm font-bold">{getInitials(camp.name)}</span>
        </div>
      )}
    </div>
  )
}

function CompareView({ camps, onBack }) {
  const rows = [
    { label: 'Category', key: (c) => CATEGORY_LABELS[c.category] || c.category },
    { label: 'City', key: (c) => c.city ? `${c.city}, TX` : '—' },
    { label: 'Price', key: (c) => c.priceRange || '—' },
    { label: 'Hours', key: (c) => c.hours || '—' },
    { label: 'Sessions', key: (c) => c.sessionStart ? `${c.sessionStart}${c.sessionEnd && c.sessionEnd !== c.sessionStart ? ` – ${c.sessionEnd}` : ''}` : '—' },
    { label: 'Camp Type', key: (c) => c.campType || '—' },
  ]

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-brand-coral mb-4 hover:underline">
        ← Back to list
      </button>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 pr-3 text-brand-ink-soft font-medium w-20"></th>
              {camps.map((c) => (
                <th key={c.id} className="text-left py-2 px-2 font-semibold text-brand-ink">
                  <Link href={`/camps/${c.slug}`} className="hover:text-brand-coral line-clamp-2">
                    {c.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-gray-100">
                <td className="py-2.5 pr-3 text-brand-ink-soft text-xs font-medium">{row.label}</td>
                {camps.map((c) => (
                  <td key={c.id} className="py-2.5 px-2 text-brand-ink">{row.key(c)}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-gray-100">
              <td className="py-3 pr-3"></td>
              {camps.map((c) => (
                <td key={c.id} className="py-3 px-2">
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium text-white bg-brand-coral rounded-lg px-3 py-1.5 hover:bg-brand-coral-dark transition-colors">
                      Visit Site →
                    </a>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ShortlistDrawer() {
  const { shortlist, remove, clear, drawerOpen, setDrawerOpen } = useShortlist()
  const [comparing, setComparing] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const compareCamps = shortlist.filter((c) => selectedIds.includes(c.id))

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/camps?shortlist=${shortlist.map((c) => c.slug).join(',')}`
    : ''

  if (!drawerOpen) {
    return shortlist.length > 0 ? (
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-brand-coral text-white rounded-full px-5 py-3 shadow-lg font-semibold text-sm hover:bg-brand-coral-dark transition-colors flex items-center gap-2"
      >
        ♥ My List ({shortlist.length})
      </button>
    ) : null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-brand-ink">
            My Shortlist {shortlist.length > 0 && <span className="text-brand-ink-soft font-normal text-base">({shortlist.length})</span>}
          </h2>
          <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-brand-ink text-2xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {shortlist.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">♡</div>
              <p className="text-sm">Tap the heart on any camp card to save it here.</p>
            </div>
          ) : comparing && compareCamps.length >= 2 ? (
            <CompareView camps={compareCamps} onBack={() => setComparing(false)} />
          ) : (
            <div className="space-y-3">
              {shortlist.map((camp) => (
                <div key={camp.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-border transition-colors">
                  {comparing && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(camp.id)}
                      onChange={() => toggleSelect(camp.id)}
                      disabled={!selectedIds.includes(camp.id) && selectedIds.length >= 3}
                      className="w-4 h-4 accent-brand-coral flex-shrink-0"
                    />
                  )}
                  <CampThumb camp={camp} />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/camps/${camp.slug}`}
                      onClick={() => setDrawerOpen(false)}
                      className="font-semibold text-brand-ink text-sm hover:text-brand-coral line-clamp-1"
                    >
                      {camp.name}
                    </Link>
                    <p className="text-xs text-brand-ink-soft mt-0.5">
                      {[camp.city && `${camp.city}, TX`, camp.priceRange].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(camp.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-lg"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {shortlist.length > 0 && !comparing && (
          <div className="p-5 border-t border-gray-100 space-y-2">
            {shortlist.length >= 2 && (
              <button
                onClick={() => { setComparing(true); setSelectedIds(shortlist.slice(0, 3).map((c) => c.id)) }}
                className="w-full py-2.5 bg-brand-coral text-white rounded-xl font-semibold text-sm hover:bg-brand-coral-dark transition-colors"
              >
                Compare Camps
              </button>
            )}
            <button
              onClick={() => { navigator.clipboard?.writeText(shareUrl); alert('Link copied!') }}
              className="w-full py-2.5 border border-brand-border text-brand-ink rounded-xl font-medium text-sm hover:bg-brand-cream transition-colors"
            >
              Copy Share Link
            </button>
            <button onClick={clear} className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1">
              Clear all
            </button>
          </div>
        )}

        {comparing && shortlist.length > 0 && (
          <div className="p-5 border-t border-gray-100">
            <p className="text-xs text-brand-ink-soft mb-2 text-center">Select 2–3 camps to compare</p>
            <button
              onClick={() => setComparing(false)}
              className="w-full py-2.5 border border-brand-border text-brand-ink rounded-xl font-medium text-sm hover:bg-brand-cream transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  )
}
