export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') || 'active' // active | recent | all

  if (mode === 'active') {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return NextResponse.json(null)
    return NextResponse.json(data)
  }

  if (mode === 'recent') {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('id, title, youtube_id, intro, published_at, is_active, tags')
      .order('published_at', { ascending: false })
      .limit(7)

    if (error) return NextResponse.json([])
    return NextResponse.json(data || [])
  }

  // all — for admin
  const { data, error } = await supabaseAdmin
    .from('videos')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json([])
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  // Admin only
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { youtube_id, title, intro, tags, published_at, is_active } = body

  if (!youtube_id || !title || !intro) {
    return NextResponse.json({ error: 'youtube_id, title, and intro are required' }, { status: 400 })
  }

  // If setting as active, deactivate all others first
  if (is_active) {
    await supabaseAdmin.from('videos').update({ is_active: false }).eq('is_active', true)
  }

  const { data, error } = await supabaseAdmin
    .from('videos')
    .insert({
      youtube_id,
      title,
      intro,
      tags: tags || [],
      published_at: published_at || new Date().toISOString(),
      is_active: is_active || false,
      newsletter_included: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, video: data })
}

export async function PATCH(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, is_active, newsletter_included, title, intro, tags } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // If setting as active, deactivate all others first
  if (is_active) {
    await supabaseAdmin.from('videos').update({ is_active: false }).eq('is_active', true)
  }

  const updates: Record<string, unknown> = {}
  if (is_active !== undefined) updates.is_active = is_active
  if (newsletter_included !== undefined) updates.newsletter_included = newsletter_included
  if (title !== undefined) updates.title = title
  if (intro !== undefined) updates.intro = intro
  if (tags !== undefined) updates.tags = tags

  const { data, error } = await supabaseAdmin
    .from('videos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, video: data })
}

export async function DELETE(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('videos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
