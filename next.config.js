/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
  },
  generateBuildId: async () => `build-${Date.now()}`,
  async redirects() {
    return [
      // WordPress date-based post URLs → Latest News
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug*',
        destination: '/latest-news',
        permanent: true,
      },
      // WordPress category URLs → matching section or homepage
      {
        source: '/category/latest/:slug*',
        destination: '/latest-news',
        permanent: true,
      },
      {
        source: '/category/ai-tools/:slug*',
        destination: '/best-ai-tools',
        permanent: true,
      },
      {
        source: '/category/make-money/:slug*',
        destination: '/make-money',
        permanent: true,
      },
      {
        source: '/category/learn/:slug*',
        destination: '/learn-ai',
        permanent: true,
      },
      {
        source: '/category/future/:slug*',
        destination: '/future-of-ai',
        permanent: true,
      },
      {
        source: '/category/:slug*',
        destination: '/',
        permanent: true,
      },
      // WordPress tag URLs → homepage
      {
        source: '/tag/:slug*',
        destination: '/',
        permanent: true,
      },
      // WordPress author URLs → about page
      {
        source: '/author/:slug*',
        destination: '/about',
        permanent: true,
      },
      // WordPress feed URLs → homepage
      {
        source: '/feed/:slug*',
        destination: '/',
        permanent: true,
      },
      // WordPress page pagination
      {
        source: '/page/:num',
        destination: '/latest-news',
        permanent: true,
      },
      // WordPress wp-content/uploads → homepage (broken media links)
      {
        source: '/wp-content/:slug*',
        destination: '/',
        permanent: true,
      },
      // WordPress admin
      {
        source: '/wp-admin/:slug*',
        destination: '/',
        permanent: true,
      },
      // Non-www to www (belt and suspenders — Vercel handles this but good to be explicit)
      // Note: Vercel handles the domain redirect, this is for any edge cases

      // WordPress comments feeds → homepage
      {
        source: '/comments/feed/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/comments/feed',
        destination: '/',
        permanent: true,
      },
      // WordPress article comment feeds
      {
        source: '/:slug/feed/:rest*',
        destination: '/',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      // Proxy Supabase-stored OG images as static-looking .png URLs on our domain.
      // X's Twitterbot won't fetch images from dynamic API routes or Supabase (Cloudflare blocks it).
      // Vercel rewrites proxy at the infrastructure level — fast, static-looking, no Node.js involved.
      {
        source: '/og/:slug.png',
        destination: 'https://vlavisroxzwifprjzcar.supabase.co/storage/v1/object/public/og-images/og/:slug.png',
      },
    ]
  },
}

module.exports = nextConfig
