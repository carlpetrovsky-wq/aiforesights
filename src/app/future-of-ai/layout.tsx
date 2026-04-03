import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Future of AI — Trends, Predictions & What\'s Coming | AI Foresights',
  description: 'AI trends, forecasts, and what\'s coming next — explained for everyday professionals. Understand how AI will impact your industry, your job, and your life.',
  keywords: ['future of AI', 'AI trends 2026', 'AI predictions', 'AI forecast', 'artificial intelligence future', 'AI industry impact'],
  openGraph: {
    title: 'Future of AI — AI Foresights',
    description: 'Trends, forecasts, and what\'s coming — explained for everyday professionals. No jargon required.',
    url: 'https://www.aiforesights.com/future-of-ai',
    siteName: 'AI Foresights',
    type: 'website',
    images: [{ url: 'https://www.aiforesights.com/logo-full.png', width: 1280, height: 1024, alt: 'AI Foresights — Future of AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Future of AI — AI Foresights',
    description: 'AI trends and predictions explained for everyday professionals.',
    images: ['https://www.aiforesights.com/logo-full.png'],
  },
  alternates: {
    canonical: 'https://www.aiforesights.com/future-of-ai',
  },
}

export default function FutureOfAILayout({ children }: { children: React.ReactNode }) {
  return children
}
