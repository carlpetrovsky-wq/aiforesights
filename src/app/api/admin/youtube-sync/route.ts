export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const YT_API = 'https://www.googleapis.com/youtube/v3'

export async function GET(req: NextRequest) {
  // Admin only
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'YOUTUBE_API_KEY not set' }, { status: 500 })

  const playlists = [
    { id: process.env.YOUTUBE_PLAYLIST_AI || 'PLUweIYfSRAggtUZkJj3eBrUV_R5uIExF1', label: 'AI' },
    { id: process.env.YOUTUBE_PLAYLIST_BIZIDEAS || 'PLUweIYfSRAgjk6pN2FunXLYUEBxa_8ovz', label: 'AI Biz' },
  ]

  const allVideos: object[] = []

  for (const playlist of playlists) {
    try {
      // Fetch playlist items
      const itemsRes = await fetch(
        `${YT_API}/playlistItems?part=snippet&playlistId=${playlist.id}&maxResults=25&key=${apiKey}`
      )
      const itemsData = await itemsRes.json()

      if (!itemsData.items) continue

      // Get video IDs to fetch full details (duration, view count etc)
      const videoIds = itemsData.items
        .map((item: { snippet: { resourceId: { videoId: string } } }) => item.snippet.resourceId.videoId)
        .join(',')

      const detailsRes = await fetch(
        `${YT_API}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`
      )
      const detailsData = await detailsRes.json()

      const detailsMap: Record<string, object> = {}
      if (detailsData.items) {
        for (const v of detailsData.items) {
          detailsMap[v.id] = v
        }
      }

      for (const item of itemsData.items) {
        const videoId = item.snippet.resourceId.videoId
        const details = detailsMap[videoId] as {
          snippet?: { publishedAt?: string; description?: string; channelTitle?: string }
          contentDetails?: { duration?: string }
          statistics?: { viewCount?: string }
        } | undefined

        allVideos.push({
          youtube_id: videoId,
          title: item.snippet.title,
          description: details?.snippet?.description?.slice(0, 200) || '',
          channel: details?.snippet?.channelTitle || item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          published_at: details?.snippet?.publishedAt || item.snippet.publishedAt,
          duration: details?.contentDetails?.duration || '',
          view_count: details?.statistics?.viewCount || '0',
          playlist: playlist.label,
          playlist_id: playlist.id,
        })
      }
    } catch (err) {
      console.error(`Failed to fetch playlist ${playlist.id}:`, err)
    }
  }

  // Sort by published_at descending (newest first)
  allVideos.sort((a, b) => {
    const aDate = new Date((a as { published_at: string }).published_at).getTime()
    const bDate = new Date((b as { published_at: string }).published_at).getTime()
    return bDate - aDate
  })

  return NextResponse.json({ videos: allVideos, count: allVideos.length })
}
