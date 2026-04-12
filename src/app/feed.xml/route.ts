import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE = 'https://www.aiforesights.com'

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, title, summary, excerpt, thumbnail_url, published_at, category_slug, source_name')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  const items = (articles || []).map(a => {
    const description = a.summary || a.excerpt || ''
    const url = `${SITE}/article/${a.slug}`
    const pubDate = a.published_at ? new Date(a.published_at).toUTCString() : new Date().toUTCString()
    const category = (a.category_slug || 'ai-news').replace(/-/g, ' ')

    return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(category)}</category>
      ${a.thumbnail_url ? `<enclosure url="${escapeXml(a.thumbnail_url)}" type="image/jpeg" length="0" />` : ''}
      <source url="${SITE}/feed.xml">AI Foresights</source>
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>AI Foresights — A New Dawn Is Here</title>
    <link>${SITE}</link>
    <description>The world of AI explained in plain English. Daily news, tools, and guides for professionals navigating the AI revolution.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE}/og-default.png</url>
      <title>AI Foresights</title>
      <link>${SITE}</link>
    </image>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
