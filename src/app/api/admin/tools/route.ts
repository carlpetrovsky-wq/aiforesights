import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')

  let query = supabaseAdmin
    .from('tools')
    .select('*')
    .order('save_count', { ascending: false })
    .limit(100)

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const { data, error } = await supabaseAdmin
      .from('tools')
      .insert({
        name: body.name,
        slug,
        description: body.description || null,
        long_description: body.long_description || null,
        website_url: body.website_url,
        logo_url: body.logo_url || null,
        thumbnail_url: body.thumbnail_url || null,
        category: body.category || null,
        pricing: body.pricing || 'free',
        tags: body.tags || [],
        experience_level: body.experience_level || 'beginner',
        status: body.status || 'published',
        is_featured: body.is_featured || false,
        affiliate_url: body.affiliate_url || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('tools')
      .update({
        name: body.name,
        description: body.description,
        long_description: body.long_description,
        website_url: body.website_url,
        logo_url: body.logo_url,
        thumbnail_url: body.thumbnail_url,
        category: body.category,
        pricing: body.pricing,
        tags: body.tags,
        experience_level: body.experience_level,
        status: body.status,
        is_featured: body.is_featured,
        affiliate_url: body.affiliate_url,
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

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabaseAdmin.from('tools').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
