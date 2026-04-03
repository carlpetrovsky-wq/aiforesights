import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Articles ────────────────────────────────────────────────
export async function getArticles({
  limit = 12,
  sortBy = 'latest',
  category,
  featured,
}: {
  limit?: number
  sortBy?: 'latest' | 'popular'
  category?: string
  featured?: boolean
} = {}) {
  // Use service role client to bypass PostgREST query cache
  const { createClient } = await import('@supabase/supabase-js')
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  let query = adminClient
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .limit(limit)

  if (category) query = query.eq('category_slug', category)
  if (featured !== undefined) query = query.eq('is_featured', featured)
  if (sortBy === 'popular') {
    query = query.order('vote_count', { ascending: false })
  } else {
    query = query.order('published_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) { console.error('getArticles error:', error); return [] }
  return (data ?? []).map(mapArticle)
}

// Map Supabase snake_case DB fields → camelCase Article type
function mapArticle(row: Record<string, unknown>) {
  let tags: string[] = []
  if (Array.isArray(row.tags)) tags = row.tags
  else if (typeof row.tags === 'string') {
    try { tags = JSON.parse(row.tags) } catch { tags = [] }
  }

  return {
    id:           row.id,
    title:        row.title,
    slug:         row.slug,
    excerpt:      row.excerpt ?? '',
    summary:      row.summary ?? '',
    content:      row.content ?? '',
    thumbnailUrl: row.thumbnail_url ?? undefined,
    sourceUrl:    row.source_url,
    sourceName:   row.source_name ?? '',
    sourceColor:  row.source_color ?? undefined,
    author:       row.author ?? undefined,
    publishedAt:  row.published_at ?? row.created_at,
    category:     row.category_slug ?? 'latest-news',
    tags,
    voteCount:    row.vote_count ?? 0,
    isFeatured:   row.is_featured ?? false,
    status:       row.status ?? 'published',
  }
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) { console.error('getArticleBySlug error:', error); return null }
  return data
}

// ── Tools ───────────────────────────────────────────────────
export async function getTools({
  limit = 20,
  pricing,
  experienceLevel,
  search,
  category: categoryFilter,
  featured,
}: {
  limit?: number
  pricing?: string
  experienceLevel?: string
  search?: string
  category?: string
  featured?: boolean
} = {}) {
  let query = supabase
    .from('tools')
    .select('*')
    .eq('status', 'published')
    .order('save_count', { ascending: false })
    .limit(limit)

  if (categoryFilter) query = query.eq('category', categoryFilter)
  if (pricing && pricing !== 'all') query = query.eq('pricing', pricing.toLowerCase())
  if (experienceLevel && experienceLevel !== 'all') query = query.eq('experience_level', experienceLevel)
  if (featured !== undefined) query = query.eq('is_featured', featured)
  if (search) {
    // name and description partial match covers most searches
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) { console.error('getTools error:', error); return [] }
  return (data ?? []).map((row: Record<string, unknown>) => {
    let tags: string[] = []
    if (Array.isArray(row.tags)) tags = row.tags
    else if (typeof row.tags === 'string') {
      try { tags = JSON.parse(row.tags) } catch { tags = [] }
    }
    return {
      id:              row.id,
      name:            row.name,
      slug:            row.slug,
      description:     row.description ?? '',
      websiteUrl:      row.website_url,
      logoUrl:         row.logo_url ?? undefined,
      pricing:         row.pricing ?? 'free',
      category:        row.category ?? '',
      tags,
      experienceLevel: row.experience_level ?? 'beginner',
      saveCount:       row.save_count ?? 0,
      isFeatured:      row.is_featured ?? false,
      affiliateUrl:    row.affiliate_url ?? undefined,
    }
  })
}

export async function getToolBySlug(slug: string) {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error || !data) return null
  const row = data as Record<string, unknown>
  let tags: string[] = []
  if (Array.isArray(row.tags)) tags = row.tags as string[]
  else if (typeof row.tags === 'string') {
    try { tags = JSON.parse(row.tags as string) } catch { tags = [] }
  }
  return {
    id:              row.id as string,
    name:            row.name as string,
    slug:            row.slug as string,
    description:     (row.description ?? '') as string,
    longDescription: (row.long_description ?? '') as string,
    websiteUrl:      row.website_url as string,
    logoUrl:         (row.logo_url ?? undefined) as string | undefined,
    thumbnailUrl:    (row.thumbnail_url ?? undefined) as string | undefined,
    pricing:         (row.pricing ?? 'free') as string,
    category:        (row.category ?? '') as string,
    tags,
    experienceLevel: (row.experience_level ?? 'beginner') as string,
    saveCount:       (row.save_count ?? 0) as number,
    isFeatured:      (row.is_featured ?? false) as boolean,
    affiliateUrl:    (row.affiliate_url ?? undefined) as string | undefined,
  }
}

export async function getRelatedTools(slug: string, category: string, limit = 3) {
  const { data } = await supabase
    .from('tools')
    .select('id, name, slug, description, logo_url, pricing, category, tags, website_url, affiliate_url')
    .eq('status', 'published')
    .eq('category', category)
    .neq('slug', slug)
    .order('save_count', { ascending: false })
    .limit(limit)
  if (!data) return []
  return data.map((row: Record<string, unknown>) => {
    let tags: string[] = []
    if (Array.isArray(row.tags)) tags = row.tags as string[]
    else if (typeof row.tags === 'string') {
      try { tags = JSON.parse(row.tags as string) } catch { tags = [] }
    }
    return {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      description: (row.description ?? '') as string,
      logoUrl: (row.logo_url ?? undefined) as string | undefined,
      pricing: (row.pricing ?? 'free') as string,
      category: (row.category ?? '') as string,
      tags,
      websiteUrl: row.website_url as string,
      affiliateUrl: (row.affiliate_url ?? undefined) as string | undefined,
      saveCount: 0,
      isFeatured: false,
    }
  })
}

// ── Subscribers ─────────────────────────────────────────────
export async function subscribeEmail(email: string, name?: string, source = 'website') {
  const { error } = await supabase
    .from('subscribers')
    .upsert({ email, name, source, is_active: true, subscribed_at: new Date().toISOString() },
      { onConflict: 'email' })
  if (error) {
    if (error.code === '23505') return { success: true, alreadySubscribed: true }
    console.error('subscribeEmail error:', error)
    return { success: false, error: error.message }
  }
  return { success: true }
}

// ── Settings ────────────────────────────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error) return null
  return data?.value ?? null
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', keys)
  if (error) return {}
  return Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
}

// ── Ad Slots ────────────────────────────────────────────────
export async function getAdSlots() {
  const { data, error } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('is_active', true)
    .order('slot_id')
  if (error) { console.error('getAdSlots error:', error); return [] }
  return data ?? []
}

// ── Vote on article ─────────────────────────────────────────
export async function voteArticle(articleId: string) {
  const { error } = await supabase.rpc('increment_vote', { article_id: articleId })
  if (error) console.error('voteArticle error:', error)
  return !error
}

// ── Categories ──────────────────────────────────────────────
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
  if (error) { console.error('getCategories error:', error); return [] }
  return data ?? []
}
