export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aiforesights.com'

  // Use a TransformStream to return 200 immediately while work continues
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  // Fire off the work asynchronously — do NOT await here
  ;(async () => {
    try {
      writer.write(encoder.encode('{"status":"started","article1":'))

      // Article 1
      const res1 = await fetch(`${base}/api/admin/generate-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({ featured: true }),
      })
      const data1 = await res1.json()
      const cat1 = data1.article?.category_slug || ''
      const title1 = data1.article?.title || ''

      writer.write(encoder.encode(JSON.stringify({ ok: res1.ok, title: title1 })))
      writer.write(encoder.encode(',"article2":'))

      // Article 2 — forced different category
      const categoryMap: Record<string, string> = {
        'latest-news':   'future-of-ai',
        'future-of-ai':  'make-money',
        'make-money':    'learn-ai',
        'learn-ai':      'best-ai-tools',
        'best-ai-tools': 'latest-news',
      }
      const forceCategory = categoryMap[cat1] || 'make-money'

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

      writer.write(encoder.encode(JSON.stringify({ ok: res2.ok, title: data2.article?.title || '' })))
      writer.write(encoder.encode(',"done":true}'))
    } catch (err) {
      writer.write(encoder.encode(JSON.stringify({ error: String(err) }) + '}'))
    } finally {
      writer.close()
    }
  })()

  return new Response(readable, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
