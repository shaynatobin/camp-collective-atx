// The summer parents are currently planning for. Bump this once a year
// (each fall) so the planner, the "week of" filter and the season badges move together.
export const PLANNER_YEAR = 2027

// Camp weeks run Monday–Friday, so start on the first Monday on/after June 1.
function firstMondayOnOrAfter(year, month, day) {
  const d = new Date(year, month, day)
  const daysUntilMonday = (8 - d.getDay()) % 7
  d.setDate(d.getDate() + daysUntilMonday)
  return d
}

const SUMMER_START = firstMondayOnOrAfter(PLANNER_YEAR, 5, 1)

function toISODate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export const SUMMER_WEEKS = Array.from({ length: 12 }, (_, i) => {
  const start = new Date(SUMMER_START)
  start.setDate(start.getDate() + i * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 4) // Friday
  return {
    idx: i,
    label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    month: start.toLocaleDateString('en-US', { month: 'long' }),
    start: toISODate(start),
    end: toISODate(end),
  }
})

// Month-day ("06-08") so a camp's dates can be compared with a week even when
// the listing still holds last summer's dates (camps tend to run the same weeks).
function monthDay(iso) {
  return iso ? iso.slice(5, 10) : null
}

// True when the camp's first-start/last-end window overlaps the given week.
// Returns null when the camp has no real dates yet (caller decides what to do).
export function campRunsDuringWeek(camp, week) {
  const s = monthDay(camp.firstSessionStart)
  const e = monthDay(camp.lastSessionEnd) || s
  if (!s) return null
  return s <= monthDay(week.end) && e >= monthDay(week.start)
}

// Human label for a camp's dates, e.g. "Jun 8 – Aug 14, 2026".
export function formatSessionDates(camp) {
  const fmt = (iso, withYear) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(withYear ? { year: 'numeric' } : {}),
    })
  if (camp.firstSessionStart && camp.lastSessionEnd && camp.lastSessionEnd !== camp.firstSessionStart) {
    return `${fmt(camp.firstSessionStart, false)} – ${fmt(camp.lastSessionEnd, true)}`
  }
  if (camp.firstSessionStart) return `Starts ${fmt(camp.firstSessionStart, true)}`
  return null
}

// Is this listing's info for the summer parents are planning (or later)?
export function isCurrentSeason(camp) {
  const s = parseInt(camp.season, 10)
  return !!s && s >= PLANNER_YEAR
}

// Short note shown when a listing still carries an older summer's info.
export function seasonNote(camp) {
  if (!camp.season || isCurrentSeason(camp)) return null
  return `${camp.season} info · ${PLANNER_YEAR} not posted yet`
}
