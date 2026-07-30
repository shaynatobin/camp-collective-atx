import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ShortlistContext = createContext()

export function ShortlistProvider({ children }) {
  const [shortlist, setShortlist] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('camp-shortlist')
      if (saved) setShortlist(JSON.parse(saved))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('camp-shortlist', JSON.stringify(shortlist))
    }
  }, [shortlist, loaded])

  const toggle = useCallback((camp) => {
    setShortlist((prev) => {
      const exists = prev.find((c) => c.id === camp.id)
      return exists ? prev.filter((c) => c.id !== camp.id) : [...prev, camp]
    })
  }, [])

  const isInShortlist = useCallback(
    (campId) => shortlist.some((c) => c.id === campId),
    [shortlist]
  )

  const remove = useCallback((campId) => {
    setShortlist((prev) => prev.filter((c) => c.id !== campId))
  }, [])

  const clear = useCallback(() => setShortlist([]), [])

  return (
    <ShortlistContext.Provider
      value={{ shortlist, toggle, isInShortlist, remove, clear, drawerOpen, setDrawerOpen }}
    >
      {children}
    </ShortlistContext.Provider>
  )
}

export function useShortlist() {
  return useContext(ShortlistContext)
}
