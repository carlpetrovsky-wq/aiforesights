import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn AI — Free Courses, Videos & Guides for Beginners | AI Foresights',
  description: 'Learn artificial intelligence at your own pace. Free and paid courses, videos, books, and guides — sorted by skill level, from complete beginners to advanced professionals.',
  keywords: ['learn AI', 'AI courses for beginners', 'AI tutorials', 'artificial intelligence courses', 'learn AI free', 'AI for professionals'],
  openGraph: {
    title: 'Learn AI — AI Foresights',
    description: 'Courses, videos, and guides for professionals — from complete beginners to advanced. Learn AI at your own pace.',
    url: 'https://www.aiforesights.com/learn-ai',
    siteName: 'AI Foresights',
    type: 'website',
    images: [{ url: 'https://www.aiforesights.com/logo-full.png', width: 1280, height: 1024, alt: 'AI Foresights — Learn AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn AI — AI Foresights',
    description: 'Free courses, videos, and guides for professionals learning AI.',
    images: ['https://www.aiforesights.com/logo-full.png'],
  },
  alternates: {
    canonical: 'https://www.aiforesights.com/learn-ai',
  },
}

export default function LearnAILayout({ children }: { children: React.ReactNode }) {
  return children
}
