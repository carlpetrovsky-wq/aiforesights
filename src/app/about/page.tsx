import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Newspaper, Wrench, DollarSign, GraduationCap, Heart, Check } from 'lucide-react'

export const metadata = {
  title: 'About Us — AI Foresights',
  description: 'AI Foresights helps everyday people understand AI, discover useful tools, and find new ways to earn money — all in plain language.',
  alternates: {
    canonical: 'https://www.aiforesights.com/about',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-white mb-4">AI Made Simple — For Everyone</h1>
          <p className="text-brand-muted text-base leading-relaxed max-w-xl">
            You don't need to be a computer expert to benefit from AI. AI Foresights is here to help you understand it, use it, and even make money with it — all in plain, everyday language.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 space-y-12">

        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-brand-navy mb-3">What Is AI Foresights?</h2>
          <p className="text-brand-slate leading-relaxed mb-4 text-base">
            Think of us as your friendly guide to the world of artificial intelligence. Every day, something new is happening with AI — new tools, new discoveries, new ways people are using it in their everyday lives and work.
          </p>
          <p className="text-brand-slate leading-relaxed text-base">
            Most AI coverage is written by tech people, for tech people. We write for everyone else — the business owner, the retiree exploring new income streams, the professional trying to stay current, the curious person who just wants to understand what all the fuss is about.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-6">Four Things We Do For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Newspaper, color: 'bg-blue-50', iconColor: 'text-brand-sky',
                title: 'Keep You Up to Date',
                desc: 'Every day we gather the most important AI news and rewrite it in plain English. No jargon, no confusing technical terms — just what\'s happening and why it matters to you. Takes less than 5 minutes to read.',
              },
              {
                icon: Wrench, color: 'bg-emerald-50', iconColor: 'text-emerald-600',
                title: 'Find the Right Tools',
                desc: 'There are hundreds of AI tools out there. We test them, review them honestly, and tell you which ones are actually worth your time — and which ones to skip. We tell you exactly who each tool is best for, including complete beginners.',
              },
              {
                icon: DollarSign, color: 'bg-amber-50', iconColor: 'text-amber-600',
                title: 'Make Money With AI',
                desc: 'AI has opened up real opportunities to earn extra income — from home, on your own schedule, without needing special technical skills. We share practical, honest ideas for side gigs that everyday people are actually using right now.',
              },
              {
                icon: GraduationCap, color: 'bg-purple-50', iconColor: 'text-purple-600',
                title: 'Learn at Your Own Pace',
                desc: 'Our Learn AI section has hand-picked courses, videos, books, and guides — sorted by skill level, from complete beginners to advanced. Everything is designed to be approachable, even if you\'ve never used an AI tool before.',
              },
            ].map(({ icon: Icon, color, iconColor, title, desc }) => (
              <div key={title} className="border border-brand-border rounded-xl p-5 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <h3 className="text-base font-bold text-brand-navy">{title}</h3>
                </div>
                <p className="text-sm text-brand-slate leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-4">Who Is This For?</h2>
          <p className="text-brand-slate leading-relaxed mb-5">
            AI Foresights is for anyone who wants to understand and benefit from AI — without needing a computer science degree. You're in the right place if any of these sound like you:
          </p>
          <div className="space-y-2.5">
            {[
              "You've heard a lot about AI and want to understand what it actually means for your life and work",
              "You're retired or semi-retired and looking for ways to earn extra income from home using new technology",
              "You run a small business and want to know how AI can save you time and money",
              "You're a professional — in any field — who wants to stay current without becoming a tech expert",
              "You're curious about AI but every article you've read so far was full of confusing language",
              "You want simple, honest recommendations for tools that can genuinely help you",
            ].map(item => (
              <div key={item} className="flex items-start gap-3 bg-white border border-brand-border rounded-xl px-4 py-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <p className="text-sm text-brand-slate leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-brand-border rounded-2xl p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-brand-navy">Our Promise to You</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Always plain English', desc: "If we can't explain something clearly, we won't publish it. No jargon, no technical terms without explanation." },
              { label: 'Honest and independent', desc: "We're not funded by AI companies. When we recommend a tool, it's because we genuinely think it's useful — not because we were paid to say so." },
              { label: 'Respectful of your time', desc: 'Our articles are written to be read in 3–5 minutes. We give you the most important information without padding it out.' },
              { label: 'Free forever', desc: 'Our newsletter and website are free. We earn revenue through advertising and affiliate links, which are always clearly labeled.' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-sky shrink-0 mt-2" />
                <p className="text-sm text-brand-slate"><strong className="text-brand-navy">{label}:</strong> {desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-navy rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ready to Get Started?</h2>
          <p className="text-brand-muted text-sm mb-6 max-w-md mx-auto">
            Join thousands of everyday people getting clear, simple AI news and tips every week. Completely free. Unsubscribe any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
            <Link href="/best-ai-tools" className="inline-block border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors">Browse AI tools →</Link>
            <a href="https://x.com/AIForesights" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Follow on X
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
