/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://campcollectiveatx.com',
  generateRobotsTxt: false,
  changefreq: 'weekly',
  priority: 0.7,
}
