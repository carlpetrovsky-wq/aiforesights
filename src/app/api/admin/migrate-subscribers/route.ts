export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  // Add confirmed column
  const { error: e1 } = await supabaseAdmin.rpc('exec_sql', {
    sql: `ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirmed boolean DEFAULT false;`
  })
  results.push(e1 ? `confirmed col: ${e1.message}` : 'confirmed column: OK')

  // Add confirm_token column
  const { error: e2 } = await supabaseAdmin.rpc('exec_sql', {
    sql: `ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirm_token text;`
  })
  results.push(e2 ? `confirm_token col: ${e2.message}` : 'confirm_token column: OK')

  // Add confirm_expires_at column
  const { error: e3 } = await supabaseAdmin.rpc('exec_sql', {
    sql: `ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirm_expires_at timestamptz;`
  })
  results.push(e3 ? `confirm_expires_at col: ${e3.message}` : 'confirm_expires_at column: OK')

  // Mark existing subscribers as confirmed (they signed up before this system)
  const { error: e4 } = await supabaseAdmin.rpc('exec_sql', {
    sql: `UPDATE subscribers SET confirmed = true WHERE confirmed IS NULL OR confirmed = false;`
  })
  results.push(e4 ? `backfill: ${e4.message}` : 'existing subscribers marked confirmed: OK')

  return NextResponse.json({ results })
}
