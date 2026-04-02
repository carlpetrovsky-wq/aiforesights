export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 second timeout for Vercel

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Anthropic from '@anthropic-ai/sdk'

// ── Per-category image pools — rotated randomly so repeated-source articles look different ──
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

// ── OpenGraph image scraper ────────────────────────────────────────────────────
async function scrapeOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AIForesights Bot/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const html = await res.text()
    // Try og:image first, then twitter:image
    const og = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
    return og ? og[1] : null
  } catch {
    return null
  }
}

// ── Minimal RSS parser (no external dep needed — uses built-in fetch) ─────────
async function fetchFeed(feedUrl: string): Promise<RssItem[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'AIForesights RSS Bot/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    return parseRssXml(xml)
  } catch (err) {
    console.error(`Failed to fetch ${feedUrl}:`, err)
    return []
  }
}

interface RssItem {
  title: string
  link: string
  pubDate: string
  description: string
  author: string
}

function parseRssXml(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemMatches = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) || []

  for (const item of itemMatches.slice(0, 10)) { // max 10 per source
    const get = (tag: string) => {
      const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'))
        || item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
      return m ? m[1].replace(/<[^>]+>/g, '').trim() : ''
    }

    const title = get('title')
    const link = get('link') || item.match(/<link[^>]*href="([^"]+)"/i)?.[1] || ''
    const pubDate = get('pubDate') || get('published') || get('dc:date') || new Date().toISOString()
    const description = get('description') || get('summary') || get('content:encoded') || ''
    const author = get('author') || get('dc:creator') || ''

    if (title && link) {
      items.push({ title, link, pubDate, description, author })
    }
  }
  return items
}

// ── Claude summarizer ──────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function summarizeArticle(title: string, description: string, sourceName: string): Promise<string> {
  try {
    const raw = description.replace(/<[^>]+>/g, '').trim().slice(0, 1500)
    if (!raw && !title) return ''

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // fast + cheap for bulk summarization
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You write for AI Foresights, a site that explains AI news in plain English for everyday professionals (not developers).

Article from ${sourceName}:
Title: ${title}
Content: ${raw}

Write a 2-3 sentence plain-English summary. No jargon, no bullet points. Start directly with the key point. Make it useful for someone who is not technical.`,
      }],
    })
    return (msg.content[0] as { type: string; text: string }).text?.trim() || ''
  } catch (err) {
    console.error('Claude summarization failed:', err)
    // Fall back to cleaned description text so article still gets a summary
    return description.replace(/<[^>]+>/g, '').trim().slice(0, 300)
  }
}

// ── Slug generator ─────────────────────────────────────────────────────────────
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    + '-' + Date.now().toString(36)
}

// ── Category guesser ───────────────────────────────────────────────────────────
function guessCategory(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase()
  if (text.match(/earn|income|money|salary|revenue|profit|freelan|side hustle/)) return 'make-money'
  if (text.match(/course|learn|tutorial|beginner|guide|how.?to|training|education/)) return 'learn-ai'
  if (text.match(/tool|app|platform|software|product|launch|release|feature/)) return 'best-ai-tools'
  if (text.match(/future|predict|trend|forecast|research|study|report|survey/)) return 'future-of-ai'
  return 'latest-news'
}

// ── Main handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_TOKEN
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    sourcesChecked: 0,
    articlesFound: 0,
    articlesInserted: 0,
    articlesSkipped: 0,
    errors: [] as string[],
  }

  // Batch support: split sources into 3 groups to fit within Vercel's 60s limit
  const batchParam = req.nextUrl?.searchParams?.get('batch') || new URL(req.url).searchParams.get('batch') || '0'
  const batchIndex = parseInt(batchParam) - 1 // 0-indexed (-1 means all)
  const BATCH_SIZE = 12

  try {
    // Get all active sources
    const { data: allSources, error: srcErr } = await supabaseAdmin
      .from('sources')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (srcErr) throw new Error(`Failed to fetch sources: ${srcErr.message}`)
    if (!allSources?.length) return NextResponse.json({ message: 'No active sources', ...results })

    // Apply batching if requested
    const sources = batchIndex >= 0
      ? allSources.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE)
      : allSources

    results.sourcesChecked = sources.length

    for (const source of sources) {
      // Track image URLs used by this source in this run to detect generic/shared images
      const seenImages: Record<string, number> = {}
      const feedUrl = source.feed_url || source.url
      if (!feedUrl) continue

      const items = await fetchFeed(feedUrl)
      results.articlesFound += items.length

      for (const item of items) {
        try {
          // Check if already exists by URL
          const { data: existing } = await supabaseAdmin
            .from('articles')
            .select('id')
            .eq('source_url', item.link)
            .maybeSingle()

          if (existing) {
            results.articlesSkipped++
            continue
          }

          // Summarize with Claude and scrape OG image in parallel
          const [summary, rawThumbnailUrl] = await Promise.all([
            summarizeArticle(item.title, item.description, source.name),
            scrapeOgImage(item.link),
          ])

          // Reject generic/shared images (same URL used 3+ times from same source)
          let thumbnailUrl = rawThumbnailUrl
          if (thumbnailUrl) {
            seenImages[thumbnailUrl] = (seenImages[thumbnailUrl] || 0) + 1
            if (seenImages[thumbnailUrl] >= 3) thumbnailUrl = null
          }

          // Parse pub date safely
          let publishedAt: string
          try {
            publishedAt = new Date(item.pubDate).toISOString()
          } catch {
            publishedAt = new Date().toISOString()
          }

          // Skip articles older than 1 year — stale AI news is not useful
          const oneYearAgo = new Date()
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
          if (new Date(publishedAt) < oneYearAgo) {
            results.articlesSkipped++
            continue
          }

          const category = guessCategory(item.title, item.description)
          const slug = toSlug(item.title)

          const { error: insertErr } = await supabaseAdmin
            .from('articles')
            .insert({
              title: item.title.slice(0, 500),
              slug,
              excerpt: item.description.replace(/<[^>]+>/g, '').slice(0, 300) || summary,
              summary,
              thumbnail_url: thumbnailUrl ?? getRandomFallback(category),
              source_url: item.link,
              source_id: source.id,
              source_name: source.name,
              category_slug: category,
              author: item.author || null,
              published_at: publishedAt,
              status: 'published',
              is_featured: false,
              vote_count: 0,
              tags: JSON.stringify([]),
            })

          if (insertErr) {
            // Slug collision — skip gracefully
            if (insertErr.code === '23505') {
              results.articlesSkipped++
            } else {
              results.errors.push(`${source.name}: ${insertErr.message}`)
            }
          } else {
            results.articlesInserted++
          }
        } catch (itemErr) {
          results.errors.push(`Item error: ${String(itemErr)}`)
        }
      }

      // Update last_fetched_at for source
      await supabaseAdmin
        .from('sources')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('id', source.id)
    }

    return NextResponse.json({
      success: true,
      message: `Fetched ${results.articlesInserted} new articles from ${results.sourcesChecked} sources`,
      ...results,
    })
  } catch (err) {
    console.error('RSS pipeline error:', err)
    return NextResponse.json({ error: String(err), ...results }, { status: 500 })
  }
}

// GET — for quick status check
export async function GET() {
  const { count } = await supabaseAdmin
    .from('articles')
    .select('*', { count: 'exact', head: true })
  return NextResponse.json({ articles: count, status: 'RSS pipeline ready' })
}
