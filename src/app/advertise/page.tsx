import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Users, TrendingUp, Target, Mail } from 'lucide-react'

export const metadata = {
  title: 'Advertise — AI Foresights',
  description: 'Reach thousands of professionals navigating the AI revolution. Advertising opportunities on AI Foresights.',
}

export default function AdvertisePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-white mb-3">Advertise on AI Foresights</h1>
          <p className="text-brand-muted text-base leading-relaxed">
            Connect your brand with a highly engaged audience of professionals actively learning and adopting AI tools.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 space-y-12">

        {/* Audience */}
        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-6">Our Audience</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: Users, stat: 'Growing Daily', label: 'Newsletter subscribers' },
              { icon: TrendingUp, stat: 'High Intent', label: 'Actively adopting AI tools' },
              { icon: Target, stat: 'Decision Makers', label: 'Business owners & managers' },
            ].map(({ icon: Icon, stat, label }) => (
              <div key={label} className="border border-brand-border rounded-xl p-5 bg-white text-center">
                <Icon className="w-5 h-5 text-brand-sky mx-auto mb-2" />
                <div className="text-lg font-bold text-brand-navy">{stat}</div>
                <div className="text-xs text-brand-slate mt-1">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-brand-slate leading-relaxed">
            AI Foresights readers are professionals actively seeking AI tools, news, and education to stay competitive in their industries. They are business owners, marketing and operations professionals, executives, and consultants — with above-average purchasing power and a high intent to adopt new technology.
          </p>
        </section>

        {/* Ad Placements */}
        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-6">Ad Placements</h2>
          <div className="space-y-3">
            {[
              { name: 'Top Leaderboard', size: '728×90', location: 'Above the fold, homepage and all category pages', best: 'Brand awareness' },
              { name: 'Sidebar Rectangle', size: '300×250', location: 'Right sidebar, alongside article feed', best: 'Product promotion' },
              { name: 'In-Feed Sponsored', size: 'Native', location: 'Between article sections in the main feed', best: 'Content & tool promotion' },
              { name: 'Bottom Leaderboard', size: '728×90', location: 'Below article content, all pages', best: 'Retargeting & CTAs' },
              { name: 'Newsletter Sponsor', size: 'Native', location: 'Featured placement in weekly email digest', best: 'Direct response' },
            ].map(p => (
              <div key={p.name} className="border border-brand-border rounded-xl p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-brand-navy">{p.name}</span>
                    <span className="text-[10px] bg-blue-50 text-brand-sky px-2 py-0.5 rounded-full font-medium">{p.size}</span>
                  </div>
                  <p className="text-xs text-brand-slate">{p.location}</p>
                </div>
                <div className="text-xs text-brand-muted shrink-0">Best for: <span className="text-brand-sky font-medium">{p.best}</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* What We Promote */}
        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-4">What We Promote</h2>
          <p className="text-brand-slate leading-relaxed mb-3">We accept advertising from brands that are genuinely relevant to our audience, including:</p>
          <ul className="space-y-2 text-sm text-brand-slate">
            {[
              'AI tools and SaaS platforms',
              'Online courses and professional education',
              'Business productivity software',
              'Books and publications on technology and business',
              'Enterprise technology solutions',
              'Consulting and professional services related to AI adoption',
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-sky shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-brand-muted mt-4">All sponsored content is clearly labeled. We do not accept ads for crypto, gambling, or content unrelated to professional development and technology.</p>
        </section>

        {/* CTA */}
        <section className="bg-brand-navy rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-brand-sky/20 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-brand-skyLight" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Get in Touch</h2>
              <p className="text-brand-muted text-sm mb-4">
                Reach out to discuss placements, pricing, and availability. We respond within one business day.
              </p>
              <a
                href="mailto:privacy@aiforesights.com?subject=Advertising Inquiry"
                className="btn-primary inline-block"
              >
                Contact us about advertising
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
