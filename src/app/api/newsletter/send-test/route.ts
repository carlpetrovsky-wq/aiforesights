export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { buildWeeklyDigest, ArticleSnap, VideoSnap, PodcastSnap, ToolSnap } from '@/lib/email/templates'

const MAILERLITE_API = 'https://connect.mailerlite.com/api'

async function mlFetch(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${MAILERLITE_API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`MailerLite ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  return data
}

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ── 1. Fetch active video ──────────────────────────────────
    const { data: videoRow } = await supabaseAdmin
      .from('videos')
      .select('youtube_id, title, intro, published_at')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()
    const video: VideoSnap | null = videoRow ?? null

    // ── 2. Fetch active podcast roundup ───────────────────────
    const { data: podcastRow } = await supabaseAdmin
      .from('podcast_roundups')
      .select('title, week_of, episodes')
      .eq('is_active', true)
      .order('week_of', { ascending: false })
      .limit(1)
      .single()
    const podcast: PodcastSnap | null = podcastRow ?? null

    // ── 3. Fetch 3 recent articles ────────────────────────────
    const { data: articleRows } = await supabaseAdmin
      .from('articles')
      .select('title, slug, excerpt, thumbnail_url, category_slug, source_name')
      .eq('status', 'published')
      .neq('category_slug', 'make-money')
      .order('published_at', { ascending: false })
      .limit(3)
    const articles: ArticleSnap[] = articleRows ?? []

    // ── 4. Featured Make Money article ────────────────────────
    let { data: mmRow } = await supabaseAdmin
      .from('articles')
      .select('title, slug, excerpt, thumbnail_url, category_slug')
      .eq('status', 'published')
      .eq('category_slug', 'make-money')
      .eq('source_name', 'AI Foresights')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()
    if (!mmRow) {
      const { data: fallback } = await supabaseAdmin
        .from('articles')
        .select('title, slug, excerpt, thumbnail_url, category_slug')
        .eq('status', 'published')
        .eq('category_slug', 'make-money')
        .eq('source_name', 'AI Foresights')
        .order('published_at', { ascending: false })
        .limit(1)
        .single()
      mmRow = fallback
    }
    const makeMoneyArticle: ArticleSnap | null = mmRow ?? null

    // ── 5. Featured tools ─────────────────────────────────────
    let { data: toolRows } = await supabaseAdmin
      .from('tools')
      .select('name, slug, description, website_url, affiliate_url, pricing, category, logo_url')
      .eq('newsletter_featured', true)
      .eq('status', 'published')
      .limit(3)
    if (!toolRows || toolRows.length === 0) {
      const { data: fallbackTools } = await supabaseAdmin
        .from('tools')
        .select('name, slug, description, website_url, affiliate_url, pricing, category, logo_url')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3)
      toolRows = fallbackTools
    }
    const tools: ToolSnap[] = toolRows ?? []

    // ── 6. Build HTML ─────────────────────────────────────────
    const html = buildWeeklyDigest(video, podcast, articles, makeMoneyArticle, tools)
    const now = new Date()
    const weekLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const subject = `[TEST] Your Weekly AI Briefing — ${weekLabel}`

    // ── 7. Find the Admin group ───────────────────────────────
    const groupsRes = await mlFetch('/groups?limit=50')
    const groups: Array<{ id: string; name: string }> = groupsRes?.data ?? []
    const adminGroup = groups.find(g =>
      g.name.toLowerCase() === 'admin' ||
      g.name.toLowerCase().includes('admin')
    )
    if (!adminGroup) {
      throw new Error(`Admin group not found. Groups available: ${groups.map(g => g.name).join(', ')}`)
    }

    // ── 8. Create campaign targeting Admin group only ─────────
    const campaign = await mlFetch('/campaigns', 'POST', {
      name: `[TEST] Weekly Digest — ${weekLabel}`,
      type: 'regular',
      emails: [{
        subject,
        from_name: 'AI Foresights',
        from: 'hello@aiforesights.com',
        reply_to: 'help@aiforesights.com',
        content: html,
      }],
      groups: [adminGroup.id],
    })

    const campaignId = campaign?.data?.id
    if (!campaignId) throw new Error('No campaign ID returned')

    // ── 9. Schedule immediately ───────────────────────────────
    const sendAt = new Date(Date.now() + 60 * 1000)
    await mlFetch(`/campaigns/${campaignId}/schedule`, 'POST', {
      delivery: 'scheduled',
      schedule: {
        date: sendAt.toISOString().slice(0, 10),
        hours: String(sendAt.getUTCHours()).padStart(2, '0'),
        minutes: String(sendAt.getUTCMinutes()).padStart(2, '0'),
        timezone_id: 'UTC',
      },
    })

    return NextResponse.json({
      success: true,
      campaignId,
      sentTo: `Admin group (${adminGroup.name})`,
      adminGroupId: adminGroup.id,
      subject,
      preview: {
        hasVideo: !!video,
        hasPodcast: !!podcast,
        articlesCount: articles.length,
        toolsCount: tools.length,
        hasMakeMoney: !!makeMoneyArticle,
      },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[send-test] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
