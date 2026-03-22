'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',              label: 'Home' },
  { href: '/latest-news',   label: 'Latest news' },
  { href: '/future-of-ai',  label: 'Future of AI' },
  { href: '/best-ai-tools', label: 'AI tools' },
  { href: '/learn-ai',      label: 'Learn AI' },
  { href: '/make-money',    label: 'Make money' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-brand-navy rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5l1.4 4.2h4.4l-3.6 2.6 1.4 4.2L7 10 3.5 12.5l1.4-4.2L1.2 5.7h4.4z" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-[15px] text-brand-navy tracking-tight">
              AI <span className="text-brand-sky">Foresights</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-colors',
                  pathname === link.href
                    ? 'bg-blue-50 text-brand-sky font-medium'
                    : 'text-brand-slate hover:text-brand-navy hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/#newsletter"
              className="hidden sm:block btn-primary text-sm"
            >
              Subscribe free
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
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
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-blue-50 text-brand-sky'
                    : 'text-brand-slate hover:text-brand-navy hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#newsletter"
              onClick={() => setMobileOpen(false)}
              className="mt-2 btn-primary text-center text-sm"
            >
              Subscribe free
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
