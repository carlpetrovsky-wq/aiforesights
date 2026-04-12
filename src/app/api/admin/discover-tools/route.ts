export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Product Hunt GraphQL endpoint
const PH_API_URL = 'https://api.producthunt.com/v2/api/graphql'

// AI-related topics and tags to filter for
const AI_TOPICS = [
  'artificial-intelligence',
  'machine-learning', 
  'chatgpt',
  'ai-tools',
  'productivity',
  'writing-tools',
  'developer-tools',
  'automation',
  'no-code',
  'design-tools',
]

// Categories that match our audience (non-technical professionals)
const RELEVANT_CATEGORIES = [
  'AI',
  'Productivity',
  'Writing',
  'Marketing',
  'Design',
  'Education',
  'Business',
  'Automation',
  'No-Code',
  'Content Creation',
]

interface PHProduct {
  id: string
  name: string
  tagline: string
  description: string
  url: string
  website: string
  votesCount: number
  createdAt: string
  topics: { edges: { node: { name: string; slug: string } }[] }
  thumbnail: { url: string } | null
}

interface DiscoveryResult {
  name: string
  website: string
  status: 'added' | 'duplicate' | 'skipped'
  reason?: string
}

async function getProductHuntToken(): Promise<string | null> {
  // First check for developer token (preferred - never expires)
  const devToken = process.env.PRODUCT_HUNT_TOKEN
  if (devToken) {
    return devToken
  }

  // Fall back to OAuth client credentials flow
  const clientId = process.env.PRODUCT_HUNT_CLIENT_ID
  const clientSecret = process.env.PRODUCT_HUNT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return null
  }

  try {
    const res = await fetch('https://api.producthunt.com/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.access_token
  } catch {
    return null
  }
}

async function fetchAIProducts(token: string, daysBack = 30): Promise<PHProduct[]> {
  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - daysBack)
  const postedAfter = sinceDate.toISOString()

  // GraphQL query - reduced to 20 posts to stay under complexity limit
  // Product Hunt has a 500k complexity limit
  const query = `
    query GetPosts {
      posts(
        first: 20
        order: VOTES
        postedAfter: "${postedAfter}"
      ) {
        edges {
          node {
            id
            name
            tagline
            description
            url
            website
            votesCount
            thumbnail {
              url
            }
            topics(first: 5) {
              edges {
                node {
                  name
                  slug
                }
              }
            }
          }
        }
      }
    }
  `

  const res = await fetch(PH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  })

  const responseText = await res.text()
  
  if (!res.ok) {
    throw new Error(`Product Hunt API error: ${res.status} - ${responseText}`)
  }

  let data
  try {
    data = JSON.parse(responseText)
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`)
  }

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  const posts = data.data?.posts?.edges?.map((e: { node: PHProduct }) => e.node) || []
  
  // Filter for AI-related products client-side
  return posts.filter((p: PHProduct) => {
    const topics = p.topics?.edges?.map(e => e.node.slug) || []
    const combined = `${p.name} ${p.tagline} ${p.description || ''}`.toLowerCase()
    
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'gpt', 'llm', 'chatbot', 'copilot', 'automation', 'generator']
    const hasAITopic = topics.some(t => AI_TOPICS.includes(t))
    const hasAIKeyword = aiKeywords.some(kw => combined.includes(kw))
    
    return hasAITopic || hasAIKeyword
  })
}

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '').toLowerCase()
    return hostname
  } catch {
    return url.toLowerCase()
  }
}

function getActualWebsite(product: PHProduct): string {
  // Product Hunt API returns tracking URLs in 'website' field
  // and PH product page URLs in 'url' field
  // We'll use the product page URL - user can update to real URL during review
  return product.url || product.website || ''
}

function extractProductSlugFromPHUrl(url: string): string | null {
  // Extract product slug from PH URL for deduplication
  // e.g., https://www.producthunt.com/products/brila-2 -> brila-2
  try {
    const match = url.match(/producthunt\.com\/products\/([^/?]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isRelevantForAudience(product: PHProduct): boolean {
  const topics = product.topics?.edges?.map(e => e.node.slug) || []
  const name = product.name.toLowerCase()
  const tagline = product.tagline.toLowerCase()
  const description = (product.description || '').toLowerCase()
  const combined = `${name} ${tagline} ${description}`

  // Skip developer-heavy tools
  const devKeywords = ['api', 'sdk', 'cli', 'terminal', 'kubernetes', 'docker', 'devops', 'github action', 'cicd', 'deployment']
  if (devKeywords.some(kw => combined.includes(kw) && !combined.includes('no-code'))) {
    // Exception: allow if it's explicitly for non-developers
    if (!combined.includes('no code') && !combined.includes('no-code') && !combined.includes('without coding')) {
      return false
    }
  }

  // Must have at least one relevant topic or keyword
  const relevantKeywords = ['ai', 'chatbot', 'writing', 'productivity', 'design', 'marketing', 'automation', 'assistant', 'generator', 'creator']
  const hasRelevantTopic = topics.some(t => AI_TOPICS.includes(t))
  const hasRelevantKeyword = relevantKeywords.some(kw => combined.includes(kw))

  return hasRelevantTopic || hasRelevantKeyword
}

function inferCategory(product: PHProduct): string {
  const topics = product.topics?.edges?.map(e => e.node.name.toLowerCase()) || []
  const combined = `${product.name} ${product.tagline} ${product.description || ''}`.toLowerCase()

  if (combined.includes('write') || combined.includes('writing') || combined.includes('content')) return 'Writing & Content'
  if (combined.includes('image') || combined.includes('art') || combined.includes('design') || combined.includes('visual')) return 'Image Generation'
  if (combined.includes('video') || combined.includes('audio') || combined.includes('voice')) return 'Video & Audio'
  if (combined.includes('code') || combined.includes('developer') || combined.includes('programming')) return 'Coding & Dev'
  if (combined.includes('marketing') || combined.includes('seo') || combined.includes('social media')) return 'Business & Marketing'
  if (combined.includes('productivity') || combined.includes('workflow') || combined.includes('automation')) return 'Productivity'
  if (combined.includes('chat') || combined.includes('assistant') || combined.includes('copilot')) return 'AI Assistants'
  if (combined.includes('research') || combined.includes('search') || combined.includes('knowledge')) return 'Search & Research'
  if (topics.includes('education') || combined.includes('learn') || combined.includes('course')) return 'Education'
  
  return 'AI Tools'
}

function inferPricing(product: PHProduct): string {
  const combined = `${product.tagline} ${product.description || ''}`.toLowerCase()
  
  if (combined.includes('free') && (combined.includes('paid') || combined.includes('pro') || combined.includes('premium'))) return 'freemium'
  if (combined.includes('open source') || combined.includes('100% free') || combined.includes('completely free')) return 'free'
  if (combined.includes('enterprise') || combined.includes('custom pricing')) return 'enterprise'
  if (combined.includes('subscription') || combined.includes('/month') || combined.includes('/year')) return 'paid'
  
  return 'freemium' // Default assumption for most SaaS
}

export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get Product Hunt token
  const token = await getProductHuntToken()
  if (!token) {
    const hasDevToken = !!process.env.PRODUCT_HUNT_TOKEN
    const hasClientId = !!process.env.PRODUCT_HUNT_CLIENT_ID
    const hasClientSecret = !!process.env.PRODUCT_HUNT_CLIENT_SECRET
    return NextResponse.json({ 
      error: 'Product Hunt credentials not configured or invalid',
      debug: {
        hasDevToken,
        hasClientId,
        hasClientSecret,
      },
      setup: 'Add PRODUCT_HUNT_TOKEN (developer token) to Vercel env vars'
    }, { status: 400 })
  }

  // Fetch products from Product Hunt
  let products: PHProduct[]
  try {
    products = await fetchAIProducts(token, 30)
  } catch (err) {
    return NextResponse.json({ 
      error: 'Failed to fetch from Product Hunt',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }

  // Get existing tools to check for duplicates
  const { data: existingTools } = await supabaseAdmin
    .from('tools')
    .select('id, name, slug, website_url, product_hunt_id')

  const existingDomains = new Set(
    (existingTools || []).map(t => extractDomain(t.website_url))
  )
  const existingNames = new Set(
    (existingTools || []).map(t => t.name.toLowerCase())
  )
  const existingSlugs = new Set(
    (existingTools || []).map(t => t.slug)
  )
  const existingPHIds = new Set(
    (existingTools || []).filter(t => t.product_hunt_id).map(t => t.product_hunt_id)
  )

  const results: DiscoveryResult[] = []
  const now = new Date().toISOString()

  for (const product of products) {
    const actualWebsite = getActualWebsite(product)
    const phSlug = extractProductSlugFromPHUrl(actualWebsite)
    const nameLower = product.name.toLowerCase()
    let slug = generateSlug(product.name)

    // Check for duplicates
    if (existingPHIds.has(product.id)) {
      results.push({ name: product.name, website: actualWebsite, status: 'duplicate', reason: 'Already imported from Product Hunt' })
      continue
    }

    if (existingNames.has(nameLower)) {
      results.push({ name: product.name, website: actualWebsite, status: 'duplicate', reason: 'Name already exists' })
      continue
    }

    // Check if we already have this PH product by slug pattern
    if (phSlug && existingSlugs.has(phSlug)) {
      results.push({ name: product.name, website: actualWebsite, status: 'duplicate', reason: `Slug ${phSlug} already exists` })
      continue
    }

    // Check if relevant for our audience
    if (!isRelevantForAudience(product)) {
      results.push({ name: product.name, website: actualWebsite, status: 'skipped', reason: 'Not relevant for non-technical audience' })
      continue
    }

    // Skip low-vote products (likely not established)
    if (product.votesCount < 50) {
      results.push({ name: product.name, website: actualWebsite, status: 'skipped', reason: `Low votes (${product.votesCount})` })
      continue
    }

    // Ensure unique slug
    let slugSuffix = 0
    while (existingSlugs.has(slug)) {
      slugSuffix++
      slug = `${generateSlug(product.name)}-${slugSuffix}`
    }

    // Insert as draft for manual review
    const { error } = await supabaseAdmin.from('tools').insert({
      name: product.name,
      slug,
      description: product.tagline,
      long_description: product.description || null,
      website_url: actualWebsite,
      logo_url: product.thumbnail?.url || null,
      category: inferCategory(product),
      pricing: inferPricing(product),
      tags: product.topics?.edges?.map(e => e.node.name) || [],
      experience_level: 'beginner',
      status: 'draft', // Requires manual review
      is_featured: false,
      product_hunt_id: product.id,
      discovery_source: 'product_hunt',
      validation_status: 'unknown',
      created_at: now,
      updated_at: now,
    })

    if (error) {
      results.push({ name: product.name, website: actualWebsite, status: 'skipped', reason: `DB error: ${error.message}` })
    } else {
      results.push({ name: product.name, website: actualWebsite, status: 'added' })
      existingSlugs.add(slug)
      existingNames.add(nameLower)
      if (phSlug) existingSlugs.add(phSlug)
    }
  }

  // Summary
  const summary = {
    total_fetched: products.length,
    added: results.filter(r => r.status === 'added').length,
    duplicates: results.filter(r => r.status === 'duplicate').length,
    skipped: results.filter(r => r.status === 'skipped').length,
  }

  return NextResponse.json({
    success: true,
    timestamp: now,
    summary,
    results,
  })
}