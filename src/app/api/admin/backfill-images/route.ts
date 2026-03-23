export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const CATEGORY_FALLBACKS: Record<string, string> = {
  'latest-news':   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  'future-of-ai':  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  'best-ai-tools': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  'make-money':    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
  'learn-ai':      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
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
    // Fetch articles with NULL or empty thumbnail_url — featured first
    const { data: nullArticles, error: e1 } = await supabaseAdmin
      .from('articles')
      .select('id, source_url, title, is_featured, category_slug, thumbnail_url')
      .is('thumbnail_url', null)
      .not('source_url', 'is', null)
      .order('is_featured', { ascending: false })

    const { data: emptyArticles, error: e2 } = await supabaseAdmin
      .from('articles')
      .select('id, source_url, title, is_featured, category_slug, thumbnail_url')
      .eq('thumbnail_url', '')
      .not('source_url', 'is', null)
      .order('is_featured', { ascending: false })

    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

    // Also force-refresh featured articles that may have bad/blocked image URLs
    const { data: featuredArticles } = await supabaseAdmin
      .from('articles')
      .select('id, source_url, title, is_featured, category_slug, thumbnail_url')
      .eq('is_featured', true)

    // Deduplicate — combine all candidates
    const seen = new Set<string>()
    const articles = [
      ...(nullArticles ?? []),
      ...(emptyArticles ?? []),
      ...(featuredArticles ?? []),
    ].filter(a => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })

    if (!articles.length) return NextResponse.json({ message: 'No articles need backfilling', ...results })

    results.checked = articles.length

    // Process in batches of 5 to avoid hammering servers
    const BATCH = 5
    for (let i = 0; i < articles.length; i += BATCH) {
      const batch = articles.slice(i, i + BATCH)
      await Promise.all(batch.map(async (article) => {
        try {
          let thumbnailUrl = await scrapeOgImage(article.source_url)

          // For featured articles: if scraping failed OR they already have a
          // thumbnail (which might be broken/blocked), ensure they get at minimum
          // a solid category fallback stored in the DB
          if (!thumbnailUrl) {
            if (article.is_featured || !article.thumbnail_url) {
              thumbnailUrl = CATEGORY_FALLBACKS[article.category_slug] || CATEGORY_FALLBACKS['latest-news']
            }
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
