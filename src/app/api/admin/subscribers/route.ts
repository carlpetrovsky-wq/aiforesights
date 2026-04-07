export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { deleteContact } from '@/lib/brevo'

// GET /api/admin/subscribers — list all or export CSV
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const format = searchParams.get('format')

  let query = supabaseAdmin
    .from('subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,city.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (format === 'csv') {
    const header = 'email,first_name,last_name,name,source,city,state,country,ip_address,is_active,subscribed_at'
    const rows = (data ?? []).map((s: any) =>
      [s.email, s.first_name, s.last_name, s.name, s.source, s.city, s.state, s.country, s.ip_address, s.is_active, s.subscribed_at]
        .map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [header, ...rows].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

// PUT /api/admin/subscribers — update subscriber
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .update({
        first_name: body.first_name ?? null,
        last_name: body.last_name ?? null,
        name: body.name ?? null,
        city: body.city ?? null,
        state: body.state ?? null,
        country: body.country ?? null,
        ip_address: body.ip_address ?? null,
        notes: body.notes ?? null,
        is_active: body.is_active,
        source: body.source ?? null,
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

// DELETE /api/admin/subscribers — delete subscriber from Supabase + Brevo
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Get email before deleting so we can remove from Brevo too
  const { data: subscriber } = await supabaseAdmin
    .from('subscribers')
    .select('email')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabaseAdmin.from('subscribers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also delete from Brevo
  if (subscriber?.email) {
    await deleteContact(subscriber.email)
  }

  return NextResponse.json({ success: true })
}
