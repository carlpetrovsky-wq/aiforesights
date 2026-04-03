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
  const offset   = Number(searchParams.get('offset') ?? 0)
  const sortBy   = (searchParams.get('sortBy') ?? 'latest') as 'latest' | 'popular'
  const category = searchParams.get('category') ?? undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined

  // Build query params
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

  let filters = `status=eq.published`
  if (category) filters += `&category_slug=eq.${encodeURIComponent(category)}`
  if (featured !== undefined) filters += `&is_featured=eq.${featured}`
  const order = sortBy === 'popular' ? 'vote_count.desc' : 'published_at.desc'

  // Direct REST fetch with Cache-Control: no-cache to bypass PostgREST result cache
  const pgUrl = `${supabaseUrl}/rest/v1/articles?select=*&${filters}&order=${order}&limit=${limit}&offset=${offset}`
  const pgRes = await fetch(pgUrl, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
    },
    cache: 'no-store',
  })

  if (!pgRes.ok) return NextResponse.json([], { headers: NO_CACHE })
  const data = await pgRes.json()
  const error = null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles: any[] = (data ?? []).map(mapRow)

  return NextResponse.json(articles, { headers: NO_CACHE })
}
