export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

const BASE = 'https://www.aiforesights.com'
const BRANDED_THUMBNAIL_POOLS: Record<string, string[]> = {
  'latest-news':   [`${BASE}/thumbnails/latest-news-1.png`,   `${BASE}/thumbnails/latest-news-2.png`,   `${BASE}/thumbnails/latest-news-3.png`],
  'future-of-ai':  [`${BASE}/thumbnails/future-of-ai-1.png`,  `${BASE}/thumbnails/future-of-ai-2.png`,  `${BASE}/thumbnails/future-of-ai-3.png`],
  'best-ai-tools': [`${BASE}/thumbnails/best-ai-tools-1.png`, `${BASE}/thumbnails/best-ai-tools-2.png`, `${BASE}/thumbnails/best-ai-tools-3.png`],
  'make-money':    [`${BASE}/thumbnails/make-money-1.png`,     `${BASE}/thumbnails/make-money-2.png`,     `${BASE}/thumbnails/make-money-3.png`],
  'learn-ai':      [`${BASE}/thumbnails/learn-ai-1.png`,       `${BASE}/thumbnails/learn-ai-2.png`,       `${BASE}/thumbnails/learn-ai-3.png`],
}

function getRandomThumbnail(category: string): string {
  const pool = BRANDED_THUMBNAIL_POOLS[category] ?? BRANDED_THUMBNAIL_POOLS['latest-news']
  return pool[Math.floor(Math.random() * pool.length)]
}

function injectToolLinks(
  content: string,
  tools: Array<{ name: string; website_url: string; affiliate_url?: string | null }>
): string {
  let result = content
  for (const tool of tools) {
    const href = tool.affiliate_url || tool.website_url
    if (!href) continue
    const escaped = tool.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Replace all occurrences, skip if already inside a markdown link
    const regex = new RegExp(`(?<!\\[)(?<!href=")\\b(${escaped})\\b(?![^[]*\\]\\()`, 'gi')
    result = result.replace(regex, `[$1](${href})`)
  }
  return result
}

export async function POST(req: NextRequest) {
  // Allow both admin cookie (browser) and Bearer token (cron)
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_TOKEN
  const adminCookie = req.cookies.get('admin_token')?.value
  const validCron = authHeader === `Bearer ${cronSecret}`
  const validAdmin = adminCookie === process.env.ADMIN_TOKEN
  if (!validCron && !validAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const topicOverride: string | null = body.topic || null
    const markFeatured: boolean = body.featured === true
    const excludeTitles: string[] = body.excludeTitles || []
    const forceCategory: string | null = body.forceCategory || null

    // 0. Daily cap — max 3 AI Foresights articles per UTC day
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const { data: todaysArticles } = await supabaseAdmin
      .from('articles')
      .select('title, category_slug')
      .eq('source_name', 'AI Foresights')
      .gte('published_at', todayStart.toISOString())

    if ((todaysArticles?.length ?? 0) >= 3) {
      return NextResponse.json({ error: 'Daily limit reached: 3 AI Foresights articles already published today.' }, { status: 429 })
    }

    // Merge caller excludes + all of today's existing titles so Claude never repeats a topic
    const allExcludes = [
      ...excludeTitles,
      ...(todaysArticles?.map((a: { title: string }) => a.title).filter(Boolean) ?? [])
    ]

    // 1. Pull last 48h RSS articles
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
      return NextResponse.json({ error: 'No recent articles found. Run the RSS fetch first.' }, { status: 400 })
    }

    // 2. Pull tools for linking
    const { data: toolsData } = await supabaseAdmin
      .from('tools')
      .select('name, website_url, affiliate_url')
      .eq('status', 'published')
      .order('name')
      .limit(200)
    const tools = toolsData || []
    const toolNames = tools.map((t: { name: string }) => t.name).join(', ')

    // 3. Build digest
    const digest = recentArticles
      .filter(a => !allExcludes.some(t => 
        a.title?.toLowerCase().includes(t.toLowerCase().slice(0, 40))
      ))
      .map((a, i) => `${i + 1}. [${a.category_slug}] ${a.title}\n   ${a.excerpt || a.summary || ''}`)
      .join('\n\n')

    // 4. Prompt Claude Sonnet
    const systemPrompt = `You are a staff writer for AIForesights.com, an AI news site for non-technical professionals aged 35-65 — retirees, small business owners, and everyday people trying to understand AI without a technical background.

Your job is to synthesize recent AI news into a single, original, readable article. Write like a trusted friend who happens to follow AI closely, not like a tech journalist or academic.

Rules:
- NO jargon. If you must use a technical term, explain it in plain English immediately.
- NO bullet-point summaries. Write in full paragraphs.
- Every article needs a real thesis — a point of view, not just a recap.
- Include at least one concrete, relatable example (a small business owner, a retiree, a nurse, a teacher).
- Tone: warm, clear, slightly optimistic but honest. Never hype.
- Length: 650-800 words.
- When any of these AI tools are naturally relevant to mention, use their exact name: ${toolNames}
- Format your response as JSON with these exact keys: title, category, content
  - title: compelling headline (under 80 chars)
  - category: one of [latest-news, future-of-ai, best-ai-tools, make-money, learn-ai]
  - content: the full article text using ## for subheadings and **bold** for emphasis. IMPORTANT: never combine bold and links — do not write **[text](url)**, only write [text](url) for links

Return ONLY the JSON object. No preamble, no code fences.`

    const userPrompt = topicOverride
      ? `Write an original 650-800 word article about this topic for AIForesights.com readers:\n\n"${topicOverride}"\n\nMake it practical and relatable for non-technical professionals.`
      : `Here are the last 48 hours of AI news headlines. ${forceCategory ? `You MUST write an article in the "${forceCategory}" category — pick the most relevant story for that category.` : 'Pick the most significant trend or story.'} ${allExcludes.length > 0 ? 'Do NOT write about any of these topics (already covered today): ' + allExcludes.join('; ') + '. Pick something completely different.' : ''} Write an original 650-800 word article explaining what it means for everyday people.\n\nRecent headlines:\n${digest}`

    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1400,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const rawText = completion.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    // 5. Parse
    let parsed: { title: string; category: string; content: string }
    try {
      const clean = rawText.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Claude returned malformed JSON', raw: rawText }, { status: 500 })
    }

    const { title, category: rawCategory, content: rawContent } = parsed
    if (!title || !rawContent) {
      return NextResponse.json({ error: 'Missing title or content', raw: rawText }, { status: 500 })
    }

    const finalCategory = forceCategory && ['latest-news', 'future-of-ai', 'best-ai-tools', 'make-money', 'learn-ai'].includes(forceCategory)
      ? forceCategory
      : ['latest-news', 'future-of-ai', 'best-ai-tools', 'make-money', 'learn-ai'].includes(rawCategory)
        ? rawCategory
        : guessCategory(title, rawContent)

    // 6. Inject tool links
    const content = injectToolLinks(rawContent, tools)

    const slug = toSlug(title)
    const excerpt = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .slice(0, 280) + '...'
    const thumbnail = getRandomThumbnail(finalCategory)

    // 7. Insert
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('articles')
      .insert({
        title: title.slice(0, 500),
        slug,
        excerpt,
        summary: excerpt,
        content,
        thumbnail_url: thumbnail,
        source_url: `https://www.aiforesights.com/article/${slug}`,
        source_id: null,
        source_name: 'AI Foresights',
        category_slug: finalCategory,
        author: 'AI Foresights Staff',
        published_at: new Date().toISOString(),
        status: 'published',
        is_featured: markFeatured,
        vote_count: 0,
        tags: JSON.stringify([finalCategory]),
      })
      .select('slug, title, category_slug, is_featured')
      .single()

    if (insertErr) {
      return NextResponse.json({ error: `DB insert failed: ${insertErr.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      article: inserted,
      url: `/article/${inserted.slug}`,
      articlesAnalyzed: recentArticles.length,
      toolsLinked: tools.filter((t: { name: string; website_url: string; affiliate_url?: string | null }) => {
        const href = t.affiliate_url || t.website_url
        return href && content.includes(`](${href})`)
      }).length,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
