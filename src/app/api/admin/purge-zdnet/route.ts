export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  const token = req.nextUrl.searchParams.get('token')
  if (adminCookie !== process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Delete all ZDNet articles
  const { count: deleted, error: delError } = await supabaseAdmin
    .from('articles')
    .delete({ count: 'exact' })
    .eq('source_name', 'ZDNet AI')

  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })

  // 2. Disable the ZDNet source so cron stops fetching it
  const { error: srcError } = await supabaseAdmin
    .from('sources')
    .update({ is_active: false })
    .eq('name', 'ZDNet AI')

  if (srcError) return NextResponse.json({ error: srcError.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    articlesDeleted: deleted,
    sourceDisabled: 'ZDNet AI',
  })
}
