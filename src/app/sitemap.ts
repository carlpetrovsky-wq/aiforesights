import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const SITE = 'https://www.aiforesights.com'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at, source_name')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(500)

  const { data: tools } = await supabase
    .from('tools')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('save_count', { ascending: false })
    .limit(500)

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,              lastModified: new Date(), changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${SITE}/latest-news`,   lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${SITE}/future-of-ai`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE}/best-ai-tools`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE}/make-money`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE}/learn-ai`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/advertise`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/newsletter`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const articlePages: MetadataRoute.Sitemap = (articles || [])
    .filter(a => a.slug)
    .map(a => ({
      url: `${SITE}/article/${a.slug}`,
      lastModified: new Date(a.published_at || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: a.source_name === 'AI Foresights' ? 0.8 : 0.6,
    }))

  const toolPages: MetadataRoute.Sitemap = (tools || [])
    .filter(t => t.slug)
    .map(t => ({
      url: `${SITE}/tool/${t.slug}`,
      lastModified: new Date(t.updated_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [...staticPages, ...articlePages, ...toolPages]
}
