export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/admin/articles — list all articles (no RLS filter)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const limit = Number(searchParams.get('limit') ?? 50)

  let query = supabaseAdmin
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status && status !== 'all') query = query.eq('status', status)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
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

// PUT /api/admin/articles — update article
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        summary: body.summary,
        thumbnail_url: body.thumbnail_url,
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

// DELETE /api/admin/articles — delete article
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
