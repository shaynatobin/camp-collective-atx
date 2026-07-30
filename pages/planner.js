import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/Layout'
import { getAllCamps } from '../lib/airtable'
import { getCategoryGradient, getInitials, CATEGORY_LABELS } from '../lib/utils'

const STORAGE_KEY = 'camp-planner-2026'

const WEEKS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, 5, 1 + i * 7)
  return {
    idx: i,
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    month: d.toLocaleDateString('en-US', { month: 'long' }),
  }
})

// Group weeks by month for the header
const MONTH_GROUPS = (() => {
  const groups = []
  let cur = null
  WEEKS.forEach((w, i) => {
    if (!cur || cur.month !== w.month) {
      cur = { month: w.month, start: i, count: 1 }
      groups.push(cur)
    } else {
      cur.count++
    }
  })
  return groups
})()

const CHILD_COLORS = [
  { bg: 'bg-brand-forest', text: 'text-white', ring: 'ring-brand-forest', light: 'bg-brand-forest/10' },
  { bg: 'bg-brand-coral', text: 'text-white', ring: 'ring-brand-coral', light: 'bg-brand-coral/10' },
  { bg: 'bg-brand-sun', text: 'text-brand-ink', ring: 'ring-brand-sun', light: 'bg-brand-sun/20' },
]

function parsePrice(text) {
  if (!text) return null
  const m = text.match(/\$?([\d,]+)/)
  if (!m) return null
  return parseInt(m[1].replace(/,/g, ''))
}

function slotKey(childId, weekIdx) {
  return `${childId}-${weekIdx}`
}

function CampThumb({ camp }) {
  const gradient = getCategoryGradient(camp.category)
  const [failed, setFailed] = useState(false)
  return (
    <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-brand-cream">
      {camp.photo && !failed ? (
        <Image src={camp.photo} alt={camp.name} fill className="object-contain p-1" onError={() => setFailed(true)} />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">{getInitials(camp.name)}</span>
        </div>
      )}
    </div>
  )
}

function CampSlot({ camp, onRemove, color }) {
  const gradient = getCategoryGradient(camp.category)
  return (
    <div className="relative rounded-xl overflow-hidden h-24 group border border-gray-100 shadow-sm bg-white">
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient}`} />
      <div className="relative pl-3 pr-2 py-2 h-full flex flex-col justify-between">
        <p className="text-xs font-semibold text-brand-ink line-clamp-3 leading-tight pr-4">{camp.name}</p>
        {camp.priceRange && (
          <p className="text-[11px] text-brand-ink-soft font-medium">{camp.priceRange}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white shadow text-gray-400 hover:text-red-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove"
      >
        ×
      </button>
    </div>
  )
}

function AddSlotButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl text-gray-300 hover:border-brand-coral hover:text-brand-coral hover:bg-brand-coral/5 transition-all text-2xl flex items-center justify-center group"
    >
      <span className="group-hover:scale-110 transition-transform inline-block leading-none">+</span>
    </button>
  )
}

export default function PlannerPage({ camps }) {
  const router = useRouter()
  const [children, setChildren] = useState([{ id: 'c1', name: 'Child 1' }])
  const [slots, setSlots] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [picker, setPicker] = useState(null)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerCategory, setPickerCategory] = useState('')
  const [editingChild, setEditingChild] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const p = router.query.p
    if (p) {
      try {
        const plan = JSON.parse(decodeURIComponent(atob(p)))
        if (plan.children) setChildren(plan.children)
        if (plan.slots) {
          const validIds = new Set(camps.map(c => c.id))
          const valid = {}
          Object.entries(plan.slots).forEach(([k, v]) => {
            if (validIds.has(v.id)) valid[k] = v
          })
          setSlots(valid)
        }
        setLoaded(true)
        return
      } catch {}
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { children: c, slots: s } = JSON.parse(saved)
        if (c) setChildren(c)
        if (s) setSlots(s)
      }
    } catch {}
    setLoaded(true)
  }, [router.query.p, camps])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ children, slots }))
  }, [children, slots, loaded])

  const addChild = () => {
    if (children.length >= 3) return
    setChildren(prev => [...prev, { id: `c${Date.now()}`, name: `Child ${prev.length + 1}` }])
  }

  const removeChild = (id) => {
    setChildren(prev => prev.filter(c => c.id !== id))
    setSlots(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => { if (k.startsWith(`${id}-`)) delete next[k] })
      return next
    })
  }

  const renameChild = (id, name) => {
    setChildren(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }

  const assignCamp = (childId, weekIdx, camp) => {
    setSlots(prev => ({
      ...prev,
      [slotKey(childId, weekIdx)]: {
        id: camp.id,
        name: camp.name,
        slug: camp.slug,
        priceRange: camp.priceRange,
        category: camp.category,
        photo: camp.photo,
      },
    }))
    setPicker(null)
    setPickerSearch('')
    setPickerCategory('')
  }

  const removeSlot = (childId, weekIdx) => {
    setSlots(prev => {
      const next = { ...prev }
      delete next[slotKey(childId, weekIdx)]
      return next
    })
  }

  const totalCost = useMemo(() => {
    return Object.values(slots).reduce((sum, c) => sum + (parsePrice(c.priceRange) || 0), 0)
  }, [slots])

  const totalWeeks = useMemo(() => {
    return new Set(Object.keys(slots).map(k => k.split('-').slice(1).join('-'))).size
  }, [slots])

  const categories = useMemo(() => [...new Set(camps.map(c => c.category).filter(Boolean))].sort(), [camps])

  const filteredCamps = useMemo(() => {
    return camps.filter(c => {
      if (pickerSearch && !c.name.toLowerCase().includes(pickerSearch.toLowerCase())) return false
      if (pickerCategory && c.category !== pickerCategory) return false
      return true
    }).slice(0, 60)
  }, [camps, pickerSearch, pickerCategory])

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const encoded = btoa(encodeURIComponent(JSON.stringify({ children, slots })))
    return `${window.location.origin}/planner?p=${encoded}`
  }, [children, slots])

  const handleShare = () => {
    navigator.clipboard?.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pickerChild = picker ? children.find(c => c.id === picker.childId) : null
  const hasCamps = Object.keys(slots).length > 0

  return (
    <Layout
      title="Summer Planner | Camp Collective ATX"
      description="Plan your family's entire summer camp schedule week by week. Add camps for each child and track your total cost."
    >
      {/* Page header */}
      <div className="bg-gradient-to-br from-brand-forest to-brand-forest-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-brand-sun text-xs font-semibold uppercase tracking-widest mb-1">Summer 2026</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">My Summer Planner</h1>
            <p className="text-white/70 mt-1 text-sm">Map out camps week by week for up to 3 kids.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {children.length < 3 && (
              <button
                onClick={addChild}
                className="px-4 py-2 border border-white/40 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
              >
                + Add Child
              </button>
            )}
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-brand-sun text-brand-ink rounded-xl text-sm font-semibold hover:bg-yellow-300 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Share Plan'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">

        {/* Summary bar */}
        {hasCamps && (
          <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-brand-border shadow-sm px-6 py-4 mb-6 flex flex-wrap gap-8 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-forest/10 flex items-center justify-center text-brand-forest text-lg">📅</div>
              <div>
                <p className="text-xs text-brand-ink-soft font-medium">Weeks planned</p>
                <p className="font-bold text-brand-ink text-xl leading-tight">{totalWeeks}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-coral/10 flex items-center justify-center text-brand-coral text-lg">🏕️</div>
              <div>
                <p className="text-xs text-brand-ink-soft font-medium">Camps added</p>
                <p className="font-bold text-brand-ink text-xl leading-tight">{Object.keys(slots).length}</p>
              </div>
            </div>
            {totalCost > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-sun/30 flex items-center justify-center text-brand-ink text-lg">💰</div>
                <div>
                  <p className="text-xs text-brand-ink-soft font-medium">Est. total cost</p>
                  <p className="font-bold text-brand-coral text-xl leading-tight">${totalCost.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calendar grid */}
        <div className="overflow-x-auto pb-6">
          <div style={{ minWidth: `${WEEKS.length * 152 + 160}px` }} className="max-w-7xl mx-auto">

            {/* Month group labels */}
            <div className="flex mb-1 ml-40">
              {MONTH_GROUPS.map(g => (
                <div
                  key={g.month}
                  style={{ width: g.count * 144 }}
                  className="flex-shrink-0 px-1"
                >
                  <div className="text-xs font-bold text-brand-forest tracking-wide uppercase px-2">
                    {g.month}
                  </div>
                </div>
              ))}
            </div>

            {/* Week header row */}
            <div className="flex mb-3 ml-40">
              {WEEKS.map(w => (
                <div key={w.idx} className="w-36 flex-shrink-0 px-1">
                  <div className="text-xs font-semibold text-brand-ink-soft text-center py-1.5 bg-brand-cream rounded-lg">
                    {w.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Child rows */}
            {children.map((child, childIndex) => {
              const color = CHILD_COLORS[childIndex % CHILD_COLORS.length]
              return (
                <div key={child.id} className="flex mb-3 items-start">
                  {/* Child label */}
                  <div className="w-40 flex-shrink-0 pr-4 pt-1.5">
                    <div className="flex items-center gap-2">
                      {/* Colored avatar */}
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 ${color.bg} ${color.text} flex items-center justify-center text-xs font-bold shadow-sm`}>
                        {child.name.charAt(0).toUpperCase()}
                      </div>

                      {editingChild === child.id ? (
                        <input
                          autoFocus
                          value={child.name}
                          onChange={e => renameChild(child.id, e.target.value)}
                          onBlur={() => setEditingChild(null)}
                          onKeyDown={e => e.key === 'Enter' && setEditingChild(null)}
                          className="flex-1 min-w-0 text-sm font-bold text-brand-ink border-b-2 border-brand-coral outline-none bg-transparent pb-0.5"
                        />
                      ) : (
                        <div className="flex items-center gap-1 min-w-0">
                          <button
                            onClick={() => setEditingChild(child.id)}
                            className="text-sm font-bold text-brand-ink hover:text-brand-coral truncate text-left"
                            title="Click to rename"
                          >
                            {child.name}
                          </button>
                          {children.length > 1 && (
                            <button
                              onClick={() => removeChild(child.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors leading-none flex-shrink-0 text-base"
                              title="Remove child"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Week slots */}
                  {WEEKS.map(w => {
                    const key = slotKey(child.id, w.idx)
                    const camp = slots[key]
                    return (
                      <div key={w.idx} className="w-36 flex-shrink-0 px-1">
                        {camp ? (
                          <CampSlot
                            camp={camp}
                            color={color}
                            onRemove={() => removeSlot(child.id, w.idx)}
                          />
                        ) : (
                          <AddSlotButton
                            onClick={() => {
                              setPicker({ childId: child.id, weekIdx: w.idx })
                              setPickerSearch('')
                              setPickerCategory('')
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Empty state */}
        {!hasCamps && loaded && (
          <div className="max-w-7xl mx-auto text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-cream text-3xl mb-4">🏕️</div>
            <p className="text-brand-ink-soft text-sm font-medium">Click any <span className="font-bold text-brand-coral">+</span> to add a camp to that week.</p>
            <Link href="/camps" className="mt-3 inline-block text-sm text-brand-coral hover:underline font-medium">
              Browse camps →
            </Link>
          </div>
        )}
      </div>

      {/* Camp picker drawer */}
      {picker && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setPicker(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
            {/* Picker header */}
            <div className="bg-gradient-to-br from-brand-forest to-brand-forest-dark text-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">Add a Camp</h2>
                  <p className="text-white/70 text-xs mt-0.5">
                    {pickerChild?.name} · {WEEKS[picker.weekIdx]?.label} week
                  </p>
                </div>
                <button
                  onClick={() => setPicker(null)}
                  className="text-white/60 hover:text-white text-2xl leading-none mt-0.5 transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Search inside header */}
              <div className="mt-4 space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  placeholder="Search camps..."
                  className="w-full px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/20 focus:border-white/40 transition-colors"
                />
                <select
                  value={pickerCategory}
                  onChange={e => setPickerCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-white text-sm focus:outline-none focus:bg-white/20 focus:border-white/40 transition-colors appearance-none"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="text-brand-ink bg-white">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c} className="text-brand-ink bg-white">{CATEGORY_LABELS[c] || c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Camp list */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filteredCamps.map(camp => (
                <button
                  key={camp.id}
                  onClick={() => assignCamp(picker.childId, picker.weekIdx, camp)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-cream text-left transition-colors"
                >
                  <CampThumb camp={camp} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-ink line-clamp-1">{camp.name}</p>
                    <p className="text-xs text-brand-ink-soft mt-0.5 line-clamp-1">
                      {[
                        camp.city && `${camp.city}, TX`,
                        camp.priceRange,
                        camp.sessionStart && camp.sessionEnd
                          ? `${camp.sessionStart}–${camp.sessionEnd}`
                          : camp.sessionStart || null,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
              {filteredCamps.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-brand-ink-soft text-sm">No camps found.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

export async function getStaticProps() {
  const camps = await getAllCamps()
  return {
    props: { camps },
    revalidate: 3600,
  }
}
