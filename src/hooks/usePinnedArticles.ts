'use client'
import { useState, useEffect, useCallback } from 'react'
import { Article } from '@/lib/types'

const PAGE_SIZE = 12

interface UsePinnedArticlesOptions {
  category?: string // omit for all categories (latest-news page)
}

interface UsePinnedArticlesResult {
  pinned: Article[]       // AI Foresights own content — always shown at top
  news: Article[]         // RSS articles shown below
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  loadMore: () => void
  ratings: Record<string, { average: number; count: number }>
}

export function usePinnedArticles({ category }: UsePinnedArticlesOptions = {}): UsePinnedArticlesResult {
  const [pinned, setPinned] = useState<Article[]>([])
  const [news, setNews] = useState<Article[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({})

  async function fetchRatings(articles: Article[]) {
    if (!articles.length) return
    try {
      const slugs = articles.map(a => a.slug).join(',')
      const res = await fetch(`/api/ratings?slugs=${slugs}`)
      const data = await res.json()
      setRatings(prev => ({ ...prev, ...data }))
    } catch {}
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const catParam = category ? `&category=${encodeURIComponent(category)}` : ''

        // Fetch a large batch — split client-side by source
        const res = await fetch(`/api/articles?limit=100${catParam}&sortBy=latest`)
        const all: Article[] = await res.json()

        if (!Array.isArray(all)) return

        const ownContent = all.filter(a => a.sourceName === 'AI Foresights')
        const rssItems = all.filter(a => a.sourceName !== 'AI Foresights')

        setPinned(ownContent)
        setNews(rssItems.slice(0, PAGE_SIZE))
        setOffset(PAGE_SIZE)
        setHasMore(rssItems.length > PAGE_SIZE)

        await fetchRatings([...ownContent, ...rssItems.slice(0, PAGE_SIZE)])
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [category])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const catParam = category ? `&category=${encodeURIComponent(category)}` : ''
      const res = await fetch(`/api/articles?limit=${PAGE_SIZE + 1}${catParam}&sortBy=latest&offset=${offset}`)
      const data: Article[] = await res.json()
      if (!Array.isArray(data)) return

      const rssItems = data.filter(a => a.sourceName !== 'AI Foresights')
      const page = rssItems.slice(0, PAGE_SIZE)

      setNews(prev => [...prev, ...page])
      setOffset(prev => prev + PAGE_SIZE)
      setHasMore(rssItems.length > PAGE_SIZE)
      await fetchRatings(page)
    } finally {
      setLoadingMore(false)
    }
  }, [category, offset, loadingMore, hasMore])

  return { pinned, news, loading, loadingMore, hasMore, loadMore, ratings }
}
