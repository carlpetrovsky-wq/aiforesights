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
  let query = supabase
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
  return data ?? []
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
  featured,
}: {
  limit?: number
  pricing?: string
  experienceLevel?: string
  search?: string
  featured?: boolean
} = {}) {
  let query = supabase
    .from('tools')
    .select('*')
    .eq('status', 'published')
    .order('save_count', { ascending: false })
    .limit(limit)

  if (pricing && pricing !== 'all') query = query.eq('pricing', pricing.toLowerCase())
  if (experienceLevel && experienceLevel !== 'all') query = query.eq('experience_level', experienceLevel)
  if (featured !== undefined) query = query.eq('is_featured', featured)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) { console.error('getTools error:', error); return [] }
  return data ?? []
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
