import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Latest AI News — Breaking Developments in Plain English | AI Foresights',
  description: 'Breaking AI news explained in plain English. Daily updates on ChatGPT, Google Gemini, Claude, and more — for professionals who want to stay informed without the jargon.',
  keywords: ['AI news', 'latest AI news', 'artificial intelligence news', 'ChatGPT news', 'AI updates today', 'AI developments'],
  openGraph: {
    title: 'Latest AI News — AI Foresights',
    description: 'Breaking AI developments explained in plain English. Updated daily from top sources.',
    url: 'https://www.aiforesights.com/latest-news',
    siteName: 'AI Foresights',
    type: 'website',
    images: [{ url: 'https://www.aiforesights.com/logo-full.png', width: 1280, height: 1024, alt: 'AI Foresights — Latest AI News' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest AI News — AI Foresights',
    description: 'Breaking AI developments explained in plain English.',
    images: ['https://www.aiforesights.com/logo-full.png'],
  },
  alternates: {
    canonical: 'https://www.aiforesights.com/latest-news',
  },
}

export default function LatestNewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
