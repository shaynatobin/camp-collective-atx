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
  }
})

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

function CampSlot({ camp, onRemove }) {
  const gradient = getCategoryGradient(camp.category)
  return (
    <div className="relative rounded-xl overflow-hidden h-24 group border border-gray-100 shadow-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
      <div className="relative p-2 h-full flex flex-col justify-between">
        <p className="text-xs font-semibold text-brand-ink line-clamp-3 leading-tight">{camp.name}</p>
        {camp.priceRange && (
          <p className="text-xs text-gray-500 mt-1">{camp.priceRange}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white shadow text-gray-400 hover:text-red-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove"
      >
        ×
      </button>
    </div>
  )
}

export default function PlannerPage({ camps }) {
  const router = useRouter()
  const [children, setChildren] = useState([{ id: 'c1', name: 'Child 1' }])
  const [slots, setSlots] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [picker, setPicker] = useState(null) // { childId, weekIdx }
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerCategory, setPickerCategory] = useState('')
  const [editingChild, setEditingChild] = useState(null)
  const [copied, setCopied] = useState(false)

  // Load from URL param first, then localStorage
  useEffect(() => {
    const p = router.query.p
    if (p) {
      try {
        const plan = JSON.parse(decodeURIComponent(atob(p)))
        if (plan.children) setChildren(plan.children)
        if (plan.slots) {
          // Validate slots against current camp IDs
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

  // Save to localStorage
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

  return (
    <Layout
      title="Summer Planner | Camp Collective ATX"
      description="Plan your family's entire summer camp schedule week by week. Add camps for each child and track your total cost."
    >
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="max-w-7xl mx-auto flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink">
              My Summer Planner
            </h1>
            <p className="text-gray-600 mt-1">Map out your family's camps week by week.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {children.length < 3 && (
              <button
                onClick={addChild}
                className="px-4 py-2 border border-brand-coral text-brand-coral rounded-xl text-sm font-medium hover:bg-brand-coral hover:text-white transition-colors"
              >
                + Add Child
              </button>
            )}
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-brand-coral text-white rounded-xl text-sm font-medium hover:bg-opacity-90 transition-colors"
            >
              {copied ? 'Copied!' : 'Share Plan'}
            </button>
          </div>
        </div>

        {/* Summary bar */}
        {Object.keys(slots).length > 0 && (
          <div className="max-w-7xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 mb-6 flex flex-wrap gap-8 items-center">
            <div>
              <p className="text-xs text-gray-500">Weeks planned</p>
              <p className="font-bold text-brand-ink text-xl">{totalWeeks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Camps added</p>
              <p className="font-bold text-brand-ink text-xl">{Object.keys(slots).length}</p>
            </div>
            {totalCost > 0 && (
              <div>
                <p className="text-xs text-gray-500">Est. total cost</p>
                <p className="font-bold text-brand-coral text-xl">${totalCost.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Calendar grid */}
        <div className="overflow-x-auto pb-6">
          <div style={{ minWidth: `${WEEKS.length * 152 + 112}px` }} className="max-w-7xl mx-auto">

            {/* Week header row */}
            <div className="flex mb-2 ml-28">
              {WEEKS.map(w => (
                <div key={w.idx} className="w-36 flex-shrink-0 px-1">
                  <div className="text-xs font-semibold text-gray-500 text-center py-1.5 bg-gray-50 rounded-lg">
                    {w.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Child rows */}
            {children.map((child, childIndex) => (
              <div key={child.id} className="flex mb-3 items-start">
                {/* Child name label */}
                <div className="w-28 flex-shrink-0 pr-3 pt-2">
                  {editingChild === child.id ? (
                    <input
                      autoFocus
                      value={child.name}
                      onChange={e => renameChild(child.id, e.target.value)}
                      onBlur={() => setEditingChild(null)}
                      onKeyDown={e => e.key === 'Enter' && setEditingChild(null)}
                      className="w-full text-sm font-bold text-brand-ink border-b-2 border-brand-coral outline-none bg-transparent pb-0.5"
                    />
                  ) : (
                    <div className="group flex items-center gap-1">
                      <button
                        onClick={() => setEditingChild(child.id)}
                        className="text-sm font-bold text-brand-ink hover:text-brand-coral truncate max-w-[76px] text-left"
                        title="Click to rename"
                      >
                        {child.name}
                      </button>
                      {children.length > 1 && (
                        <button
                          onClick={() => removeChild(child.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity leading-none"
                          title="Remove child"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Week slots */}
                {WEEKS.map(w => {
                  const key = slotKey(child.id, w.idx)
                  const camp = slots[key]
                  return (
                    <div key={w.idx} className="w-36 flex-shrink-0 px-1">
                      {camp ? (
                        <CampSlot camp={camp} onRemove={() => removeSlot(child.id, w.idx)} />
                      ) : (
                        <button
                          onClick={() => {
                            setPicker({ childId: child.id, weekIdx: w.idx })
                            setPickerSearch('')
                            setPickerCategory('')
                          }}
                          className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl text-gray-300 hover:border-brand-coral hover:text-brand-coral transition-colors text-2xl flex items-center justify-center"
                        >
                          +
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {Object.keys(slots).length === 0 && loaded && (
          <div className="max-w-7xl mx-auto text-center py-8 text-gray-400">
            <p className="text-sm">Click any <span className="font-bold text-brand-coral">+</span> to add a camp to that week.</p>
            <Link href="/camps" className="mt-3 inline-block text-sm text-brand-coral hover:underline">
              Browse camps →
            </Link>
          </div>
        )}
      </div>

      {/* Camp picker drawer */}
      {picker && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setPicker(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
            {/* Picker header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-display text-lg font-bold text-brand-ink">Add a Camp</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {pickerChild?.name} · {WEEKS[picker.weekIdx]?.label} week
                </p>
              </div>
              <button onClick={() => setPicker(null)} className="text-gray-400 hover:text-brand-ink text-2xl leading-none">×</button>
            </div>

            {/* Search + category */}
            <div className="p-4 border-b border-gray-100 space-y-2">
              <input
                type="text"
                autoFocus
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
                placeholder="Search camps..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
              <select
                value={pickerCategory}
                onChange={e => setPickerCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-coral"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                ))}
              </select>
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
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {[
                        camp.city && `${camp.city}, TX`,
                        camp.priceRange,
                        camp.sessionStart && camp.sessionEnd
                          ? `${camp.sessionStart}–${camp.sessionEnd}`
                          : camp.sessionStart || null,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </button>
              ))}
              {filteredCamps.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-12">No camps found.</p>
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
