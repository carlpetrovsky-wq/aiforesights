export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit    = Number(searchParams.get('limit') ?? 12)
  const sortBy   = (searchParams.get('sortBy') ?? 'latest') as 'latest' | 'popular'
  const category = searchParams.get('category') ?? undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined

  let articles = await getArticles({ limit, sortBy, category, featured })

  // Hybrid: if fetching featured but fewer than limit exist, fill remaining
  // slots with most recent articles (excluding already-included ones)
  if (featured && articles.length < limit) {
    const existingIds = new Set(articles.map((a: any) => a.id))
    const needed = limit - articles.length
    const recent = await getArticles({ limit: limit + 10, sortBy: 'latest', category })
    const fill = recent.filter((a: any) => !existingIds.has(a.id)).slice(0, needed)
    articles = [...articles, ...fill]
  }

  return NextResponse.json(articles, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  })
}
