import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// One-time cleanup: fix all existing AI Foresights articles that have
// broken/over-linked markdown content from the old injectToolLinks behavior.
// POST /api/admin/cleanup-article-links

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all AI Foresights own-content articles
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, slug, title, content')
    .eq('source_name', 'AI Foresights')
    .not('content', 'is', null)

  if (error || !articles) {
    return NextResponse.json({ error: 'Failed to fetch articles', details: error }, { status: 500 })
  }

  // Fetch all tools for re-linking
  const { data: tools } = await supabaseAdmin
    .from('tools')
    .select('name, website_url, affiliate_url')
    .eq('status', 'published')
    .order('name')
    .limit(200)

  const toolList = tools || []
  const results: { slug: string; title: string; status: string }[] = []

  for (const article of articles) {
    if (!article.content) continue

    let content = article.content

    // Step 1: Fix nested broken links like [Grammarly](https://[grammarly](https://grammarly.com).com)
    // These happen when injectToolLinks ran on content that already had AI-generated links
    content = content.replace(/\[([^\]]*)\]\(https?:\/\/\[[^\]]*\]\([^)]*\)[^)]*\)/g, '$1')

    // Step 2: Strip ALL remaining markdown links to get clean plain text
    content = content.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1')

    // Step 3: Re-inject first-occurrence links — skip heading lines so headings don't consume the slot
    const lines = content.split('\n')
    const linkedTools = new Set<string>()

    for (let i = 0; i < lines.length; i++) {
      if (/^#{1,6}\s/.test(lines[i])) continue

      for (const tool of toolList) {
        const toolKey = tool.name.toLowerCase()
        if (linkedTools.has(toolKey)) continue

        const href = tool.affiliate_url || tool.website_url
        if (!href) continue

        const escaped = tool.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(\\*\\*)?\\b(${escaped})\\b(\\*\\*)?`, 'gi')

        if (regex.test(lines[i])) {
          regex.lastIndex = 0
          let matched = false
          lines[i] = lines[i].replace(regex, (full: string, boldOpen: string, name: string, boldClose: string) => {
            if (matched) return full
            matched = true
            linkedTools.add(toolKey)
            if (boldOpen && boldClose) return `**[${name}](${href})**`
            return `[${name}](${href})`
          })
        }
      }
    }

    content = lines.join('\n')

    // Only update if content actually changed
    if (content !== article.content) {
      // Also regenerate clean excerpt
      const excerpt = content
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 280) + '...'

      const { error: updateError } = await supabaseAdmin
        .from('articles')
        .update({ content, excerpt, summary: excerpt })
        .eq('id', article.id)

      results.push({
        slug: article.slug,
        title: article.title,
        status: updateError ? `ERROR: ${updateError.message}` : 'fixed',
      })
    } else {
      results.push({
        slug: article.slug,
        title: article.title,
        status: 'no changes needed',
      })
    }
  }

  return NextResponse.json({
    success: true,
    totalArticles: articles.length,
    fixed: results.filter(r => r.status === 'fixed').length,
    unchanged: results.filter(r => r.status === 'no changes needed').length,
    errors: results.filter(r => r.status.startsWith('ERROR')).length,
    results,
  })
}
