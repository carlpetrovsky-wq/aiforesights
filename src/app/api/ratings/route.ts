export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/ratings?slug=some-slug  — returns avg + count for one article
// GET /api/ratings?slugs=slug1,slug2,...  — returns avg + count for multiple
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const slugs = searchParams.get('slugs')

  if (slugs) {
    const slugList = slugs.split(',').filter(Boolean)
    const { data, error } = await supabaseAdmin
      .from('article_ratings')
      .select('article_slug, rating')
      .in('article_slug', slugList)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Aggregate per slug
    const map: Record<string, { sum: number; count: number }> = {}
    for (const row of data || []) {
      if (!map[row.article_slug]) map[row.article_slug] = { sum: 0, count: 0 }
      map[row.article_slug].sum += row.rating
      map[row.article_slug].count += 1
    }
    const result: Record<string, { average: number; count: number }> = {}
    for (const [s, { sum, count }] of Object.entries(map)) {
      result[s] = { average: Math.round((sum / count) * 10) / 10, count }
    }
    return NextResponse.json(result)
  }

  if (slug) {
    const { data, error } = await supabaseAdmin
      .from('article_ratings')
      .select('rating')
      .eq('article_slug', slug)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const count = data?.length || 0
    const average = count > 0
      ? Math.round((data!.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0
    return NextResponse.json({ average, count })
  }

  return NextResponse.json({ error: 'slug or slugs param required' }, { status: 400 })
}

// POST /api/ratings — submit or update a rating
export async function POST(req: NextRequest) {
  const { slug, sessionId, rating } = await req.json()
  if (!slug || !sessionId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Upsert — one rating per session per article
  const { error } = await supabaseAdmin
    .from('article_ratings')
    .upsert(
      { article_slug: slug, session_id: sessionId, rating },
      { onConflict: 'article_slug,session_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return updated aggregate
  const { data } = await supabaseAdmin
    .from('article_ratings')
    .select('rating')
    .eq('article_slug', slug)

  const count = data?.length || 0
  const average = count > 0
    ? Math.round((data!.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
    : 0

  return NextResponse.json({ success: true, average, count })
}
