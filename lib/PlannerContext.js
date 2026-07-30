import { createContext, useContext, useState, useCallback } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'camp-planner-2026'

const WEEKS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, 5, 1 + i * 7)
  return {
    idx: i,
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    month: d.toLocaleDateString('en-US', { month: 'long' }),
  }
})

const CHILD_COLORS = [
  { bg: 'bg-brand-forest', text: 'text-white', light: 'bg-brand-forest/10', border: 'border-brand-forest' },
  { bg: 'bg-brand-coral', text: 'text-white', light: 'bg-brand-coral/10', border: 'border-brand-coral' },
  { bg: 'bg-brand-sun', text: 'text-brand-ink', light: 'bg-brand-sun/20', border: 'border-brand-sun' },
]

const PlannerContext = createContext(null)

export function usePlanner() {
  return useContext(PlannerContext)
}

function getPlan() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { children: [{ id: 'c1', name: 'Child 1' }], slots: {} }
}

function savePlan(plan) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
  } catch {}
}

function slotKey(childId, weekIdx) {
  return `${childId}-${weekIdx}`
}

const MONTH_ORDER = ['June', 'July', 'August']

function AddToPlannerModal({ camp, onClose }) {
  const plan = getPlan()
  const [children] = useState(plan.children || [{ id: 'c1', name: 'Child 1' }])
  const [slots, setSlots] = useState(plan.slots || {})
  const [activeChild, setActiveChild] = useState(0)
  const [added, setAdded] = useState(null)

  const monthGroups = WEEKS.reduce((acc, w) => {
    if (!acc[w.month]) acc[w.month] = []
    acc[w.month].push(w)
    return acc
  }, {})

  const assign = (childId, weekIdx) => {
    const child = children.find(c => c.id === childId)
    const week = WEEKS[weekIdx]
    const key = slotKey(childId, weekIdx)
    const newSlots = {
      ...slots,
      [key]: {
        id: camp.id,
        name: camp.name,
        slug: camp.slug,
        priceRange: camp.priceRange,
        weeklyRate: camp.weeklyRate || null,
        category: camp.category,
        photo: camp.photo,
      },
    }
    setSlots(newSlots)
    savePlan({ children, slots: newSlots })
    setAdded({ childName: child.name, weekLabel: week.label })
    setTimeout(onClose, 1800)
  }

  const child = children[activeChild]
  const color = CHILD_COLORS[activeChild % CHILD_COLORS.length]

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden pointer-events-auto">

          {/* Header */}
          <div className="bg-gradient-to-br from-brand-forest to-brand-forest-dark text-white p-5">
            <div className="flex items-start justify-between mb-1">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Add to Planner</p>
              <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none transition-colors">×</button>
            </div>
            <p className="font-display font-bold text-lg leading-tight line-clamp-2">{camp.name}</p>
          </div>

          <div className="p-5">
            {added ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-brand-forest/10 flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
                <p className="font-semibold text-brand-ink">Added to {added.childName}'s plan!</p>
                <p className="text-sm text-brand-ink-soft mt-1">{added.weekLabel} week</p>
                <Link href="/planner" className="mt-4 inline-block text-sm text-brand-coral hover:underline font-medium">
                  View planner →
                </Link>
              </div>
            ) : (
              <>
                {/* Child tabs */}
                {children.length > 1 && (
                  <div className="flex gap-2 mb-4">
                    {children.map((c, i) => {
                      const cc = CHILD_COLORS[i % CHILD_COLORS.length]
                      return (
                        <button
                          key={c.id}
                          onClick={() => setActiveChild(i)}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeChild === i ? `${cc.bg} ${cc.text}` : 'bg-gray-100 text-brand-ink-soft hover:bg-gray-200'
                          }`}
                        >
                          {c.name}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Week grid by month */}
                <div className="space-y-3">
                  {MONTH_ORDER.filter(m => monthGroups[m]).map(month => (
                    <div key={month}>
                      <p className="text-xs font-bold text-brand-forest uppercase tracking-wide mb-1.5">{month}</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {monthGroups[month].map(w => {
                          const key = slotKey(child.id, w.idx)
                          const existing = slots[key]
                          return (
                            <button
                              key={w.idx}
                              onClick={() => assign(child.id, w.idx)}
                              title={existing ? `Replace: ${existing.name}` : w.label}
                              className={`py-2 px-1 rounded-lg text-xs font-medium transition-all text-center leading-tight ${
                                existing
                                  ? `${color.light} border ${color.border} text-brand-ink-soft hover:opacity-80`
                                  : 'bg-gray-100 text-brand-ink hover:bg-brand-cream hover:text-brand-coral'
                              }`}
                            >
                              {w.label}
                              {existing && (
                                <span className="block text-[9px] truncate opacity-60 mt-0.5 max-w-full">
                                  {existing.name.split(' ')[0]}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/planner"
                  className="mt-5 block text-center text-xs text-brand-ink-soft hover:text-brand-coral transition-colors"
                >
                  View full planner →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export function PlannerProvider({ children: reactChildren }) {
  const [modal, setModal] = useState(null)

  const openAddModal = useCallback((camp) => {
    setModal({ camp })
  }, [])

  return (
    <PlannerContext.Provider value={{ openAddModal }}>
      {reactChildren}
      {modal && (
        <AddToPlannerModal
          camp={modal.camp}
          onClose={() => setModal(null)}
        />
      )}
    </PlannerContext.Provider>
  )
}
