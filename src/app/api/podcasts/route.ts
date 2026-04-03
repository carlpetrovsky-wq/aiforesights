export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') || 'active'

  if (mode === 'active') {
    const { data, error } = await supabaseAdmin
      .from('podcast_roundups')
      .select('*')
      .eq('is_active', true)
      .order('week_of', { ascending: false })
      .limit(1)
      .single()
    if (error || !data) return NextResponse.json(null)
    return NextResponse.json(data)
  }

  if (mode === 'recent') {
    const { data, error } = await supabaseAdmin
      .from('podcast_roundups')
      .select('id, title, week_of, is_active, episodes, newsletter_included')
      .order('week_of', { ascending: false })
      .limit(8)
    if (error) return NextResponse.json([])
    return NextResponse.json(data || [])
  }

  // all — for admin
  const { data, error } = await supabaseAdmin
    .from('podcast_roundups')
    .select('*')
    .order('week_of', { ascending: false })
    .limit(50)
  if (error) return NextResponse.json([])
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { title, week_of, episodes, is_active } = body
  if (!title || !episodes) {
    return NextResponse.json({ error: 'title and episodes required' }, { status: 400 })
  }
  if (is_active) {
    await supabaseAdmin.from('podcast_roundups').update({ is_active: false }).eq('is_active', true)
  }
  const { data, error } = await supabaseAdmin
    .from('podcast_roundups')
    .insert({ title, week_of: week_of || new Date().toISOString().slice(0, 10), episodes, is_active: is_active || false, newsletter_included: false })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, roundup: data })
}

export async function PATCH(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { id, is_active, newsletter_included, title, episodes } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  if (is_active) {
    await supabaseAdmin.from('podcast_roundups').update({ is_active: false }).eq('is_active', true)
  }
  const updates: Record<string, unknown> = {}
  if (is_active !== undefined) updates.is_active = is_active
  if (newsletter_included !== undefined) updates.newsletter_included = newsletter_included
  if (title !== undefined) updates.title = title
  if (episodes !== undefined) updates.episodes = episodes
  const { data, error } = await supabaseAdmin
    .from('podcast_roundups').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, roundup: data })
}

export async function DELETE(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { error } = await supabaseAdmin.from('podcast_roundups').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
