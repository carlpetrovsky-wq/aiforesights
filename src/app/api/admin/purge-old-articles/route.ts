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

  // Keep anything within the last 365 days, or featured (regardless of age)
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 1)
  const cutoffISO = cutoff.toISOString()

  // Count first
  const { count } = await supabaseAdmin
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .lt('published_at', cutoffISO)
    .eq('is_featured', false)
    .neq('source_name', 'AI Foresights') // never delete our own content

  // Delete
  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .lt('published_at', cutoffISO)
    .eq('is_featured', false)
    .neq('source_name', 'AI Foresights')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: `Purged ${count} articles older than ${cutoffISO.split('T')[0]} (kept featured + AI Foresights content)`,
    deleted: count,
    cutoffDate: cutoffISO.split('T')[0],
  })
}
