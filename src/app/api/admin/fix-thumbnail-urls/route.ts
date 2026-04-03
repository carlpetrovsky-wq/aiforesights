export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BASE = 'https://www.aiforesights.com'
const ICON = `${BASE}/logo-icon.png`

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  const token = req.nextUrl.searchParams.get('token')
  if (adminCookie !== process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Fix all articles with relative OR branded category thumbnails → use icon
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, thumbnail_url')
    .eq('source_name', 'AI Foresights')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let updated = 0
  for (const article of articles ?? []) {
    const url = article.thumbnail_url ?? ''
    const needsFix = !url.startsWith('http') || url.includes('/thumbnails/')
    if (needsFix) {
      const { error: updateError } = await supabaseAdmin
        .from('articles')
        .update({ thumbnail_url: ICON })
        .eq('id', article.id)
      if (!updateError) updated++
    }
  }

  // 2. Fix tools with missing or broken logo URLs
  const toolFixes = [
    { name: 'Midjourney', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png' },
  ]
  let toolsFixed = 0
  for (const fix of toolFixes) {
    const { error: toolError } = await supabaseAdmin
      .from('tools')
      .update({ logo_url: fix.logo_url })
      .eq('name', fix.name)
      .or('logo_url.is.null,logo_url.eq.')
    if (!toolError) toolsFixed++
  }

  return NextResponse.json({ success: true, articlesUpdated: updated, toolsFixed })
}
