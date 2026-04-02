export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const [settingsRes, toolCountRes, newArticlesRes] = await Promise.all([
      supabase.from('settings').select('value').eq('key', 'subscriber_count').single(),
      supabase.from('tools').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('articles').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
    ])

    const subscriberCount = settingsRes.data?.value ?? '2,400+'
    const toolCount = toolCountRes.count ?? 50
    const newLast24h = newArticlesRes.count ?? 0

    return NextResponse.json({
      subscriberCount,
      toolCount,
      newLast24h,
    })
  } catch {
    return NextResponse.json({ subscriberCount: '2,400+', toolCount: 50 })
  }
}
