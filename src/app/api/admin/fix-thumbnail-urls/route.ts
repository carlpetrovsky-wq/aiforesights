export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BASE = 'https://www.aiforesights.com'

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  const token = req.nextUrl.searchParams.get('token')
  if (adminCookie !== process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all articles with relative thumbnail URLs
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, thumbnail_url')
    .like('thumbnail_url', '/%')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!articles || articles.length === 0) {
    return NextResponse.json({ success: true, updated: 0, message: 'No relative URLs found' })
  }

  // Update each to absolute
  let updated = 0
  for (const article of articles) {
    const absoluteUrl = `${BASE}${article.thumbnail_url}`
    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update({ thumbnail_url: absoluteUrl })
      .eq('id', article.id)
    if (!updateError) updated++
  }

  return NextResponse.json({ success: true, updated, total: articles.length })
}
