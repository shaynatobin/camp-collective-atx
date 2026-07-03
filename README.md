# Camp Collective ATX

The definitive summer camp directory for Austin, TX — built with Next.js and powered by Airtable.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create your environment file
Copy the example file and fill in your Airtable token:
```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your Airtable API token:
```
AIRTABLE_API_TOKEN=your_token_here
NEXT_PUBLIC_SITE_URL=https://campcollectiveatx.com
```

To get your Airtable token:
1. Go to airtable.com → your avatar → Developer Hub → Personal Access Tokens
2. Create a token with `data.records:read` and `data.records:write` scopes on your base
3. Paste it into `.env.local`

### 3. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

---

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
3. In the Vercel project settings, go to **Environment Variables** and add:
   - `AIRTABLE_API_TOKEN` = your Airtable token
   - `NEXT_PUBLIC_SITE_URL` = `https://campcollectiveatx.com`
4. Click Deploy

Vercel will automatically deploy every time you push to GitHub.

---

## Rebuilding after Airtable updates

Camp data is fetched from Airtable at build time. After you update Airtable (add new camps, fix info), you need to trigger a rebuild:

**Option A — Manual rebuild:**
Go to Vercel Dashboard → your project → Deployments → click the three dots on the latest deployment → Redeploy.

**Option B — Automatic (set up a webhook):**
In Vercel, go to Settings → Git → Deploy Hooks. Create a hook URL and save it. You can trigger it from Airtable automations or manually with a `curl` command.

Pages also auto-refresh every hour thanks to Incremental Static Regeneration (ISR) — so most updates will appear within 60 minutes without any action from you.

---

## Connecting your domain

After your first successful Vercel deployment:
1. Go to Vercel → your project → Settings → Domains
2. Add `campcollectiveatx.com`
3. Vercel will show you DNS records to add
4. Log into your Squarespace Domains account → DNS Settings for campcollectiveatx.com
5. Update the A record and CNAME to match what Vercel shows
6. Wait 10–30 minutes for DNS to propagate

---

## Project structure

```
├── lib/
│   ├── airtable.js     # Fetches all camp data from Airtable
│   └── utils.js        # Helper functions, category colors, slugify
├── components/
│   ├── Layout.js       # Page wrapper with SEO <head> tags
│   ├── Header.js       # Site navigation
│   ├── Footer.js       # Site footer
│   ├── CampCard.js     # Individual camp listing card
│   └── CategoryBadge.js # Colored category pill
└── pages/
    ├── index.js              # Homepage
    ├── camps/
    │   ├── index.js          # Browse all camps (with filters)
    │   └── [slug].js         # Individual camp page
    ├── category/[category].js # Category hub pages (e.g. /category/arts-creativity)
    ├── city/[city].js         # City hub pages (e.g. /city/round-rock)
    ├── about.js
    ├── submit-a-camp.js
    ├── privacy-policy.js
    ├── terms-of-service.js
    └── api/
        └── submit-camp.js    # API route for camp submission form
```

---

## Updating the brand

When you have your final brand kit:
- Colors: edit `tailwind.config.js` → `theme.extend.colors`
- Fonts: edit `pages/_document.js` (Google Fonts link) and `tailwind.config.js` → `theme.extend.fontFamily`
- Logo: replace the text logo in `components/Header.js` with an `<Image>` component
