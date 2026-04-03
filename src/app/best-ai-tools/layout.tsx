import type { Metadata } from 'next'

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

export default function BestAIToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
