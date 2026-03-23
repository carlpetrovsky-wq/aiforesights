export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('ad_slots')
    .select('*')
    .order('slot_id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('ad_slots')
      .update({
        label: body.label,
        size: body.size,
        position: body.position,
        is_active: body.is_active,
        adsense_unit_id: body.adsense_unit_id,
        custom_html: body.custom_html,
        notes: body.notes,
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
