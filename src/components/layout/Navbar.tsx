'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',              label: 'Home' },
  { href: '/latest-news',   label: 'Latest news' },
  { href: '/future-of-ai',  label: 'Future of AI' },
  { href: '/best-ai-tools', label: 'AI tools' },
  { href: '/learn-ai',      label: 'Learn AI' },
  { href: '/make-money',    label: 'Make money' },
]

const MEDIA_LINKS = [
  { href: '/ai-video-of-the-week', label: '▶ Video of the Week' },
  { href: '/ai-podcast-roundup',   label: '🎧 Podcast Roundup' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const mediaRef = useRef<HTMLDivElement>(null)

  const isMediaActive = MEDIA_LINKS.some(l => pathname === l.href)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (mediaRef.current && !mediaRef.current.contains(e.target as Node)) {
        setMediaOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo-horizontal.png"
              alt="AI Foresights — A New Dawn Is Here"
              width={1321}
              height={200}
              className="h-10 w-auto object-contain sm:h-12"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap',
                  pathname === link.href
                    ? 'bg-blue-50 text-brand-sky font-medium'
                    : 'text-brand-slate hover:text-brand-navy hover:bg-gray-50'
                )}>
                {link.label}
              </Link>
            ))}

            {/* Media dropdown */}
            <div ref={mediaRef} className="relative">
              <button
                onClick={() => setMediaOpen(!mediaOpen)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap',
                  isMediaActive
                    ? 'bg-blue-50 text-brand-sky font-medium'
                    : 'text-brand-slate hover:text-brand-navy hover:bg-gray-50'
                )}>
                Media
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mediaOpen ? 'rotate-180' : ''}`} />
              </button>
              {mediaOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-brand-border rounded-xl shadow-lg py-1.5 z-50">
                  {MEDIA_LINKS.map(link => (
                    <Link key={link.href} href={link.href}
                      onClick={() => setMediaOpen(false)}
                      className={cn(
                        'flex items-center px-3.5 py-2 text-sm transition-colors',
                        pathname === link.href
                          ? 'text-brand-sky font-medium bg-blue-50'
                          : 'text-brand-slate hover:text-brand-navy hover:bg-gray-50'
                      )}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/#newsletter" className="hidden sm:block btn-primary text-sm">
              Subscribe free
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-border bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-blue-50 text-brand-sky'
                    : 'text-brand-slate hover:text-brand-navy hover:bg-gray-50'
                )}>
                {link.label}
              </Link>
            ))}
            {/* Media links flat in mobile */}
            <div className="mt-1 border-t border-brand-border pt-2">
              <p className="px-3 text-[10px] font-semibold text-brand-muted uppercase tracking-wider mb-1">Media</p>
              {MEDIA_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors block',
                    pathname === link.href
                      ? 'bg-blue-50 text-brand-sky'
                      : 'text-brand-slate hover:text-brand-navy hover:bg-gray-50'
                  )}>
                  {link.label}
                </Link>
              ))}
            </div>
            <Link href="/#newsletter" onClick={() => setMobileOpen(false)}
              className="mt-2 btn-primary text-center text-sm">
              Subscribe free
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
