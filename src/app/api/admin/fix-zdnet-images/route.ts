export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

const GENERIC_IMAGE_PATTERNS = [
  'zdnet.com',
  'cnet.com',
  'cbsistatic.com',
]

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
    const fallback = getRandomFallback(article.category_slug)
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
