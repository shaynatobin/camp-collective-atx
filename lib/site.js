// One codebase, one site per metro. Each Vercel project sets NEXT_PUBLIC_METRO
// ("austin" or "san-antonio"); with nothing set, the site is the Austin one,
// exactly as before.
//
// Camps are shared in one Airtable table. A camp belongs to a metro through its
// "Metro" field (one or more metros); a camp with no Metro set counts as Austin, so the Austin site
// keeps working before that field exists.

const SITES = {
  austin: {
    key: 'austin',
    metro: 'Austin',
    short: 'ATX',
    name: 'Camp Collective ATX',
    area: 'Greater Austin',
    url: 'https://campcollectiveatx.com',
    domain: 'campcollectiveatx.com',
    email: 'hello@campcollectiveatx.com',
    utmSource: 'campcollectiveatx',
    // Towns offered on the submit form (the API only writes these to Airtable).
    submitCities: ['Austin', 'Round Rock', 'Cedar Park', 'Georgetown'],
    exampleTown: 'Round Rock',
    exampleCampName: 'Barton Springs Summer Camp',
    county: 'Travis',
  },
  'san-antonio': {
    key: 'san-antonio',
    metro: 'San Antonio',
    short: 'SA',
    name: 'Camp Collective SA',
    area: 'Greater San Antonio',
    url: 'https://campcollectivesa.com',
    domain: 'campcollectivesa.com',
    // Until a mailbox exists on the new domain, mail goes to the shared inbox.
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@campcollectiveatx.com',
    utmSource: 'campcollectivesa',
    submitCities: ['San Antonio', 'New Braunfels', 'Boerne', 'Schertz', 'Cibolo', 'Helotes'],
    exampleTown: 'Boerne',
    exampleCampName: 'Riverwalk Summer Camp',
    county: 'Bexar',
    // Camps shared with the Austin site carry an Austin region; on this site
    // they are filed by town instead.
    regionByCity: {
      'New Braunfels': 'New Braunfels / Seguin',
      Seguin: 'New Braunfels / Seguin',
      Boerne: 'Boerne / Fair Oaks Ranch',
      Bandera: 'Hill Country (overnight)',
      Comfort: 'Hill Country (overnight)',
      Hunt: 'Hill Country (overnight)',
      Ingram: 'Hill Country (overnight)',
      Kerrville: 'Hill Country (overnight)',
      Wimberley: 'Hill Country (overnight)',
    },
  },
}

const chosen = SITES[process.env.NEXT_PUBLIC_METRO] || SITES.austin

export const SITE = {
  ...chosen,
  url: process.env.NEXT_PUBLIC_SITE_URL || chosen.url,
}

// Does this Airtable record belong on this site? "Metro" is a multi-select, so
// a Hill Country camp can sit on both sites. A blank Metro counts as Austin.
export function inThisMetro(metroValue) {
  const list = (Array.isArray(metroValue) ? metroValue : [metroValue])
    .map((v) => (v && typeof v === 'object' ? v.name : v))
    .filter(Boolean)
  return (list.length ? list : ['Austin']).includes(SITE.metro)
}

// The region a camp is filed under on this site.
export function regionFor(city, region) {
  const byCity = SITE.regionByCity
  if (byCity && region && !Object.values(byCity).includes(region) && region !== SITE.metro) {
    return byCity[city] || region
  }
  return region
}
