export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get subscriber_count setting and tool count in parallel
    const [settingsRes, toolCountRes] = await Promise.all([
      supabase.from('settings').select('value').eq('key', 'subscriber_count').single(),
      supabase.from('tools').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    ])

    const subscriberCount = settingsRes.data?.value ?? '2,400+'
    const toolCount = toolCountRes.count ?? 50

    return NextResponse.json({
      subscriberCount,
      toolCount,
    })
  } catch {
    return NextResponse.json({ subscriberCount: '2,400+', toolCount: 50 })
  }
}
