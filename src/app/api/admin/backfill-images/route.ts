export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  'latest-news': [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
    'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
    'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=800&q=80',
  ],
  'future-of-ai': [
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80',
  ],
  'best-ai-tools': [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  ],
  'make-money': [
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
  ],
  'learn-ai': [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b6fa?w=800&q=80',
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
  ],
}
function getRandomFallback(category: string): string {
  const pool = CATEGORY_IMAGE_POOLS[category] ?? CATEGORY_IMAGE_POOLS['latest-news']
  return pool[Math.floor(Math.random() * pool.length)]
}

async function scrapeOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AIForesights Bot/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const og = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
    return og ? og[1] : null
  } catch {
    return null
  }
}

export async function POST() {
  const results = { checked: 0, updated: 0, skipped: 0, errors: 0 }

  try {
    // Fetch ALL articles that need real images:
    // 1. NULL thumbnail
    // 2. Empty string thumbnail
    // 3. Unsplash placeholder (category fallback — not a real article image)
    const UNSPLASH_PATTERN = 'images.unsplash.com'

    const { data: allArticles, error: e1 } = await supabaseAdmin
      .from('articles')
      .select('id, source_url, source_name, title, is_featured, category_slug, thumbnail_url')
      .not('source_url', 'is', null)
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(200)

    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

    // Filter to only those that need a real image
    const articles = (allArticles ?? []).filter(a =>
      !a.thumbnail_url ||
      a.thumbnail_url === '' ||
      a.thumbnail_url.includes(UNSPLASH_PATTERN)
    )

    if (!articles.length) return NextResponse.json({ message: 'No articles need backfilling', ...results })

    results.checked = articles.length

    // Track scraped image URLs per source to detect generic/shared images
    // If same image URL appears on 3+ articles from same source, it's a logo/stock image
    const sourceImageCounts: Record<string, Record<string, number>> = {}

    // Process in batches of 5 to avoid hammering servers
    const BATCH = 5
    for (let i = 0; i < articles.length; i += BATCH) {
      const batch = articles.slice(i, i + BATCH)
      await Promise.all(batch.map(async (article) => {
        try {
          let thumbnailUrl = await scrapeOgImage(article.source_url)

          if (thumbnailUrl) {
            // Track how many times this image appears for this source
            const src = article.source_name || 'unknown'
            if (!sourceImageCounts[src]) sourceImageCounts[src] = {}
            sourceImageCounts[src][thumbnailUrl] = (sourceImageCounts[src][thumbnailUrl] || 0) + 1

            // If same image appears 3+ times for same source, it's generic — reject it
            if (sourceImageCounts[src][thumbnailUrl] >= 3) {
              thumbnailUrl = null
            }
          }

          if (!thumbnailUrl) {
            thumbnailUrl = getRandomFallback(article.category_slug)
          }

          if (thumbnailUrl && thumbnailUrl !== article.thumbnail_url) {
            const { error: updateErr } = await supabaseAdmin
              .from('articles')
              .update({ thumbnail_url: thumbnailUrl })
              .eq('id', article.id)
            if (updateErr) {
              results.errors++
            } else {
              results.updated++
            }
          } else {
            results.skipped++
          }
        } catch {
          results.errors++
        }
      }))
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.updated} of ${results.checked} articles with images`,
      ...results,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err), ...results }, { status: 500 })
  }
}
