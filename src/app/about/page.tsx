import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Newspaper, Zap, Users, Target, Shield, Rss } from 'lucide-react'

export const metadata = {
  title: 'About Us — AI Foresights',
  description: 'Learn about AI Foresights — who we are, why we built this, and our mission to make AI understandable for everyday professionals.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-brand-navy py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-white mb-3">About AI Foresights</h1>
          <p className="text-brand-muted text-base leading-relaxed">
            We believe the AI revolution shouldn't be confusing. Our mission is to make it accessible — for everyone.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 space-y-12">

        {/* Mission */}
        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-4">Why We Built This</h2>
          <p className="text-brand-slate leading-relaxed mb-4">
            Artificial intelligence is changing every industry, every profession, and every workplace — faster than anyone expected. But most of the coverage is written for engineers, investors, and researchers. If you're a business owner, a manager, a marketer, or a professional trying to stay ahead, most AI news reads like a foreign language.
          </p>
          <p className="text-brand-slate leading-relaxed mb-4">
            AI Foresights was built to fix that. We translate the noise into plain English — giving you the signal you actually need to understand what's happening, what matters, and what you can do about it today.
          </p>
          <p className="text-brand-slate leading-relaxed">
            No jargon. No coding required. No hype. Just clear, practical AI coverage for people who have real work to do.
          </p>
        </section>

        {/* What We Do */}
        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-6">What You Get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Newspaper, title: 'Daily AI News', desc: 'Top stories from across the web, summarized in plain English and published every morning.' },
              { icon: Zap, title: 'Tool Reviews', desc: 'Honest, hands-on reviews of the best AI tools — with clear guidance on who each one is actually for.' },
              { icon: Target, title: 'Practical Guides', desc: 'Step-by-step content on how to use AI in your actual job — not theoretical fluff.' },
              { icon: Rss, title: 'Weekly Digest', desc: 'The top 5 AI stories and best new tools, delivered to your inbox every week. Free forever.' },
              { icon: Users, title: 'Built for Professionals', desc: 'We write for business owners, marketers, managers, and anyone navigating AI without a technical background.' },
              { icon: Shield, title: 'Independent Coverage', desc: 'We are not funded by AI companies. Our coverage is editorially independent. Tool ratings are our honest assessment.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-brand-border rounded-xl p-4 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-brand-sky" />
                  <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
                </div>
                <p className="text-xs text-brand-slate leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-4">Who We Write For</h2>
          <p className="text-brand-slate leading-relaxed mb-4">
            AI Foresights is written for professionals who know AI is important but don't have time to filter through technical papers, Twitter threads, and venture capital blogs to figure out what actually matters for their work.
          </p>
          <p className="text-brand-slate leading-relaxed">
            Our readers are business owners, marketing and operations professionals, executives, consultants, educators, and career professionals across every industry — people who want to stay ahead of the curve without becoming engineers.
          </p>
        </section>

        {/* Editorial */}
        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-4">Our Editorial Approach</h2>
          <p className="text-brand-slate leading-relaxed mb-4">
            Every article on AI Foresights is sourced from reputable publications including TechCrunch, Wired, MIT Technology Review, The Verge, VentureBeat, and Ars Technica. We use AI to help write plain-English summaries — because it would be ironic not to — but every summary is reviewed for accuracy and clarity before it goes live.
          </p>
          <p className="text-brand-slate leading-relaxed">
            We clearly label AI-assisted content, sponsored placements, and affiliate links. Transparency is non-negotiable.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-brand-navy rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Stay in the Loop</h2>
          <p className="text-brand-muted text-sm mb-5">Join thousands of professionals getting weekly AI news in plain English.</p>
          <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
        </section>

      </main>
      <Footer />
    </div>
  )
}
