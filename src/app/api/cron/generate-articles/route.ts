export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'

// Vercel calls this via GET on the cron schedule (0 10 * * * = 5AM ET)
// Auth: Vercel sends CRON_SECRET as Authorization header automatically
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aiforesights.com'
  const results: { article1?: object; article2?: object; errors: string[] } = { errors: [] }

  // ── Article 1: auto-pick best story, mark featured ──────────────────────────
  try {
    const res1 = await fetch(`${base}/api/admin/generate-article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({ featured: true }),
    })
    const data1 = await res1.json()
    if (!res1.ok) {
      results.errors.push(`Article 1 failed: ${data1.error || res1.status}`)
    } else {
      results.article1 = data1.article
    }
  } catch (err) {
    results.errors.push(`Article 1 exception: ${String(err)}`)
  }

  // Wait 8 seconds between generations
  await new Promise(r => setTimeout(r, 8000))

  // ── Article 2: force different category ─────────────────────────────────────
  const cat1 = (results.article1 as { category_slug?: string })?.category_slug || ''
  const categoryMap: Record<string, string> = {
    'latest-news':   'future-of-ai',
    'future-of-ai':  'make-money',
    'make-money':    'learn-ai',
    'learn-ai':      'best-ai-tools',
    'best-ai-tools': 'latest-news',
  }
  const forceCategory = categoryMap[cat1] || 'make-money'
  const title1 = (results.article1 as { title?: string })?.title || ''

  try {
    const res2 = await fetch(`${base}/api/admin/generate-article`, {
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
    const data2 = await res2.json()
    if (!res2.ok) {
      results.errors.push(`Article 2 failed: ${data2.error || res2.status}`)
    } else {
      results.article2 = data2.article
    }
  } catch (err) {
    results.errors.push(`Article 2 exception: ${String(err)}`)
  }

  return NextResponse.json({
    success: results.errors.length === 0,
    timestamp: new Date().toISOString(),
    ...results,
  })
}
