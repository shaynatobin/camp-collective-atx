// One codebase, one site per metro. Each Vercel project sets NEXT_PUBLIC_METRO
// ("austin" or "san-antonio"); with nothing set, the site is the Austin one,
// exactly as before.
//
// Camps are shared in one Airtable table. A camp belongs to a metro through its
// "Metro" field; a camp with no Metro set counts as Austin, so the Austin site
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
  },
}

const chosen = SITES[process.env.NEXT_PUBLIC_METRO] || SITES.austin

export const SITE = {
  ...chosen,
  url: process.env.NEXT_PUBLIC_SITE_URL || chosen.url,
}

// Does this Airtable record belong on this site?
export function inThisMetro(metroValue) {
  return (metroValue || 'Austin') === SITE.metro
}
