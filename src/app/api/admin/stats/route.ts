export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const [articles, tools, subscribers, sources] = await Promise.all([
      supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('tools').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('subscribers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('sources').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ])

    // Recent articles (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentArticles } = await supabaseAdmin
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo)

    // Recent subscribers (last 7 days)
    const { count: recentSubscribers } = await supabaseAdmin
      .from('subscribers')
      .select('id', { count: 'exact', head: true })
      .gte('subscribed_at', weekAgo)

    return NextResponse.json({
      articles: articles.count ?? 0,
      tools: tools.count ?? 0,
      subscribers: subscribers.count ?? 0,
      sources: sources.count ?? 0,
      recentArticles: recentArticles ?? 0,
      recentSubscribers: recentSubscribers ?? 0,
    })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
