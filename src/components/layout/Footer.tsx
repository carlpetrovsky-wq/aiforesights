import Link from 'next/link'

const FOOTER_LINKS = {
  Explore: [
    { href: '/latest-news',   label: 'Latest news' },
    { href: '/future-of-ai',  label: 'Future of AI' },
    { href: '/best-ai-tools', label: 'Best AI tools' },
    { href: '/make-money',    label: 'Make money with AI' },
    { href: '/learn-ai',      label: 'Learn AI' },
  ],
  Company: [
    { href: '/about',      label: 'About us' },
    { href: '/newsletter', label: 'Newsletter' },
    { href: '/advertise',  label: 'Advertise' },
    { href: '/contact',    label: 'Contact' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy policy' },
    { href: '/terms',   label: 'Terms of use' },
    { href: '/cookies', label: 'Cookie settings' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-brand-navy mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="block mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-horizontal.png"
                alt="AI Foresights"
                className="h-10 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <p className="text-xs text-brand-slate leading-relaxed mb-4">
              The world of AI, explained for everyday professionals. Daily news, tool reviews, and plain-English guides. No jargon required.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/AIForesights"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-slate hover:text-white transition-colors"
                aria-label="Follow AI Foresights on X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h5 className="text-xs font-semibold text-white mb-3 tracking-wide uppercase">{section}</h5>
              <ul className="space-y-1.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-xs text-brand-slate hover:text-brand-skyLight transition-colors">
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
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/AIForesights"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-navyLight hover:text-brand-skyLight transition-colors text-xs flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Follow us on X
            </a>
            <span className="text-brand-navyLight">·</span>
            <span className="text-xs text-brand-navyLight">Powered by AI · Built for humans</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
