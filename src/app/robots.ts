import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin',
          '/api/',
          '/author/',       // Old WordPress author URLs — privacy
          '/wp-admin/',
          '/wp-login.php',
          '/wp-content/',
          '/feed/',
          '/tag/',
          '/page/',
          '/confirm',       // Email confirmation page — no SEO value
          '/comments/',      // WordPress comment feeds
        ],
      },
      // Explicitly welcome AI crawlers
      { userAgent: 'GPTBot',          allow: '/' },
      { userAgent: 'ClaudeBot',       allow: '/' },
      { userAgent: 'PerplexityBot',   allow: '/' },
      { userAgent: 'anthropic-ai',    allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Googlebot',       allow: '/' },
    ],
    sitemap: 'https://www.aiforesights.com/sitemap.xml',
  }
}
