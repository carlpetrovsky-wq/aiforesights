export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { buildWeeklyDigest, ArticleSnap, VideoSnap, PodcastSnap, ToolSnap } from '@/lib/email/templates'

const MAILERLITE_API = 'https://connect.mailerlite.com/api'
const GROUP_ID = process.env.MAILERLITE_GROUP_ID!

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
  // Auth — cron secret or admin cookie
  const authHeader = req.headers.get('authorization')
  const adminCookie = req.cookies.get('admin_token')?.value
  const validCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const validAdmin = adminCookie === process.env.ADMIN_TOKEN
  if (!validCron && !validAdmin) {
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

    // ── 3. Fetch 3 recent non-make-money articles ─────────────
    const { data: articleRows } = await supabaseAdmin
      .from('articles')
      .select('title, slug, excerpt, thumbnail_url, category_slug, source_name')
      .eq('status', 'published')
      .neq('category_slug', 'make-money')
      .order('published_at', { ascending: false })
      .limit(3)

    const articles: ArticleSnap[] = articleRows ?? []

    // ── 4. Fetch featured Make Money article ──────────────────
    // Priority: is_featured=true in make-money → fallback to most recent
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

    // ── 5. Fetch newsletter-featured tools → fallback to 3 most recently added ──
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
    const subject = `Your Weekly AI Briefing — ${weekLabel}`

    // ── 6. Create MailerLite campaign ─────────────────────────
    const campaign = await mlFetch('/campaigns', 'POST', {
      name: `Weekly Digest — ${weekLabel}`,
      type: 'regular',
      status: 'draft',
      emails: [{
        subject,
        from_name: 'AI Foresights',
        from: 'hello@aiforesights.com',
        reply_to: 'help@aiforesights.com',
        content: html,
      }],
      groups: [GROUP_ID],
    })

    const campaignId = campaign?.data?.id
    if (!campaignId) throw new Error('No campaign ID returned from MailerLite')

    // ── 7. Schedule campaign — send immediately ───────────────
    // 'instant' delivery requires Advanced plan.
    // Fallback: schedule for 1 minute from now which works on all plans.
    const sendAt = new Date(Date.now() + 60 * 1000) // 1 min from now
    const scheduleResult = await mlFetch(`/campaigns/${campaignId}/schedule`, 'POST', {
      delivery: 'scheduled',
      schedule: {
        date: sendAt.toISOString().slice(0, 10),
        hours: String(sendAt.getUTCHours()).padStart(2, '0'),
        minutes: String(sendAt.getUTCMinutes()).padStart(2, '0'),
        timezone_id: 'UTC',
      },
    })
    console.log(`[send-weekly] Schedule result:`, JSON.stringify(scheduleResult))

    // ── 8. Mark video + podcast as newsletter_included ────────
    if (video) {
      await supabaseAdmin.from('videos').update({ newsletter_included: true }).eq('is_active', true)
    }
    if (podcast) {
      await supabaseAdmin.from('podcast_roundups').update({ newsletter_included: true }).eq('is_active', true)
    }

    console.log(`[send-weekly] Campaign ${campaignId} scheduled for ${weekLabel}`)

    return NextResponse.json({
      success: true,
      campaignId,
      subject,
      articlesCount: articles.length,
      toolsCount: tools.length,
      hasVideo: !!video,
      hasPodcast: !!podcast,
      hasMakeMoney: !!makeMoneyArticle,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[send-weekly] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — for manual test from admin (no body needed)
export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Delegate to POST handler
  return POST(req)
}
