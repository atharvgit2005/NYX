/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.nyxstudio.tech',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  generateIndexSitemap: false,
  // Public pages we DO want crawled: /, /work, /services, /contact.
  // Everything else is private (auth-gated, API, admin tooling, asset routes).
  exclude: [
    '/api/*',
    '/portal',
    '/portal/*',
    '/clients/*',
    '/uploads/*',
    '/icon.png',
  ],
  robotsTxtOptions: {
    transformRobotsTxt: async () =>
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /portal/',
        'Disallow: /portal',
        'Disallow: /clients/',
        'Disallow: /uploads/',
        '',
        'Sitemap: https://www.nyxstudio.tech/sitemap.xml',
        '',
      ].join('\n'),
  },
}
