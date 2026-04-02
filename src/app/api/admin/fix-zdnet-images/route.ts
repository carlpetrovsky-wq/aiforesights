export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

const GENERIC_IMAGE_PATTERNS = [
  'zdnet.com',
  'cnet.com',
  'cbsistatic.com',
]

const CATEGORY_FALLBACKS: Record<string, string> = {
  'latest-news':   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  'future-of-ai':  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  'best-ai-tools': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  'make-money':    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
  'learn-ai':      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, thumbnail_url, category_slug')
    .not('thumbnail_url', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const toFix = (articles ?? []).filter(a =>
    a.thumbnail_url && GENERIC_IMAGE_PATTERNS.some(p => a.thumbnail_url.includes(p))
  )

  let updated = 0
  for (const article of toFix) {
    const fallback = CATEGORY_FALLBACKS[article.category_slug] || CATEGORY_FALLBACKS['latest-news']
    const { error: err } = await supabaseAdmin
      .from('articles').update({ thumbnail_url: fallback }).eq('id', article.id)
    if (!err) updated++
  }

  return NextResponse.json({
    message: `Fixed ${updated} of ${toFix.length} articles with generic source images`,
    updated,
    flagged: toFix.length,
    total: articles?.length ?? 0,
  })
}
