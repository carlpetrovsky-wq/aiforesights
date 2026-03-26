import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import { createClient } from '@supabase/supabase-js'
import '../styles/globals.css'

export const dynamic = 'force-dynamic'

const dmSans = DM_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const dmMono = DM_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'AI Foresights — A New Dawn Is Here',
  description: 'The world of AI explained in plain English. Daily news, tool reviews, and guides for professionals navigating the AI revolution. No jargon. No coding required.',
  keywords: ['AI news', 'artificial intelligence', 'AI tools', 'AI for beginners', 'machine learning news'],
  authors: [{ name: 'AI Foresights' }],
  icons: {
    icon: '/favicon.png',
    apple: '/logo-icon.png',
  },
  openGraph: {
    title: 'AI Foresights — A New Dawn Is Here',
    description: 'The world of AI explained in plain English. Daily news, tools, and guides.',
    url: 'https://aiforesights.com',
    siteName: 'AI Foresights',
    type: 'website',
    images: [{ url: 'https://aiforesights.com/logo-full.png', width: 1280, height: 1024, alt: 'AI Foresights' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Foresights',
    description: 'The world of AI explained in plain English.',
    images: ['https://aiforesights.com/logo-full.png'],
  },
  robots: { index: true, follow: true },
}

async function getSiteSettings() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('settings')
      .select('key,value')
      .in('key', ['adsense_publisher_id', 'google_site_verification', 'google_analytics_id'])
    return Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
  } catch {
    return {}
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const adsenseId = settings.adsense_publisher_id || 'ca-pub-2829226345242067'
  const googleVerification = settings.google_site_verification || ''
  const gaId = settings.google_analytics_id || 'G-BT4VB5E79M'

  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <head>
        {/* Google site verification */}
        {googleVerification && (
          <meta name="google-site-verification" content={googleVerification} />
        )}
        {/* Impact.com domain verification */}
        <meta name="impact-site-verification" value="dcaff389-1fb1-454a-b7d6-9275d8eb1579" />

        {/* Google Analytics */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`
              }}
            />
          </>
        )}

        {/* Google AdSense - plain script tag required, Next.js Script component adds data-nscript which breaks AdSense crawler */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-brand-bg">{children}</body>
    </html>
  )
}
