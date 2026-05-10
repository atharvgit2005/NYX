/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.nyxstudio.tech',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  generateIndexSitemap: false,
  // Public pages we DO want crawled: /, /work, /services, /contact, /automate.
  // Everything else is private (auth-gated, API, admin tooling, asset routes).
  exclude: [
    '/api/*',
    '/automate/admin_automate',
    '/automate/admin_automate/*',
    '/automate/dashboard',
    '/automate/dashboard/*',
    '/automate/login',
    '/automate/signin',
    '/automate/signup',
    '/automate/contact',
    '/automate/test-voice',
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
        // Marketing site: portal + clients are auth-gated, never index.
        'Disallow: /portal/',
        'Disallow: /portal',
        'Disallow: /clients/',
        // Automate SaaS routes that exist on the main domain only as
        // 308-redirect targets to the subdomain — also never index.
        'Disallow: /automate/admin_automate/',
        'Disallow: /automate/dashboard/',
        'Disallow: /automate/login',
        'Disallow: /automate/signin',
        'Disallow: /automate/signup',
        'Disallow: /automate/contact',
        'Disallow: /automate/test-voice',
        'Disallow: /uploads/',
        '',
        'Sitemap: https://www.nyxstudio.tech/sitemap.xml',
        '',
      ].join('\n'),
  },
}
