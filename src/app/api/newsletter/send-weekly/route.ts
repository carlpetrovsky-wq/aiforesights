export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { buildWeeklyDigest, ArticleSnap, VideoSnap, PodcastSnap, ToolSnap } from '@/lib/email/templates'
import { createCampaign, sendCampaignNow } from '@/lib/brevo'

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

    // ── 3. Fetch top stories ──────────────────────────────────
    let { data: articleRows } = await supabaseAdmin
      .from('articles')
      .select('title, slug, excerpt, thumbnail_url, category_slug, source_name')
      .eq('status', 'published')
      .eq('source_name', 'AI Foresights')
      .eq('is_featured', true)
      .neq('category_slug', 'make-money')
      .order('published_at', { ascending: false })
      .limit(3)

    if (!articleRows || articleRows.length < 3) {
      const existingSlugs = (articleRows ?? []).map(a => a.slug)
      const needed = 3 - (articleRows?.length ?? 0)
      let query = supabaseAdmin
        .from('articles')
        .select('title, slug, excerpt, thumbnail_url, category_slug, source_name')
        .eq('status', 'published')
        .eq('source_name', 'AI Foresights')
        .neq('category_slug', 'make-money')
        .order('published_at', { ascending: false })
        .limit(needed + existingSlugs.length)
      const { data: extras } = await query
      const filtered = (extras ?? []).filter(a => !existingSlugs.includes(a.slug)).slice(0, needed)
      articleRows = [...(articleRows ?? []), ...filtered]
    }

    const articles: ArticleSnap[] = articleRows ?? []

    // ── 4. Fetch featured Make Money article ──────────────────
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

    // ── 5. Fetch featured tools ───────────────────────────────
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

    // ── 7. Create Brevo campaign & send immediately ───────────
    const campaignId = await createCampaign({
      name: `Weekly Digest — ${weekLabel}`,
      subject,
      htmlContent: html,
    })

    await sendCampaignNow(campaignId)

    // ── 8. Mark video + podcast as newsletter_included ────────
    if (video) {
      await supabaseAdmin.from('videos').update({ newsletter_included: true }).eq('is_active', true)
    }
    if (podcast) {
      await supabaseAdmin.from('podcast_roundups').update({ newsletter_included: true }).eq('is_active', true)
    }

    console.log(`[send-weekly] Brevo campaign ${campaignId} sent for ${weekLabel}`)

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
  return POST(req)
}
