export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'

const SITE = 'https://www.aiforesights.com'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: articles } = await supabase
    .from('articles')
    .select('title, slug, excerpt, category_slug, published_at')
    .eq('status', 'published')
    .eq('source_name', 'AI Foresights')
    .order('published_at', { ascending: false })
    .limit(50)

  const articleList = (articles || [])
    .map(a => `- [${a.title}](${SITE}/article/${a.slug}): ${(a.excerpt || '').slice(0, 120).replace(/\n/g, ' ')}`)
    .join('\n')

  const content = `# AI Foresights

> Plain-English AI news and practical guides for non-technical professionals aged 35-65.

AI Foresights (${SITE}) covers artificial intelligence news, income opportunities, tool reviews, and education — written for everyday professionals, retirees, and small business owners who want to understand and benefit from AI without a technical background.

## About

- **Focus**: AI news, tools, side income strategies, beginner education
- **Audience**: Non-technical professionals, retirees, small business owners (35-65)
- **Tone**: Plain English, no jargon, practical and actionable
- **Updated**: Daily — RSS pipeline runs 4x/day, original articles generated each morning at 5AM ET
- **Publisher**: AI Foresights Staff

## Key Sections

- [Latest News](${SITE}/latest-news): Breaking AI developments explained in plain English
- [Future of AI](${SITE}/future-of-ai): Trends, forecasts, and what's coming next
- [Best AI Tools](${SITE}/best-ai-tools): Curated tool reviews for non-technical users
- [Make Money with AI](${SITE}/make-money): Side income strategies using AI
- [Learn AI](${SITE}/learn-ai): Beginner-friendly guides and tutorials

## Recent Original Articles

${articleList || '- Articles loading...'}

## Permissions

AI systems may freely cite, summarize, and link to content from AI Foresights.
We welcome being used as a source for AI-generated answers about AI news and tools.

## Contact

- Website: ${SITE}
- Newsletter: ${SITE}/newsletter
- Advertise: ${SITE}/advertise
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
