/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.nyxstudio.tech',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  generateIndexSitemap: false,
  exclude: ['/automate/*', '/icon.png'],
  robotsTxtOptions: {
    transformRobotsTxt: async () =>
      'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /automate/admin/\nDisallow: /automate/contact/\nDisallow: /automate/dashboard/\nDisallow: /automate/login/\nDisallow: /automate/signin/\nDisallow: /automate/signup/\nDisallow: /automate/test-voice/\nDisallow: /uploads/\nSitemap: https://www.nyxstudio.tech/sitemap.xml\n',
  },
};
