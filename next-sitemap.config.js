/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.nyxstudio.tech',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  generateIndexSitemap: false,
  exclude: ['/automate/*', '/icon.png'],
  robotsTxtOptions: {
    transformRobotsTxt: async () =>
      'User-agent: *\nAllow: /\nSitemap: https://www.nyxstudio.tech/sitemap.xml\n',
  },
};
