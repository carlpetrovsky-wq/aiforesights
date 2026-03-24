export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all articles where sourceUrl points back to the site's own category pages
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, slug, source_url')
    .like('source_url', 'https://www.aiforesights.com/%')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let fixed = 0
  const errors: string[] = []

  for (const article of articles || []) {
    // Update sourceUrl to point to the article's own detail page
    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update({ source_url: `https://www.aiforesights.com/article/${article.slug}` })
      .eq('id', article.id)

    if (updateError) {
      errors.push(`${article.slug}: ${updateError.message}`)
    } else {
      fixed++
    }
  }

  return NextResponse.json({
    success: true,
    message: `Fixed ${fixed} article URLs`,
    errors
  })
}
