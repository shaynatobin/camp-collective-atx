/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve camp photos straight from their source instead of through
    // Vercel Image Optimization. The free plan's 5,000 monthly
    // transformations ran out, and every extra resize now fails with 402.
    // Airtable attachment links change every few hours, so each page
    // rebuild counted as brand-new images and burned through the allowance.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
}
module.exports = nextConfig
