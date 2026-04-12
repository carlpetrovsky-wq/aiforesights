export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== 'Bearer aiforesights-cron-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Same exact query as the cron
  const { data: tools, error } = await supabaseAdmin
    .from('tools')
    .select('id, name, website_url')
    .eq('status', 'published')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Find ChatGPT specifically
  const chatgpt = tools?.find(t => t.name === 'ChatGPT')
  
  return NextResponse.json({
    total: tools?.length,
    chatgpt,
    sample: tools?.slice(0, 5)
  })
}
