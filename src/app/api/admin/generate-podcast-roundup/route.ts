export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const YT_API = 'https://www.googleapis.com/youtube/v3'

function parseDurationToMinutes(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return (parseInt(match[1] || '0') * 60) + parseInt(match[2] || '0')
}

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const h = parseInt(match[1] || '0')
  const m = parseInt(match[2] || '0')
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export async function GET(req: NextRequest) {
  // Auth — cron secret or admin cookie
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_TOKEN
  const adminCookie = req.cookies.get('admin_token')?.value
  const validCron = authHeader === `Bearer ${cronSecret}`
  const validAdmin = adminCookie === process.env.ADMIN_TOKEN
  if (!validCron && !validAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'YOUTUBE_API_KEY not set' }, { status: 500 })

  const minMinutes = parseInt(process.env.PODCAST_MIN_DURATION_MINUTES || '30')

  const playlists = [
    process.env.YOUTUBE_PLAYLIST_AI || 'PLUweIYfSRAggtUZkJj3eBrUV_R5uIExF1',
    process.env.YOUTUBE_PLAYLIST_BIZIDEAS || 'PLUweIYfSRAgjk6pN2FunXLYUEBxa_8ovz',
  ]

  // Collect all playlist items from both lists
  const allItems: Array<{
    youtube_id: string
    title: string
    channel: string
    thumbnail: string
    published_at: string
    duration_iso: string
    duration_minutes: number
    duration_label: string
    view_count: string
    description: string
  }> = []

  for (const playlistId of playlists) {
    try {
      const itemsRes = await fetch(
        `${YT_API}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`
      )
      const itemsData = await itemsRes.json()
      if (!itemsData.items?.length) continue

      const videoIds = itemsData.items
        .map((i: { snippet: { resourceId: { videoId: string } } }) => i.snippet.resourceId.videoId)
        .join(',')

      const detailsRes = await fetch(
        `${YT_API}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`
      )
      const detailsData = await detailsRes.json()
      if (!detailsData.items?.length) continue

      for (const v of detailsData.items) {
        const durationIso = v.contentDetails?.duration || ''
        const mins = parseDurationToMinutes(durationIso)
        if (mins < minMinutes) continue // skip short videos

        allItems.push({
          youtube_id: v.id,
          title: v.snippet?.title || '',
          channel: v.snippet?.channelTitle || '',
          thumbnail: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.default?.url || '',
          published_at: v.snippet?.publishedAt || '',
          duration_iso: durationIso,
          duration_minutes: mins,
          duration_label: formatDuration(durationIso),
          view_count: v.statistics?.viewCount || '0',
          description: (v.snippet?.description || '').slice(0, 300),
        })
      }
    } catch (err) {
      console.error('Playlist fetch error:', err)
    }
  }

  if (!allItems.length) {
    return NextResponse.json({ error: 'No qualifying videos found in playlists' }, { status: 404 })
  }

  // Sort by view count desc, take top 5
  allItems.sort((a, b) => parseInt(b.view_count) - parseInt(a.view_count))
  const top5 = allItems.slice(0, 5)

  // Generate summaries for each episode with Claude
  const episodesWithSummaries = []
  for (const ep of top5) {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Write ONE paragraph (3-4 sentences) summarizing why this AI podcast episode is worth listening to. Write for non-technical professionals aged 35-65. Plain English, no jargon, warm tone. Focus on what the listener will walk away understanding — not just what topics are covered.

Episode: "${ep.title}"
Channel: ${ep.channel}
Description: ${ep.description}

Respond with only the paragraph, no labels or extra text.`
      }]
    })

    const summary = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    // Guess podcast name from channel/title
    const podcastName = ep.channel || ep.title.split('|')[0]?.trim() || ep.title.split('-')[0]?.trim() || ep.channel

    episodesWithSummaries.push({
      youtube_id: ep.youtube_id,
      podcast_name: podcastName,
      episode_title: ep.title,
      summary,
      duration: ep.duration_label,
      view_count: ep.view_count,
      thumbnail: ep.thumbnail,
      published_at: ep.published_at,
      tags: [],
    })
  }

  // Generate weekly headline with Claude
  const titlesForHeadline = episodesWithSummaries.map(e => e.episode_title).join('\n')
  const headlineMsg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Write a compelling weekly roundup headline for these 5 AI podcast episodes. Format: "5 AI Conversations Worth Your Time This Week" style — punchy, under 70 chars, written for everyday professionals. No quotes.

Episodes:
${titlesForHeadline}

Respond with only the headline.`
    }]
  })
  const weeklyTitle = headlineMsg.content[0].type === 'text'
    ? headlineMsg.content[0].text.trim()
    : '5 AI Conversations Worth Your Time This Week'

  // Save as DRAFT (is_active: false)
  const weekOf = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabaseAdmin
    .from('podcast_roundups')
    .insert({
      title: weeklyTitle,
      week_of: weekOf,
      episodes: episodesWithSummaries,
      is_active: false,
      newsletter_included: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    message: `Draft roundup created: "${weeklyTitle}" with ${episodesWithSummaries.length} episodes`,
    roundup: data,
  })
}
