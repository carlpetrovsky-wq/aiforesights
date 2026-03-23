export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('*')
    .order('key')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    // Accept either a single setting { key, value } or batch [{ key, value }, ...]
    const items: { key: string; value: string }[] = Array.isArray(body) ? body : [body]

    for (const item of items) {
      if (!item.key) continue
      const { error } = await supabaseAdmin
        .from('settings')
        .upsert({
          key: item.key,
          value: item.value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
