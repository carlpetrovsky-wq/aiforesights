export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any) {
  return {
    id:           row.id,
    title:        row.title,
    slug:         row.slug,
    summary:      row.summary ?? '',
    content:      row.content ?? '',
    publishedAt:  row.published_at,
    categorySlug: row.category_slug ?? '',
    category:     row.category_slug ?? '',
    sourceName:   row.source_name ?? '',
    sourceUrl:    row.source_url ?? '',
    thumbnailUrl: row.thumbnail_url ?? null,
    thumbnailBg:  row.thumbnail_bg ?? '#0EA5E9',
    isFeatured:   row.is_featured ?? false,
    excerpt:      row.summary ?? '',
    sourceColor:  row.source_color ?? null,
    voteCount:    row.vote_count ?? 0,
    tags:         Array.isArray(row.tags) ? row.tags : [],
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit    = Number(searchParams.get('limit') ?? 12)
  const sortBy   = (searchParams.get('sortBy') ?? 'latest') as 'latest' | 'popular'
  const category = searchParams.get('category') ?? undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined

  // Use supabaseAdmin to bypass PostgREST result cache
  // neq on a non-existent value forces a fresh Postgres query each time
  let query = supabaseAdmin
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .limit(limit)

  if (category) query = query.eq('category_slug', category)
  if (featured !== undefined) query = query.eq('is_featured', featured)
  if (sortBy === 'popular') {
    query = query.order('vote_count', { ascending: false })
  } else {
    query = query.order('published_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) return NextResponse.json([], { headers: NO_CACHE })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles: any[] = (data ?? []).map(mapRow)

  // Hybrid fill: if fetching featured but fewer than limit exist, fill with most recent
  if (featured && articles.length < limit) {
    const existingIds = new Set(articles.map((a) => a.id))
    const needed = limit - articles.length

    const { data: recent } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit + 10)

    const fill = (recent ?? [])
      .map(mapRow)
      .filter((a) => !existingIds.has(a.id))
      .slice(0, needed)

    articles = [...articles, ...fill]
  }

  return NextResponse.json(articles, { headers: NO_CACHE })
}
