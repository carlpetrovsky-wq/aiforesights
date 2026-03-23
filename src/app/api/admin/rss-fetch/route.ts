export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextResponse } from 'next/server'

// This route proxies the RSS fetch from the admin panel.
// The middleware already verified the admin cookie, so we just
// forward to the real RSS endpoint using the CRON_SECRET.
export async function POST() {
  const secret = process.env.CRON_SECRET || process.env.ADMIN_TOKEN
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiforesights.vercel.app'

  const res = await fetch(`${base}/api/rss/fetch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
