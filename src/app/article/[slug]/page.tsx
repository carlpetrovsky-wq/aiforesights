import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ExternalLink, ArrowLeft, Clock, User } from 'lucide-react'

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

  const image = article.thumbnail_url || CATEGORY_FALLBACKS[article.category_slug] || CATEGORY_FALLBACKS['latest-news']
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null
  const categoryLabel = (article.category_slug || 'latest-news').replace(/-/g, ' ')

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar />

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

        {/* AI Summary box */}
        {article.summary && (
          <div className="bg-brand-sky/5 border border-brand-sky/20 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-brand-sky uppercase tracking-wider">AI Summary</span>
              <span className="text-xs text-brand-slate">— plain English for professionals</span>
            </div>
            <p className="text-brand-navy text-sm leading-relaxed">{article.summary}</p>
          </div>
        )}

        {/* Excerpt / full content if available */}
        {article.excerpt && (
          <div className="prose prose-sm max-w-none text-brand-slate mb-8">
            <p className="leading-relaxed">{article.excerpt}</p>
          </div>
        )}

        {/* Read full article CTA */}
        {article.source_url && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-brand-sky hover:bg-brand-skyDark text-white font-medium rounded-lg transition text-sm"
          >
            Read full article on {article.source_name || 'source'}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </main>

      <Footer />
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)
  if (!article) return {}
  return {
    title: `${article.title} — AI Foresights`,
    description: article.summary || article.excerpt || '',
    openGraph: {
      title: article.title,
      description: article.summary || article.excerpt || '',
      images: article.thumbnail_url ? [article.thumbnail_url] : [],
    },
  }
}
