import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE = 'https://www.aiforesights.com'

const STATIC_PAGES = [
  { url: '/',              priority: '1.0', changefreq: 'hourly' },
  { url: '/latest-news',  priority: '0.9', changefreq: 'hourly' },
  { url: '/future-of-ai', priority: '0.9', changefreq: 'daily'  },
  { url: '/best-ai-tools',priority: '0.9', changefreq: 'daily'  },
  { url: '/make-money',   priority: '0.9', changefreq: 'weekly' },
  { url: '/learn-ai',     priority: '0.9', changefreq: 'weekly' },
  { url: '/about',        priority: '0.5', changefreq: 'monthly'},
  { url: '/advertise',    priority: '0.5', changefreq: 'monthly'},
  { url: '/contact',      priority: '0.5', changefreq: 'monthly'},
  { url: '/newsletter',   priority: '0.6', changefreq: 'monthly'},
]

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch all published own-content articles (most SEO value)
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at, updated_at, source_name')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(500)

  const now = new Date().toISOString()

  const staticUrls = STATIC_PAGES.map(p => `
  <url>
    <loc>${SITE}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

  const articleUrls = (articles || [])
    .filter(a => a.slug)
    .map(a => {
      const isOwn = a.source_name === 'AI Foresights'
      const lastmod = a.updated_at || a.published_at || now
      return `
  <url>
    <loc>${SITE}/article/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${isOwn ? '0.8' : '0.6'}</priority>
  </url>`
    }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${staticUrls}
${articleUrls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
