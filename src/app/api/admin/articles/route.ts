export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/admin/articles — list all articles (no RLS filter)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const limit = Number(searchParams.get('limit') ?? 100)
  const offset = Number(searchParams.get('offset') ?? 0)

  const sortBy = searchParams.get('sortBy') ?? 'published_at'
  const sortDir = searchParams.get('sortDir') ?? 'desc'
  const validSortKeys = ['published_at', 'created_at', 'title', 'source_name', 'category_slug', 'status', 'vote_count']
  const safeSort = validSortKeys.includes(sortBy) ? sortBy : 'published_at'

  let query = supabaseAdmin
    .from('articles')
    .select('*', { count: 'exact' })
    .order(safeSort, { ascending: sortDir === 'asc' })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') query = query.eq('status', status)
  if (search) {
    // Search across title, category, and source name
    query = query.or(
      `title.ilike.%${search}%,category_slug.ilike.%${search}%,source_name.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ articles: data ?? [], total: count ?? 0, offset, limit })
}

// POST /api/admin/articles — create new article
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Generate slug from title
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36)

    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert({
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content || null,
        summary: body.summary || null,
        thumbnail_url: body.thumbnail_url || null,
        source_url: body.source_url || '',
        source_id: body.source_id || null,
        source_name: body.source_name || null,
        source_color: body.source_color || null,
        category_id: body.category_id || null,
        category_slug: body.category_slug || null,
        author: body.author || null,
        published_at: body.published_at || new Date().toISOString(),
        status: body.status || 'draft',
        is_featured: body.is_featured || false,
        tags: body.tags || [],
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

// Category fallback images (high-quality Unsplash photos, royalty-free)
const CATEGORY_FALLBACKS: Record<string, string> = {
  'latest-news':   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  'future-of-ai':  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  'best-ai-tools': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  'make-money':    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
  'learn-ai':      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
}

async function scrapeOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AIForesights Bot/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const og = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
    return og ? og[1] : null
  } catch {
    return null
  }
}

// PUT /api/admin/articles — update article
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    let thumbnailUrl = body.thumbnail_url

    // If being featured and has no image, try to scrape one then fall back to category image
    if (body.is_featured && !thumbnailUrl && body.source_url) {
      thumbnailUrl = await scrapeOgImage(body.source_url)
        || CATEGORY_FALLBACKS[body.category_slug] 
        || CATEGORY_FALLBACKS['latest-news']
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        summary: body.summary,
        thumbnail_url: thumbnailUrl,
        source_url: body.source_url,
        source_name: body.source_name,
        category_slug: body.category_slug,
        author: body.author,
        published_at: body.published_at,
        status: body.status,
        is_featured: body.is_featured,
        tags: body.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

// PATCH /api/admin/articles — partial update (e.g. toggle is_featured)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Only allow safe partial fields
    const allowed = ['is_featured', 'status', 'newsletter_featured']
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update(updates)
      .eq('id', body.id)
      .select('id, title, is_featured, status')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

// DELETE /api/admin/articles — delete article
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
