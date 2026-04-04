export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await req.json()
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    // Fetch the article
    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .select('title, slug, excerpt, content, category_slug, source_name')
      .eq('slug', slug)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const articleUrl = `https://www.aiforesights.com/article/${article.slug}`
    const isOwnContent = article.source_name === 'AI Foresights'

    // Build a content summary for Claude (trim to keep tokens low)
    const contentPreview = article.content
      ? article.content
          .replace(/#{1,6}\s/g, '')
          .replace(/\*\*/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .slice(0, 1200)
      : article.excerpt || ''

    const completion = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `You are a social media writer for AI Foresights, an AI news site that explains AI in plain English for non-technical professionals aged 35-65.

Write X (Twitter) posts that are:
- Conversational and approachable, not corporate
- Under 250 characters (leave room for the URL which will be appended separately)
- Written to make someone stop scrolling and click
- Never use hashtags — they look spammy
- Never use emojis
- Use a hook that creates curiosity or states a surprising fact
- Write as if talking to a friend, not marketing at them

Return ONLY a JSON array of exactly 3 post options. Each should take a different angle:
1. A curiosity hook / question
2. A surprising fact or stat from the article
3. A practical "here's what this means for you" angle

Format: ["post 1 text", "post 2 text", "post 3 text"]
No preamble, no code fences, just the JSON array.`,
      messages: [{
        role: 'user',
        content: `Write 3 X post options for this article:

Title: ${article.title}
Category: ${article.category_slug}
${isOwnContent ? 'This is our original content.' : `Source: ${article.source_name}`}

Content preview:
${contentPreview}`
      }],
    })

    const rawText = completion.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    let posts: string[]
    try {
      const clean = rawText.replace(/```json|```/g, '').trim()
      posts = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Failed to parse posts', raw: rawText }, { status: 500 })
    }

    // Append the article URL to each post
    const postsWithUrl = posts.map(p => `${p}\n\n${articleUrl}`)

    return NextResponse.json({
      success: true,
      posts: postsWithUrl,
      articleTitle: article.title,
      articleUrl,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
