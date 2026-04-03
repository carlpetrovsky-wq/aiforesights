'use client'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AdSlotProps {
  slot: string
  size?: 'leaderboard' | 'banner' | 'rectangle' | 'mobile'
  className?: string
}

// House ads promoting own content and newsletter until AdSense is approved
// When AdSense is live, this component will be updated to render real ad units

const HOUSE_ADS = {
  leaderboard: [
    {
      text: 'New to AI? Start here — free guides, tool reviews, and plain-English news.',
      cta: 'Explore AI Foresights',
      href: '/learn-ai',
      accent: 'bg-brand-sky',
    },
    {
      text: 'Get the top 5 AI stories every week — free, no jargon, no spam.',
      cta: 'Subscribe free',
      href: '/newsletter',
      accent: 'bg-brand-sky',
    },
  ],
  banner: [
    {
      text: 'Discover real ways to earn extra income with AI tools.',
      cta: 'Make money with AI →',
      href: '/make-money',
      accent: 'bg-amber-500',
    },
  ],
  rectangle: [
    {
      text: 'The best AI tools of 2026 — ranked, reviewed, and explained without the jargon.',
      cta: 'Browse tools',
      href: '/best-ai-tools',
      accent: 'bg-emerald-500',
    },
  ],
  mobile: [
    {
      text: 'Free weekly AI digest — plain English, no spam.',
      cta: 'Subscribe',
      href: '/newsletter',
      accent: 'bg-brand-sky',
    },
  ],
}

export default function AdSlot({ slot, size = 'leaderboard', className }: AdSlotProps) {
  const ads = HOUSE_ADS[size] || HOUSE_ADS.leaderboard
  const ad = ads[slot.length % ads.length]

  if (size === 'rectangle') {
    return (
      <div className={cn('rounded-xl border border-brand-border bg-white p-4', className)}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-sky/10 flex items-center justify-center">
            <span className="text-brand-sky text-sm font-bold">AI</span>
          </div>
          <p className="text-sm text-brand-slate leading-relaxed">{ad.text}</p>
          <Link
            href={ad.href}
            className={cn('text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity', ad.accent)}
          >
            {ad.cta}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'rounded-lg border border-brand-border bg-white flex items-center justify-center gap-3 px-4 py-2.5',
      className
    )}>
      <p className="text-xs text-brand-slate">{ad.text}</p>
      <Link
        href={ad.href}
        className={cn('shrink-0 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity', ad.accent)}
      >
        {ad.cta}
      </Link>
    </div>
  )
}
