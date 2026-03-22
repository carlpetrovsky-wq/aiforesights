import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LearningHub from '@/components/learning/LearningHub'
import { MOCK_LEARNING } from '@/lib/data'

export default function LearnAIPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-red-400 rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Learn AI</h1>
          <p className="text-sm text-brand-muted">Courses, videos, books, and guides for professionals. No coding required.</p>
        </div>
      </div>
      <LearningHub resources={MOCK_LEARNING} />
      <Footer />
    </div>
  )
}
