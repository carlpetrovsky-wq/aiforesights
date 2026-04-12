export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== 'Bearer aiforesights-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Force a fresh connection by doing a settings read first
  await supabaseAdmin.from('settings').select('key').limit(1)

  // Query WITHOUT the status filter to test if that's the cache key
  const { data: tools, error } = await supabaseAdmin
    .from('tools')
    .select('id, name, website_url, status')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Find ChatGPT specifically
  const chatgpt = tools?.find(t => t.name === 'ChatGPT')
  
  // Count by status
  const statuses: Record<string, number> = {}
  tools?.forEach(t => {
    statuses[t.status] = (statuses[t.status] || 0) + 1
  })
  
  return NextResponse.json({
    total: tools?.length,
    statuses,
    chatgpt,
    sample: tools?.slice(0, 5)
  })
}
