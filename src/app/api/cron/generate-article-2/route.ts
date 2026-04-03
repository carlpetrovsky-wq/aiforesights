export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aiforesights.com'

  // Find the most recent AI Foresights article (written by article-1 cron ~5 min ago)
  // to avoid duplicating its category and topic
  const { data: recent } = await supabaseAdmin
    .from('articles')
    .select('title, category_slug')
    .eq('source_name', 'AI Foresights')
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  const cat1 = recent?.category_slug || ''
  const title1 = recent?.title || ''

  const categoryMap: Record<string, string> = {
    'latest-news':   'future-of-ai',
    'future-of-ai':  'make-money',
    'make-money':    'learn-ai',
    'learn-ai':      'best-ai-tools',
    'best-ai-tools': 'latest-news',
  }
  const forceCategory = categoryMap[cat1] || 'make-money'

  const res = await fetch(`${base}/api/admin/generate-article`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cronSecret}`,
    },
    body: JSON.stringify({
      featured: true,
      forceCategory,
      excludeTitles: title1 ? [title1] : [],
    }),
  })

  const data = await res.json()

  return NextResponse.json({
    success: res.ok,
    timestamp: new Date().toISOString(),
    article: data.article || null,
    forcedCategory: forceCategory,
    error: data.error || null,
  })
}
