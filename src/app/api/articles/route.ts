export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getArticles } from '@/lib/supabase'

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit    = Number(searchParams.get('limit') ?? 12)
  const sortBy   = (searchParams.get('sortBy') ?? 'latest') as 'latest' | 'popular'
  const category = searchParams.get('category') ?? undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined

  // Use supabaseAdmin (service role) to bypass PostgREST result cache
  // The anon client caches query results and won't reflect DB changes immediately
  let query = supabaseAdmin
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .limit(limit)

  if (category) query = query.eq('category_slug', category)
  if (featured !== undefined) query = query.eq('is_featured', featured)
  if (sortBy === 'popular') {
    query = query.order('vote_count', { ascending: false })
  } else {
    query = query.order('published_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json([], { headers: NO_CACHE })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles: any[] = (data ?? []).map((row: any) => ({
    id:           row.id,
    title:        row.title,
    slug:         row.slug,
    summary:      row.summary ?? '',
    content:      row.content ?? '',
    publishedAt:  row.published_at,
    categorySlug: row.category_slug ?? '',
    sourceName:   row.source_name ?? '',
    sourceUrl:    row.source_url ?? '',
    thumbnailUrl: row.thumbnail_url ?? null,
    thumbnailBg:  row.thumbnail_bg ?? '#0EA5E9',
    isFeatured:   row.is_featured ?? false,
    tags:         Array.isArray(row.tags) ? row.tags : [],
  }))

  // Hybrid: if fetching featured but fewer than limit exist, fill with most recent
  if (featured && articles.length < limit) {
    const existingIds = new Set(articles.map((a: any) => a.id))
    const needed = limit - articles.length
    const recent = await getArticles({ limit: limit + 10, sortBy: 'latest', category })
    const fill = recent.filter((a: any) => !existingIds.has(a.id)).slice(0, needed)
    articles = [...articles, ...fill]
  }

  return NextResponse.json(articles, { headers: NO_CACHE })
}
