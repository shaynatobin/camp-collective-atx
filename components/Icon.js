// One small line-icon set for the whole site, drawn for Camp Collective.
// Icons take the text color (currentColor), so they match whatever they sit in.
const PATHS = {
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  price: (
    <>
      <path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1a1 1 0 0 1 .7.3l7.6 7.6a1 1 0 0 1 0 1.4l-8.1 8.1a1 1 0 0 1-1.4 0l-7.6-7.6a1 1 0 0 1-.3-.7z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  ages: (
    <>
      <circle cx="12" cy="5.5" r="2.5" />
      <path d="M12 9v6M7.5 11.5 12 10l4.5 1.5M9.5 21l2.5-6 2.5 6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  calendarPlus: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4M12 12.5v5M9.5 15h5" />
    </>
  ),
  moon: <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  check: <path d="M5 12.5 9.5 17 19 7.5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  // Categories
  sports: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7.6 4 2.9-1.5 4.7h-5L8 10.5z" />
      <path d="M12 3v4.6M16 10.5l4.4-1.4M14.5 15.2l2.7 3.7M9.5 15.2l-2.7 3.7M8 10.5 3.6 9.1" />
    </>
  ),
  art: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.6-.2-1-.6-1.4-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2H17a4 4 0 0 0 4-4c0-4.1-4-7.3-9-7.3z" />
      <circle cx="7.5" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9.6" cy="7.4" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.4" cy="7.4" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  stem: (
    <>
      <rect x="3" y="4.5" width="18" height="12.5" rx="2" />
      <path d="M8.5 20.5h7M12 17v3.5M9.5 8.7 7.5 10.75l2 2.05M14.5 8.7l2 2.05-2 2.05" />
    </>
  ),
  nature: (
    <>
      <path d="M2.5 20h19M4 20 12 5.5 20 20" />
      <path d="M9.2 20 12 14.5l2.8 5.5" />
    </>
  ),
  dayCamp: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
    </>
  ),
  theater: (
    <>
      <path d="M5 4.5h14v6.5a7 7 0 0 1-14 0z" />
      <path d="M8.5 9h1.7M13.8 9h1.7M9 13.3c1.7 1.4 4.3 1.4 6 0" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5.5l11-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9.5" r="2.2" />
      <path d="M15.6 14.4A4.5 4.5 0 0 1 20.5 19" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15.5H5.5A1.5 1.5 0 0 0 4 21z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15.5h5.5A1.5 1.5 0 0 1 20 21z" />
    </>
  ),
}

export const CATEGORY_ICONS = {
  'Sports & Athletics': 'sports',
  'Art & Creativity': 'art',
  'STEM & Coding': 'stem',
  'Nature & Outdoor': 'nature',
  'General Day Camp': 'dayCamp',
  'Performing Arts': 'theater',
  'Music': 'music',
  'Special Needs / Inclusive': 'people',
  'Community & Religious': 'people',
  'Montessori & Educational': 'book',
}

export default function Icon({ name, className = 'w-4 h-4', filled = false, title }) {
  const shape = PATHS[name]
  if (!shape) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 ${className}`}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {shape}
    </svg>
  )
}
