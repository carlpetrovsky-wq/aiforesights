export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Helpers (shared with rss/fetch) ────────────────────────────────────────────
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    + '-' + Date.now().toString(36)
}

function guessCategory(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase()
  if (text.match(/earn|income|money|salary|revenue|profit|freelan|side hustle/)) return 'make-money'
  if (text.match(/course|learn|tutorial|beginner|guide|how.?to|training|education/)) return 'learn-ai'
  if (text.match(/tool|app|platform|software|product|launch|release|feature/)) return 'best-ai-tools'
  if (text.match(/future|predict|trend|forecast|research|study|report|survey/)) return 'future-of-ai'
  return 'latest-news'
}

const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  'latest-news': [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
    'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
  ],
  'future-of-ai': [
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
  ],
  'best-ai-tools': [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  ],
  'make-money': [
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  ],
  'learn-ai': [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b6fa?w=800&q=80',
  ],
}

function getRandomFallback(category: string): string {
  const pool = CATEGORY_IMAGE_POOLS[category] ?? CATEGORY_IMAGE_POOLS['latest-news']
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── Main handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Allow optional topic override from the admin UI
    const body = await req.json().catch(() => ({}))
    const topicOverride: string | null = body.topic || null

    // 1. Pull the last 48 hours of RSS articles from Supabase
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const { data: recentArticles, error: fetchErr } = await supabaseAdmin
      .from('articles')
      .select('title, summary, excerpt, category_slug, source_name')
      .neq('source_name', 'AI Foresights')
      .gte('published_at', cutoff)
      .order('published_at', { ascending: false })
      .limit(40)

    if (fetchErr) throw new Error(`DB fetch failed: ${fetchErr.message}`)
    if (!recentArticles || recentArticles.length === 0) {
      return NextResponse.json({ error: 'No recent articles found to synthesize from. Run the RSS fetch first.' }, { status: 400 })
    }

    // 2. Build article digest for Claude
    const digest = recentArticles
      .map((a, i) => `${i + 1}. [${a.category_slug}] ${a.title}\n   ${a.excerpt || a.summary || ''}`)
      .join('\n\n')

    // 3. Ask Claude Sonnet to pick a theme and write the article
    const systemPrompt = `You are a staff writer for AIForesights.com, an AI news site for non-technical professionals aged 35-65 — retirees, small business owners, and everyday people trying to understand AI without a technical background.

Your job is to synthesize recent AI news into a single, original, readable article. Write like a trusted friend who happens to follow AI closely, not like a tech journalist or academic.

Rules:
- NO jargon. If you must use a technical term, explain it in plain English immediately.
- NO bullet-point summaries. Write in paragraphs.
- Every article needs a real thesis — a point of view, not just a recap.
- Include at least one concrete, relatable example (a small business owner, a retiree, a nurse, a teacher — someone in your audience).
- Tone: warm, clear, slightly optimistic but honest. Never hype.
- Length: 650-800 words.
- Format your response as JSON with these exact keys: title, category, content
  - title: compelling headline (under 80 chars)
  - category: one of [latest-news, future-of-ai, best-ai-tools, make-money, learn-ai]
  - content: the full article text using ## for subheadings and **bold** for emphasis where natural

Return ONLY the JSON object. No preamble, no code fences.`

    const userPrompt = topicOverride
      ? `Write an original 650-800 word article about this topic for AIForesights.com readers:\n\n"${topicOverride}"\n\nBase it on recent AI trends and make it practical and relatable for non-technical professionals.`
      : `Here are the last 48 hours of AI news headlines. Pick the most significant trend or story, and write an original 650-800 word article that explains what it means for everyday people.\n\nRecent headlines:\n${digest}`

    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const rawText = completion.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    // 4. Parse the JSON response
    let parsed: { title: string; category: string; content: string }
    try {
      const clean = rawText.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Claude returned malformed JSON', raw: rawText }, { status: 500 })
    }

    const { title, category: rawCategory, content } = parsed

    if (!title || !content) {
      return NextResponse.json({ error: 'Claude response missing title or content', raw: rawText }, { status: 500 })
    }

    const category = guessCategory(title, content) // double-check with our own guesser
    const finalCategory = ['latest-news', 'future-of-ai', 'best-ai-tools', 'make-money', 'learn-ai'].includes(rawCategory)
      ? rawCategory
      : category

    const slug = toSlug(title)
    const excerpt = content.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').slice(0, 280) + '...'
    const thumbnail = getRandomFallback(finalCategory)

    // 5. Insert into Supabase
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('articles')
      .insert({
        title: title.slice(0, 500),
        slug,
        excerpt,
        summary: excerpt,
        content,
        thumbnail_url: thumbnail,
        source_url: null,
        source_id: null,
        source_name: 'AI Foresights',
        category_slug: finalCategory,
        author: 'AI Foresights Staff',
        published_at: new Date().toISOString(),
        status: 'published',
        is_featured: false,
        vote_count: 0,
        tags: JSON.stringify([]),
      })
      .select('slug, title, category_slug')
      .single()

    if (insertErr) {
      return NextResponse.json({ error: `DB insert failed: ${insertErr.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      article: inserted,
      url: `/article/${inserted.slug}`,
      articlesAnalyzed: recentArticles.length,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
