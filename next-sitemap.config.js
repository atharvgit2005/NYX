/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.nyxstudio.tech',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/automate/admin/*', '/automate/dashboard/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/admin', '/automate/admin', '/automate/dashboard'],
      },
    ],
    additionalSitemaps: [
      'https://www.nyxstudio.tech/sitemap.xml',
    ],
  },
  // Custom transform for specific priorities
  transform: async (config, path) => {
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/services') {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path === '/work') {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path === '/contact') {
      priority = 0.6;
      changefreq = 'monthly';
    } else if (path === '/automate') {
      priority = 0.6;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq: changefreq,
      priority: priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
