export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const MISSING_AFFILIATE_TOOLS = [
  {
    name: 'Semrush',
    slug: 'semrush',
    category: 'Business & marketing',
    description: 'The most powerful SEO and digital marketing toolkit used by 10 million marketers. Semrush helps you find the right keywords, track your Google rankings, spy on competitor strategies, and audit your website for SEO problems. If you want your website to show up on Google, Semrush shows you exactly what to do.',
    website_url: 'https://semrush.com',
    pricing: 'paid',
    experience_level: 'intermediate',
    tags: ['seo', 'marketing', 'keywords', 'competitor research', 'google rankings'],
  },
  {
    name: 'Canva',
    slug: 'canva',
    category: 'Design',
    description: 'The easiest way to design anything — social media posts, presentations, logos, flyers, videos, and more. Canva has 250,000+ free templates and AI tools that generate images, write copy, and resize designs automatically. Used by 170 million people worldwide. No design experience needed.',
    website_url: 'https://canva.com',
    pricing: 'freemium',
    experience_level: 'beginner',
    tags: ['design', 'graphics', 'social media', 'templates', 'presentations', 'beginner'],
  },
  {
    name: 'HubSpot',
    slug: 'hubspot',
    category: 'Business & marketing',
    description: 'All-in-one CRM, marketing, sales, and customer service platform. HubSpot AI helps you write emails, create landing pages, score leads, and manage your entire customer pipeline in one place. The free CRM alone is worth signing up for — used by 200,000+ companies from startups to Fortune 500s.',
    website_url: 'https://hubspot.com',
    pricing: 'freemium',
    experience_level: 'intermediate',
    tags: ['crm', 'marketing', 'sales', 'email marketing', 'business', 'automation'],
  },
  {
    name: 'Coursera',
    slug: 'coursera',
    category: 'Education',
    description: 'Online learning platform offering AI, data science, and technology courses from top universities like Stanford, Google, and IBM. Coursera AI courses teach you practical skills with hands-on projects and earn you certificates recognized by employers. Over 100 million learners use Coursera to upskill and change careers.',
    website_url: 'https://coursera.org',
    pricing: 'freemium',
    experience_level: 'beginner',
    tags: ['education', 'courses', 'certificates', 'learning', 'ai training', 'career'],
  },
  {
    name: 'Udemy',
    slug: 'udemy',
    category: 'Education',
    description: 'The largest online course marketplace with 250,000+ courses on AI, coding, business, and more. Udemy courses are created by real practitioners and frequently go on sale for under $20. The best place to learn specific AI tools like ChatGPT, Midjourney, or Python at your own pace with lifetime access.',
    website_url: 'https://udemy.com',
    pricing: 'paid',
    experience_level: 'beginner',
    tags: ['education', 'courses', 'learning', 'ai training', 'coding', 'self-paced'],
  },
  {
    name: 'NordVPN',
    slug: 'nordvpn',
    category: 'Productivity',
    description: "The world's leading VPN service that protects your privacy online. NordVPN encrypts your internet connection, hides your IP address, and lets you access content from anywhere in the world. Essential for anyone using public WiFi, working remotely, or concerned about online privacy. Threat Protection blocks ads and malware automatically.",
    website_url: 'https://nordvpn.com',
    pricing: 'paid',
    experience_level: 'beginner',
    tags: ['vpn', 'privacy', 'security', 'remote work', 'online safety'],
  },
]

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get('admin_token')?.value
  const bearerToken = req.headers.get('authorization')?.replace('Bearer ', '')
  const expected = process.env.ADMIN_TOKEN
  if (!expected || (cookieToken !== expected && bearerToken !== expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing } = await supabaseAdmin.from('tools').select('slug')
  const existingSlugs = new Set(existing?.map((t: any) => t.slug) || [])

  const toInsert = MISSING_AFFILIATE_TOOLS
    .filter(t => !existingSlugs.has(t.slug))
    .map(t => ({ ...t, status: 'published', is_featured: false }))

  if (toInsert.length === 0) {
    return NextResponse.json({ message: 'All tools already exist' })
  }

  const { data, error } = await supabaseAdmin.from('tools').insert(toInsert).select('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    inserted: data?.length,
    tools: data?.map((t: any) => t.name),
  })
}
