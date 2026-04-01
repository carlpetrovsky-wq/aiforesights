export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 second timeout for Vercel

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Anthropic from '@anthropic-ai/sdk'

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
    return ''
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
          const [summary, thumbnailUrl] = await Promise.all([
            summarizeArticle(item.title, item.description, source.name),
            scrapeOgImage(item.link),
          ])

          // Parse pub date safely
          let publishedAt: string
          try {
            publishedAt = new Date(item.pubDate).toISOString()
          } catch {
            publishedAt = new Date().toISOString()
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
              thumbnail_url: thumbnailUrl,
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
