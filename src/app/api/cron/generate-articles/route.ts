export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Rotates category daily based on day-of-year
// So each day generates one article in a predictable, varied category
function getTodayCategory(): string {
  const categories = ['latest-news', 'future-of-ai', 'make-money', 'learn-ai', 'best-ai-tools']
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return categories[dayOfYear % categories.length]
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aiforesights.com'
  const forceCategory = getTodayCategory()

  // Get today's existing AI Foresights articles to avoid duplicates
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: todaysArticles } = await supabaseAdmin
    .from('articles')
    .select('title')
    .eq('source_name', 'AI Foresights')
    .gte('published_at', today.toISOString())

  const excludeTitles = todaysArticles?.map(a => a.title).filter(Boolean) || []

  const res = await fetch(`${base}/api/admin/generate-article`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cronSecret}`,
    },
    body: JSON.stringify({
      featured: true,
      forceCategory,
      excludeTitles,
    }),
  })

  const data = await res.json()

  // On Mondays, also generate the weekly podcast roundup draft
  const dayOfWeek = new Date().getUTCDay() // 0=Sun, 1=Mon
  let podcastResult = null
  if (dayOfWeek === 1) {
    try {
      const podRes = await fetch(`${base}/api/admin/generate-podcast-roundup`, {
        headers: { 'Authorization': `Bearer ${cronSecret}` },
      })
      podcastResult = await podRes.json()
    } catch (err) {
      console.error('Podcast roundup generation failed:', err)
    }
  }

  return NextResponse.json({
    success: res.ok,
    timestamp: new Date().toISOString(),
    category: forceCategory,
    article: data.article || null,
    error: data.error || null,
    podcast_roundup: podcastResult,
  })
}
