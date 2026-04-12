import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = {
  title: 'Best AI Tools 2026 — Ranked & Reviewed for Every Level | AI Foresights',
  description: 'The best AI tools of 2026, ranked and reviewed in plain English. Free and paid options for beginners, professionals, and business owners. Updated weekly.',
  keywords: ['best AI tools', 'best AI tools 2026', 'AI tools for beginners', 'AI tools ranked', 'AI software reviews', 'top AI tools'],
  openGraph: {
    title: 'Best AI Tools 2026 — AI Foresights',
    description: 'Ranked, reviewed, and explained without the jargon. Free and paid options for every level.',
    url: 'https://www.aiforesights.com/best-ai-tools',
    siteName: 'AI Foresights',
    type: 'website',
    images: [{ url: 'https://www.aiforesights.com/logo-full.png', width: 1280, height: 1024, alt: 'AI Foresights — Best AI Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best AI Tools 2026 — AI Foresights',
    description: 'The best AI tools of 2026, ranked and reviewed in plain English.',
    images: ['https://www.aiforesights.com/logo-full.png'],
  },
  alternates: {
    canonical: 'https://www.aiforesights.com/best-ai-tools',
  },
}

async function getTopTools() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('tools')
      .select('name, slug, description')
      .eq('status', 'published')
      .order('save_count', { ascending: false })
      .limit(12)
    return data || []
  } catch {
    return []
  }
}

export default async function BestAIToolsLayout({ children }: { children: React.ReactNode }) {
  const tools = await getTopTools()

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best AI Tools 2026',
    description: 'Top-rated AI tools curated by AI Foresights for everyday professionals.',
    url: 'https://www.aiforesights.com/best-ai-tools',
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      description: tool.description || '',
      url: `https://www.aiforesights.com/tool/${tool.slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {children}
    </>
  )
}

