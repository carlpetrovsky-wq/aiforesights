import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit    = Number(searchParams.get('limit') ?? 12)
  const sortBy   = (searchParams.get('sortBy') ?? 'latest') as 'latest' | 'popular'
  const category = searchParams.get('category') ?? undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined

  let articles = await getArticles({ limit, sortBy, category, featured })

  // If no featured articles exist, fall back to the 3 most recent published articles
  if (featured && articles.length === 0) {
    articles = await getArticles({ limit, sortBy: 'latest', category })
  }

  return NextResponse.json(articles)
}
