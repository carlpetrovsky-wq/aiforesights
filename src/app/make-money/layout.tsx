import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Make Money with AI — Side Hustles, Freelance & Income Ideas | AI Foresights',
  description: 'Real ways to earn extra income using AI tools — side hustles, freelance gigs, and passive income strategies explained in plain English. No tech background needed.',
  keywords: ['make money with AI', 'AI side hustles', 'AI freelance', 'AI income ideas', 'earn money AI tools', 'AI passive income'],
  openGraph: {
    title: 'Make Money with AI — AI Foresights',
    description: 'Real side hustles, freelance opportunities, and income strategies using AI tools — no tech background needed.',
    url: 'https://www.aiforesights.com/make-money',
    siteName: 'AI Foresights',
    type: 'website',
    images: [{ url: 'https://www.aiforesights.com/logo-full.png', width: 1280, height: 1024, alt: 'AI Foresights — Make Money with AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Make Money with AI — AI Foresights',
    description: 'Real side hustles and income strategies using AI tools.',
    images: ['https://www.aiforesights.com/logo-full.png'],
  },
  alternates: {
    canonical: 'https://www.aiforesights.com/make-money',
  },
}

export default function MakeMoneyLayout({ children }: { children: React.ReactNode }) {
  return children
}
