export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
    // Fetch all articles missing a thumbnail_url
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select('id, source_url, title')
      .is('thumbnail_url', null)
      .not('source_url', 'is', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!articles?.length) return NextResponse.json({ message: 'No articles need backfilling', ...results })

    results.checked = articles.length

    // Process in batches of 5 to avoid hammering servers
    const BATCH = 5
    for (let i = 0; i < articles.length; i += BATCH) {
      const batch = articles.slice(i, i + BATCH)
      await Promise.all(batch.map(async (article) => {
        try {
          const thumbnailUrl = await scrapeOgImage(article.source_url)
          if (thumbnailUrl) {
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
