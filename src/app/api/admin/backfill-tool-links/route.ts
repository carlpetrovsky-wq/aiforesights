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
    // Only replace first occurrence, skip if already inside a markdown link
    const regex = new RegExp(`(?<!\\[)(?<!href=")\\b(${escaped})\\b(?![^[]*\\]\\()`, 'i')
    result = result.replace(regex, `[$1](${href})`)
  }
  return result
}

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all tools
  const { data: toolsData } = await supabaseAdmin
    .from('tools')
    .select('name, website_url, affiliate_url')
    .eq('status', 'published')
    .order('name')
    .limit(200)
  const tools = toolsData || []

  // Fetch all AI Foresights articles with content
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, slug, title, content, category_slug')
    .eq('source_name', 'AI Foresights')
    .neq('content', '')
    .not('content', 'is', null)

  if (error || !articles?.length) {
    return NextResponse.json({ error: error?.message || 'No articles found' }, { status: 500 })
  }

  const results = []
  for (const article of articles) {
    const originalContent = article.content as string
    const updatedContent = injectToolLinks(originalContent, tools)

    if (updatedContent === originalContent) {
      results.push({ slug: article.slug, title: article.title, changed: false })
      continue
    }

    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update({ content: updatedContent })
      .eq('id', article.id)

    results.push({
      slug: article.slug,
      title: article.title,
      changed: true,
      error: updateError?.message || null,
    })
  }

  const changed = results.filter(r => r.changed).length
  return NextResponse.json({
    success: true,
    total: articles.length,
    updated: changed,
    unchanged: articles.length - changed,
    results,
  })
}
