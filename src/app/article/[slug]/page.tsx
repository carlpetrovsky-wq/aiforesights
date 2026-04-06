import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ExternalLink, ArrowLeft, Clock, User } from 'lucide-react'
import ArticleFooter from '@/components/article/ArticleFooter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const CATEGORY_FALLBACKS: Record<string, string> = {
  'latest-news':   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80',
  'future-of-ai':  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80',
  'best-ai-tools': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
  'make-money':    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80',
  'learn-ai':      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
}

async function getArticle(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)
  if (!article) notFound()
  const isOwnContent = article.source_name === 'AI Foresights' || (article.source_url || '').includes('aiforesights.com')
  const relatedArticles = await getRelatedArticles(params.slug, article.category_slug || 'latest-news')

  const image = article.thumbnail_url || CATEGORY_FALLBACKS[article.category_slug] || CATEGORY_FALLBACKS['latest-news']
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null
  const categoryLabel = (article.category_slug || 'latest-news').replace(/-/g, ' ')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': isOwnContent ? 'Article' : 'NewsArticle',
    headline: article.title,
    description: article.summary || article.excerpt || '',
    image: image,
    datePublished: article.published_at || new Date().toISOString(),
    dateModified: article.updated_at || article.published_at || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: isOwnContent ? 'AI Foresights Staff' : (article.source_name || 'AI Foresights'),
      url: 'https://www.aiforesights.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Foresights',
      url: 'https://www.aiforesights.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.aiforesights.com/logo.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.aiforesights.com/article/${params.slug}`,
    },
    keywords: `AI, artificial intelligence, ${(article.category_slug || '').replace(/-/g, ' ')}, AI news, AI tools`,
    articleSection: (article.category_slug || '').replace(/-/g, ' '),
    inLanguage: 'en-US',
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar />
      {/* JSON-LD structured data for Google + AI crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-brand-slate hover:text-brand-sky transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        {/* Category pill */}
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-sky bg-brand-sky/10 px-2.5 py-1 rounded mb-3 capitalize">
          {categoryLabel}
        </span>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy leading-tight mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-brand-slate mb-6">
          {article.source_name && (
            <span className="font-medium text-brand-navy">{article.source_name}</span>
          )}
          {article.author && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> {article.author}
            </span>
          )}
          {publishedDate && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {publishedDate}
            </span>
          )}
        </div>

        {/* Hero image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={article.title}
          className="w-full aspect-video object-cover rounded-xl mb-6 shadow-sm"
        />

        {(() => {
          const isOwnContent = article.source_name === 'AI Foresights' || article.source_url?.includes('aiforesights.com')
          if (isOwnContent) {
            const body = (article as any).content || article.summary || article.excerpt || ''
            if (!body) return null
            const blocks = body.split('\n').filter(Boolean)

            // Renders inline markdown: **bold**, [text](url), and **[text](url)**
            const renderInline = (text: string, keyPrefix: string) => {
              // Order matters: bold-link combo must be matched before plain bold or plain link
              const parts = text.split(/(\*\*\[[^\]]+\]\([^)]+\)\*\*|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/)
              return parts.map((part: string, j: number) => {
                // **[text](url)** — bold link
                const boldLinkMatch = part.match(/^\*\*\[([^\]]+)\]\(([^)]+)\)\*\*$/)
                if (boldLinkMatch) {
                  return (
                    <a key={`${keyPrefix}-${j}`} href={boldLinkMatch[2]} target="_blank" rel="noopener noreferrer"
                      className="font-bold text-brand-sky hover:text-brand-skyDark underline underline-offset-2 transition-colors">
                      {boldLinkMatch[1]}
                    </a>
                  )
                }
                // **bold**
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={`${keyPrefix}-${j}`}>{part.slice(2, -2)}</strong>
                }
                // [text](url)
                const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
                if (linkMatch) {
                  return (
                    <a key={`${keyPrefix}-${j}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
                      className="text-brand-sky hover:text-brand-skyDark underline underline-offset-2 transition-colors">
                      {linkMatch[1]}
                    </a>
                  )
                }
                return part
              })
            }

            return (
              <div className="prose prose-base max-w-none text-brand-slate mb-8 leading-relaxed space-y-4">
                {blocks.map((block: string, i: number) => {
                  if (block.startsWith('## ')) {
                    return <h2 key={i} className="text-xl font-bold text-brand-navy mt-8 mb-3">{block.slice(3)}</h2>
                  }
                  if (block.startsWith('### ')) {
                    return <h3 key={i} className="text-lg font-semibold text-brand-navy mt-6 mb-2">{block.slice(4)}</h3>
                  }
                  if (block.startsWith('- ')) {
                    return <li key={i} className="ml-4 list-disc leading-relaxed">{renderInline(block.slice(2), `li-${i}`)}</li>
                  }
                  if (block.includes('**') || block.match(/\[[^\]]+\]\([^)]+\)/)) {
                    return <p key={i} className="leading-relaxed">{renderInline(block, `p-${i}`)}</p>
                  }
                  return <p key={i} className="leading-relaxed">{block}</p>
                })}
              </div>
            )
          } else {
            // External RSS articles: show AI Summary box + excerpt
            return (
              <>
                {article.summary && (
                  <div className="bg-brand-sky/5 border border-brand-sky/20 rounded-xl p-5 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-brand-sky uppercase tracking-wider">AI Summary</span>
                      <span className="text-xs text-brand-slate">— plain English for professionals</span>
                    </div>
                    <p className="text-brand-navy text-sm leading-relaxed">{article.summary}</p>
                  </div>
                )}
                {article.excerpt && (
                  <div className="prose prose-sm max-w-none text-brand-slate mb-8">
                    <p className="leading-relaxed">{article.excerpt}</p>
                  </div>
                )}
              </>
            )
          }
        })()}

        {/* Read full article CTA — only for external sources */}
        {article.source_url && article.source_name !== 'AI Foresights' && !article.source_url.includes('aiforesights.com') && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-brand-sky hover:bg-brand-skyDark text-white font-medium rounded-lg transition text-sm mb-8"
          >
            Read full article on {article.source_name || 'source'}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Brand footer — own content only */}
        {isOwnContent && (
          <div className="border border-brand-sky/20 bg-gradient-to-br from-brand-sky/5 to-brand-navy/5 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-transparent.svg" alt="AI Foresights" className="w-10 h-10 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-brand-navy mb-1">Want more plain-English AI news?</p>
                <p className="text-sm text-brand-slate leading-relaxed mb-3">
                  AI Foresights covers the latest AI developments, side income ideas, and tool reviews — written for everyday professionals, not tech experts.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-sky hover:bg-brand-skyDark px-3.5 py-2 rounded-lg transition-colors"
                  >
                    Explore AI Foresights →
                  </Link>
                  <Link
                    href="/#newsletter"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-sky border border-brand-sky/40 hover:bg-brand-sky/10 px-3.5 py-2 rounded-lg transition-colors"
                  >
                    Subscribe free — it&apos;s worth it
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article footer: share, star rating, related articles, newsletter CTA, back to top */}
        <ArticleFooter
          articleSlug={params.slug}
          category={article.category_slug || 'latest-news'}
          relatedArticles={relatedArticles}
          isOwnContent={isOwnContent}
        />
      </main>

      <Footer />
    </div>
  )
}

async function getRelatedArticles(slug: string, category: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('articles')
    .select('slug, title, thumbnail_url, category_slug')
    .eq('category_slug', category)
    .eq('status', 'published')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(3)
  return data || []
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)
  if (!article) return {}

  const description = article.summary || article.excerpt || 'AI news explained in plain English.'
  const ogImageUrl = `https://www.aiforesights.com/api/og?${new URLSearchParams({
    title: article.title,
    category: article.category_slug || '',
    source: article.source_name || '',
  }).toString()}`

  return {
    title: `${article.title} — AI Foresights`,
    description,
    openGraph: {
      title: article.title,
      description,
      url: `https://www.aiforesights.com/article/${params.slug}`,
      siteName: 'AI Foresights',
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [ogImageUrl],
    },
  }
}
