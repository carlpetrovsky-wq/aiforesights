export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const format = searchParams.get('format') // 'csv' for export

  let query = supabaseAdmin
    .from('subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // CSV export
  if (format === 'csv') {
    const rows = (data ?? []).map(s =>
      `"${s.email}","${s.name || ''}","${s.source || ''}","${s.is_active}","${s.subscribed_at}"`
    )
    const csv = ['email,name,source,is_active,subscribed_at', ...rows].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  return NextResponse.json(data ?? [])
}
