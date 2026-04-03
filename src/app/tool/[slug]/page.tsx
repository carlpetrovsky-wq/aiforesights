import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import NewsletterForm from '@/components/ui/NewsletterForm'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Star, Shield, Zap, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PRICING_INFO: Record<string, { label: string; color: string; desc: string }> = {
  free:      { label: 'Free',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Completely free to use — no credit card required.' },
  freemium:  { label: 'Freemium',  color: 'bg-blue-50 text-blue-700 border-blue-200',        desc: 'Free tier available with optional paid upgrades for more features.' },
  paid:      { label: 'Paid',      color: 'bg-amber-50 text-amber-700 border-amber-200',      desc: 'Requires a paid subscription. Most offer a free trial.' },
  enterprise:{ label: 'Enterprise', color: 'bg-purple-50 text-purple-700 border-purple-200',   desc: 'Pricing available on request — designed for teams and organizations.' },
}

const LEVEL_INFO: Record<string, { label: string; desc: string }> = {
  beginner:     { label: 'Beginner-friendly',  desc: 'No technical background needed. Great for people just getting started with AI.' },
  intermediate: { label: 'Some experience',    desc: 'Best if you\'ve used AI tools before and want more power.' },
  advanced:     { label: 'Advanced users',     desc: 'Designed for power users, developers, or technical professionals.' },
  all:          { label: 'All levels',         desc: 'Works well regardless of your experience with AI.' },
}

const CATEGORY_ICONS: Record<string, string> = {
  'Chatbots': '💬', 'AI Agents': '🤖', 'AI Models': '🧠', 'App Builders': '🏗️',
  'Coding & Dev': '👨‍💻', 'Customer Service': '🎧', 'Data & Analytics': '📊',
  'Design': '🎨', 'Education': '📚', 'Healthcare': '🏥', 'Image Generation': '🖼️',
  'Productivity': '⚡', 'Search & Research': '🔍', 'Video & Audio': '🎬',
  'Writing & Content': '✍️', 'Business & Marketing': '📈',
}

async function getTool(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data
}

async function getRelatedTools(slug: string, category: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('tools')
    .select('slug, name, description, logo_url, pricing, category')
    .eq('category', category)
    .eq('status', 'published')
    .neq('slug', slug)
    .order('save_count', { ascending: false })
    .limit(4)
  return data || []
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = await getTool(params.slug)
  if (!tool) notFound()

  const relatedTools = await getRelatedTools(params.slug, tool.category || '')
  const pricing = PRICING_INFO[tool.pricing] || PRICING_INFO.freemium
  const level = LEVEL_INFO[tool.experience_level] || LEVEL_INFO.all
  const categoryIcon = CATEGORY_ICONS[tool.category] || '🔧'
  const visitUrl = tool.affiliate_url || tool.website_url
  const isAffiliate = !!tool.affiliate_url

  let tags: string[] = []
  if (Array.isArray(tool.tags)) tags = tool.tags
  else if (typeof tool.tags === 'string') {
    try { tags = JSON.parse(tool.tags) } catch { tags = [] }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description || '',
    url: tool.website_url,
    applicationCategory: tool.category || 'Productivity',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: tool.pricing === 'free' ? '0' : undefined,
      priceCurrency: 'USD',
      availability: 'https://schema.org/OnlineOnly',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Foresights',
      url: 'https://www.aiforesights.com',
    },
    review: {
      '@type': 'Review',
      author: { '@type': 'Organization', name: 'AI Foresights' },
      reviewBody: tool.description || '',
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link href="/best-ai-tools" className="inline-flex items-center gap-1.5 text-sm text-brand-slate hover:text-brand-sky transition mb-6">
          <ArrowLeft className="w-4 h-4" /> All AI tools
        </Link>

        {/* Hero section */}
        <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-2xl font-bold text-brand-slate shrink-0 overflow-hidden">
              {tool.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain p-2" />
              ) : (
                <span>{(tool.name || '?').charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy">{tool.name}</h1>
                {tool.is_featured && (
                  <span className="text-xs font-semibold bg-brand-sky text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>

              <p className="text-brand-slate text-base leading-relaxed mb-4">
                {tool.description}
              </p>

              {/* Quick facts */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${pricing.color}`}>
                  {pricing.label}
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-lg border border-brand-border bg-gray-50 text-brand-slate">
                  {categoryIcon} {tool.category}
                </span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-lg border border-brand-border bg-gray-50 text-brand-slate">
                  {level.label}
                </span>
              </div>

              {/* CTA button */}
              <a
                href={visitUrl}
                target="_blank"
                rel={`noopener noreferrer${isAffiliate ? ' sponsored' : ''}`}
                className="inline-flex items-center gap-2 bg-brand-sky hover:bg-brand-skyDark text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
              >
                Try {tool.name} {tool.pricing === 'free' ? '— it\u0027s free' : tool.pricing === 'freemium' ? '— free plan available' : '\u2192'}
                <ExternalLink className="w-4 h-4" />
              </a>
              {isAffiliate && (
                <p className="text-[10px] text-brand-muted mt-2">
                  This is an affiliate link. We may earn a commission at no extra cost to you.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-brand-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-brand-navy">Pricing</h3>
            </div>
            <p className="text-xs text-brand-slate leading-relaxed">{pricing.desc}</p>
          </div>
          <div className="bg-white border border-brand-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-brand-navy">Best for</h3>
            </div>
            <p className="text-xs text-brand-slate leading-relaxed">{level.desc}</p>
          </div>
          <div className="bg-white border border-brand-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-brand-navy">Category</h3>
            </div>
            <p className="text-xs text-brand-slate leading-relaxed">{tool.category || 'General AI tool'}</p>
          </div>
        </div>

        {/* Long description */}
        {tool.long_description && (
          <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-bold text-brand-navy mb-4">About {tool.name}</h2>
            <div className="prose prose-sm max-w-none text-brand-slate leading-relaxed space-y-4">
              {tool.long_description.split('\n').filter(Boolean).map((block: string, i: number) => {
                if (block.startsWith('## ')) return <h3 key={i} className="text-base font-bold text-brand-navy mt-6 mb-2">{block.slice(3)}</h3>
                if (block.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{block.slice(2)}</li>
                return <p key={i}>{block}</p>
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-brand-navy mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Second CTA */}
        <div className="bg-gradient-to-r from-brand-sky/5 to-brand-navy/5 border border-brand-sky/20 rounded-2xl p-6 text-center mb-8">
          <h2 className="text-lg font-bold text-brand-navy mb-2">Ready to try {tool.name}?</h2>
          <p className="text-sm text-brand-slate mb-4">
            {tool.pricing === 'free'
              ? `${tool.name} is completely free. No credit card required.`
              : tool.pricing === 'freemium'
              ? `${tool.name} offers a free tier so you can try it without commitment.`
              : `${tool.name} offers a free trial so you can test it before you buy.`
            }
          </p>
          <a
            href={visitUrl}
            target="_blank"
            rel={`noopener noreferrer${isAffiliate ? ' sponsored' : ''}`}
            className="inline-flex items-center gap-2 bg-brand-sky hover:bg-brand-skyDark text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
          >
            Visit {tool.name} <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-brand-navy">Similar tools in {tool.category}</h3>
              <Link href="/best-ai-tools" className="text-xs text-brand-sky hover:underline">View all tools →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedTools.map((related: any) => {
                const rPricing = PRICING_INFO[related.pricing] || PRICING_INFO.freemium
                return (
                  <Link key={related.slug} href={`/tool/${related.slug}`}
                    className="bg-white border border-brand-border rounded-xl p-4 hover:border-brand-sky hover:shadow-sm transition-all group flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-sm font-bold text-brand-slate shrink-0 overflow-hidden">
                      {related.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={related.logo_url} alt={related.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span>{related.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-brand-navy group-hover:text-brand-sky transition-colors">{related.name}</h4>
                      <p className="text-[11px] text-brand-slate line-clamp-1 mt-0.5">{related.description}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded mt-1.5 inline-block ${rPricing.color.split(' ').slice(0, 2).join(' ')}`}>
                        {rPricing.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Newsletter CTA */}
        <NewsletterForm variant="inline" />
      </main>

      <Footer />
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = await getTool(params.slug)
  if (!tool) return {}
  const pricing = PRICING_INFO[tool.pricing] || PRICING_INFO.freemium
  return {
    title: `${tool.name} Review — ${pricing.label} AI Tool | AI Foresights`,
    description: `${tool.name}: ${tool.description || 'AI tool review.'} ${pricing.desc} Read our honest review.`,
    keywords: [tool.name, `${tool.name} review`, `${tool.name} pricing`, 'AI tools', tool.category, 'AI tool review'].filter(Boolean),
    openGraph: {
      title: `${tool.name} — AI Foresights`,
      description: tool.description || '',
      url: `https://www.aiforesights.com/tool/${params.slug}`,
      siteName: 'AI Foresights',
      type: 'article',
      images: tool.logo_url ? [{ url: tool.logo_url, alt: tool.name }] : [{ url: 'https://www.aiforesights.com/logo-full.png' }],
    },
    twitter: { card: 'summary', title: `${tool.name} — AI Foresights`, description: tool.description || '' },
    alternates: { canonical: `https://www.aiforesights.com/tool/${params.slug}` },
  }
}
