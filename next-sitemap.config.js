/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.nyxstudio.in',
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
    '/feed.xml',
  ],
  robotsTxtOptions: {
    transformRobotsTxt: async () => {
      // Same disallow set for every agent — keep the rules identical
      // so behaviour matches the wildcard, and AI crawlers don't get
      // accidentally over-restricted when a new private route lands.
      const disallow = [
        'Disallow: /api/',
        'Disallow: /portal/',
        'Disallow: /portal',
        'Disallow: /clients/',
        'Disallow: /uploads/',
      ]
      // Explicit per-bot Allow blocks. The wildcard already lets these
      // through, but explicit blocks (a) signal intent unambiguously,
      // (b) survive if a hosting provider flips the default later, and
      // (c) make it obvious in audits that AI training/search is opted-in.
      //   GPTBot           — OpenAI training + ChatGPT search retrieval
      //   OAI-SearchBot    — ChatGPT search browsing UA
      //   ChatGPT-User     — on-demand fetch when a user asks ChatGPT to read a URL
      //   ClaudeBot        — Anthropic training + Claude search
      //   anthropic-ai     — older Anthropic UA; harmless to keep listed
      //   PerplexityBot    — Perplexity retrieval
      //   Google-Extended  — opt-in for Gemini/Vertex AI training
      //   CCBot            — Common Crawl, feeds most LLM training corpora
      //   Applebot-Extended — opt-in for Apple Intelligence training
      const aiAgents = [
        'GPTBot',
        'OAI-SearchBot',
        'ChatGPT-User',
        'ClaudeBot',
        'anthropic-ai',
        'PerplexityBot',
        'Google-Extended',
        'CCBot',
        'Applebot-Extended',
      ]
      const blocks = [
        ['User-agent: *', 'Allow: /', ...disallow],
        ...aiAgents.map((ua) => [`User-agent: ${ua}`, 'Allow: /', ...disallow]),
      ]
      return [
        ...blocks.flatMap((b, i) => (i === 0 ? b : ['', ...b])),
        '',
        'Sitemap: https://www.nyxstudio.in/sitemap.xml',
        '',
      ].join('\n')
    },
  },
}
