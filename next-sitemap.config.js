/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.nyxstudio.tech',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/automate/*'], // Exclude dashboard pages if needed
};
