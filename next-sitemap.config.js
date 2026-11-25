/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_METRO === 'san-antonio' ? 'https://campcollectivesa.com' : 'https://campcollectiveatx.com'),
  generateRobotsTxt: false,
  changefreq: 'weekly',
  priority: 0.7,
}
