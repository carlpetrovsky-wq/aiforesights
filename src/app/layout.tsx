import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import '../styles/globals.css'

const inter = DM_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const interMono = Inter({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'AI Foresights — A New Dawn Is Here',
  description: 'The world of AI explained in plain English. Daily news, tool reviews, and guides for professionals navigating the AI revolution. No jargon. No coding required.',
  keywords: ['AI news', 'artificial intelligence', 'AI tools', 'AI for beginners', 'machine learning news'],
  authors: [{ name: 'AI Foresights' }],
  openGraph: {
    title: 'AI Foresights — A New Dawn Is Here',
    description: 'The world of AI explained in plain English. Daily news, tools, and guides.',
    url: 'https://aiforesights.com',
    siteName: 'AI Foresights',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Foresights',
    description: 'The world of AI explained in plain English.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${interMono.variable}`}>
      <body className="min-h-screen bg-brand-bg">{children}</body>
    </html>
  )
}
