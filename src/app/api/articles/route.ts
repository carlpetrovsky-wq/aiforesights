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
  // For popular sort: get top-rated article slugs from article_ratings first
  if (sortBy === 'popular') {
    // Fetch all rated articles with average rating
    const { data: ratings } = await supabaseAdmin
      .from('article_ratings')
      .select('slug, rating')
      .order('slug')

    if (ratings && ratings.length > 0) {
      // Compute average per slug
      const avgMap: Record<string, { sum: number; count: number }> = {}
      for (const r of ratings) {
        if (!avgMap[r.slug]) avgMap[r.slug] = { sum: 0, count: 0 }
        avgMap[r.slug].sum += r.rating
        avgMap[r.slug].count += 1
      }
      // Sort slugs by average desc, then count desc as tiebreaker
      const sortedSlugs = Object.entries(avgMap)
        .sort((a, b) => {
          const avgA = a[1].sum / a[1].count
          const avgB = b[1].sum / b[1].count
          if (avgB !== avgA) return avgB - avgA
          return b[1].count - a[1].count
        })
        .map(([slug]) => slug)
        .slice(0, 50) // top 50 rated articles

      if (sortedSlugs.length > 0) {
        // Fetch those articles
        const { data: ratedArticles } = await supabaseAdmin
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .in('slug', sortedSlugs)
          .limit(limit)

        if (ratedArticles && ratedArticles.length > 0) {
          // Re-sort to match rating order
          const slugOrder = new Map(sortedSlugs.map((s, i) => [s, i]))
          const sorted = ratedArticles
            .sort((a, b) => (slugOrder.get(a.slug) ?? 999) - (slugOrder.get(b.slug) ?? 999))
            .map(mapRow)
          return NextResponse.json(sorted, { headers: NO_CACHE })
        }
      }
    }

    // Fallback: no ratings yet, return latest AI Foresights articles
    const { data: fallback } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .eq('source_name', 'AI Foresights')
      .order('published_at', { ascending: false })
      .limit(limit)
    return NextResponse.json((fallback || []).map(mapRow), { headers: NO_CACHE })
  }

  const order = 'published_at.desc'

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles: any[] = (data ?? []).map(mapRow)

  return NextResponse.json(articles, { headers: NO_CACHE })
}
