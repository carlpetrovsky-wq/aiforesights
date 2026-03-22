import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function MakeMoneyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-amber-400 rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Make money with AI</h1>
          <p className="text-sm text-brand-muted">Real side hustles, income strategies, and guides for professionals using AI tools.</p>
        </div>
      </div>
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-8">
        <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-2xl">
          <p className="text-brand-slate text-sm">Guides coming soon — subscribe to be notified.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
