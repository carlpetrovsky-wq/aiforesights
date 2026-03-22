import Link from 'next/link'
import Image from 'next/image'

const FOOTER_LINKS = {
  Explore: [
    { href: '/latest-news',   label: 'Latest news' },
    { href: '/future-of-ai',  label: 'Future of AI' },
    { href: '/best-ai-tools', label: 'Best AI tools' },
    { href: '/make-money',    label: 'Make money with AI' },
    { href: '/learn-ai',      label: 'Learn AI' },
  ],
  Company: [
    { href: '/about',     label: 'About us' },
    { href: '/newsletter',label: 'Newsletter' },
    { href: '/advertise', label: 'Advertise' },
    { href: '/contact',   label: 'Contact' },
  ],
  Legal: [
    { href: '/privacy',  label: 'Privacy policy' },
    { href: '/terms',    label: 'Terms of use' },
    { href: '/cookies',  label: 'Cookie settings' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-brand-navy mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-brand-sky rounded-md flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1l1.2 3.6H11L8.1 6.4l1.1 3.6L6 8 2.9 10l1.1-3.6L1 4.6h3.8z" fill="white"/>
                </svg>
              </div>
              <span className="font-semibold text-sm text-white">
                AI <span className="text-brand-skyLight">Foresights</span>
              </span>
            </div>
            <p className="text-xs text-brand-slate leading-relaxed mb-3">
              The world of AI, explained for everyday professionals. Daily news, tool reviews, and plain-English guides. No jargon required.
            </p>
            <p className="text-xs text-brand-navyLight italic">
              &ldquo;A New Dawn Is Here&rdquo;
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h5 className="text-xs font-semibold text-white mb-3 tracking-wide uppercase">{section}</h5>
              <ul className="space-y-1.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-brand-slate hover:text-brand-skyLight transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-brand-navyMid pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-xs text-brand-navyLight">© 2026 AI Foresights. All rights reserved.</span>
          <span className="text-xs text-brand-navyLight">Powered by AI · Built for humans</span>
        </div>
      </div>
    </footer>
  )
}
