export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function injectToolLinks(
  content: string,
  tools: Array<{ name: string; website_url: string; affiliate_url?: string | null }>
): string {
  let result = content
  for (const tool of tools) {
    const href = tool.affiliate_url || tool.website_url
    if (!href) continue
    const escaped = tool.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(?<!\\[)(?<!href=")\\b(${escaped})\\b(?![^[]*\\]\\()`, 'i')
    result = result.replace(regex, `[$1](${href})`)
  }
  return result
}

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  const tokenParam = new URL(req.url).searchParams.get('token')
  const adminToken = process.env.ADMIN_TOKEN
  if (adminCookie !== adminToken && tokenParam !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Fetch tools
  const { data: toolsData } = await supabaseAdmin
    .from('tools')
    .select('name, website_url, affiliate_url')
    .eq('status', 'published')
    .order('name')
    .limit(200)
  const tools = toolsData || []

  // 2. Fetch all AI Foresights articles with content in one shot
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, slug, title, content')
    .eq('source_name', 'AI Foresights')
    .eq('status', 'published')
    .not('content', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!articles?.length) return NextResponse.json({ success: true, total: 0, updated: 0, unchanged: 0 })

  // 3. Process all in memory, build batch updates
  const updates: Array<{ id: string; content: string; slug: string; title: string }> = []
  const unchanged: string[] = []

  for (const article of articles) {
    const original = article.content as string
    if (!original?.trim()) { unchanged.push(article.slug); continue }
    const updated = injectToolLinks(original, tools)
    if (updated !== original) {
      updates.push({ id: article.id, content: updated, slug: article.slug, title: article.title })
    } else {
      unchanged.push(article.slug)
    }
  }

  // 4. Apply updates one at a time but quickly (no Claude calls, just DB writes)
  const results: Array<{ slug: string; title: string; status: string }> = []
  for (const u of updates) {
    const { error: upErr } = await supabaseAdmin
      .from('articles')
      .update({ content: u.content })
      .eq('id', u.id)
    results.push({ slug: u.slug, title: u.title, status: upErr ? `error: ${upErr.message}` : 'updated' })
  }

  return NextResponse.json({
    success: true,
    total: articles.length,
    updated: updates.length,
    unchanged: unchanged.length,
    results,
  })
}
