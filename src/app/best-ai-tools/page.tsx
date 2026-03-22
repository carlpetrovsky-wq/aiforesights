import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ToolCard from '@/components/tools/ToolCard'
import AdSlot from '@/components/ads/AdSlot'
import { MOCK_TOOLS } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Best AI Tools — AI Foresights',
  description: 'The best free and paid AI tools for professionals. Ranked, reviewed, and explained in plain English.',
}

export default function BestAIToolsPage() {
  const tools = MOCK_TOOLS

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-emerald-400 rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Best AI tools</h1>
          <p className="text-sm text-brand-muted max-w-lg">
            The top AI tools for professionals — ranked, reviewed, and explained without the jargon. Free and paid options.
          </p>
        </div>
      </div>

      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full px-4 sm:px-6 my-3" />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-4">
        {/* Filter row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {['All','Free','Freemium','Paid'].map(f => (
            <button key={f}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${f === 'All' ? 'bg-brand-sky text-white' : 'text-brand-slate hover:bg-gray-100'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map(t => (
            <ToolCard key={t.id} tool={t} variant="grid" />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
