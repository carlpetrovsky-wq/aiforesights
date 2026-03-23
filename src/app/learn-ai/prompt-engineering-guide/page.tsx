import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowLeft, Clock, BookOpen } from 'lucide-react'

export const metadata = {
  title: 'Prompt Engineering Guide for Professionals — AI Foresights',
  description: 'Learn how to write better prompts and get dramatically better results from ChatGPT, Claude, and any AI tool. Practical examples for professionals.',
}

export default function PromptEngineeringGuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/learn-ai" className="inline-flex items-center gap-1.5 text-brand-muted hover:text-white text-xs mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Learn AI
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider">Guide</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-brand-muted uppercase tracking-wider">Intermediate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Prompt Engineering Guide for Professionals</h1>
          <div className="flex items-center gap-4 text-xs text-brand-muted">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 20 min read</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> AI Foresights</span>
            <span>Free</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="prose prose-sm max-w-none space-y-8 text-brand-slate">

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-brand-navy">
            <strong>What you'll learn:</strong> How to write prompts that get dramatically better results from ChatGPT, Claude, Gemini, and any other AI tool — with real examples you can use immediately.
          </div>

          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-4">Why Most People Get Mediocre Results from AI</h2>
            <p className="leading-relaxed">Most people treat AI tools like a search engine — they type a vague question and hope for the best. When they get a generic answer, they assume AI isn't that useful. The problem isn't the AI. The problem is the prompt.</p>
            <p className="leading-relaxed mt-3">Prompt engineering is simply the skill of giving AI tools clear, specific instructions so they can do their best work. You don't need to be a programmer to do this well. You just need to understand a few principles.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-4">The 4 Core Elements of a Great Prompt</h2>

            <div className="space-y-4">
              {[
                {
                  num: '1', title: 'Role', color: 'bg-blue-50 border-blue-200',
                  bad: 'Write a marketing email.',
                  good: 'You are a senior copywriter who specializes in B2B SaaS. Write a marketing email...',
                  tip: 'Give the AI a role that matches the expertise you need. This calibrates its tone, vocabulary, and approach.'
                },
                {
                  num: '2', title: 'Context', color: 'bg-emerald-50 border-emerald-200',
                  bad: 'Summarize this report for me.',
                  good: 'I need to present this quarterly financial report to non-financial stakeholders at a board meeting. Summarize the key points in plain language, highlighting the 3 most important takeaways.',
                  tip: 'The more context you give, the more tailored the result. Tell the AI who the audience is, what the goal is, and any constraints.'
                },
                {
                  num: '3', title: 'Format', color: 'bg-purple-50 border-purple-200',
                  bad: 'Give me ideas for our content strategy.',
                  good: 'Give me 5 ideas for our content strategy. Format each idea as: Title, 2-sentence description, target audience, and expected outcome.',
                  tip: 'Be specific about the output format. Want a table? Bullet points? A numbered list with sub-items? Say so explicitly.'
                },
                {
                  num: '4', title: 'Constraints', color: 'bg-amber-50 border-amber-200',
                  bad: 'Write a bio for me.',
                  good: 'Write a professional bio for a LinkedIn profile. Keep it under 150 words. Use third person. Focus on leadership and results rather than job titles. Avoid buzzwords like "passionate" or "results-driven".',
                  tip: 'Tell the AI what NOT to do, as well as what to do. Constraints lead to sharper, more usable outputs.'
                },
              ].map(({ num, title, color, bad, good, tip }) => (
                <div key={title} className={`border rounded-xl p-5 ${color}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-white border border-current text-xs font-bold flex items-center justify-center text-brand-navy">{num}</span>
                    <h3 className="text-base font-bold text-brand-navy">{title}</h3>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs">
                      <div className="text-red-600 font-semibold mb-1">❌ Weak prompt</div>
                      <p className="text-brand-slate italic">"{bad}"</p>
                    </div>
                    <div className="bg-white border border-green-200 rounded-lg p-3 text-xs">
                      <div className="text-emerald-600 font-semibold mb-1">✅ Strong prompt</div>
                      <p className="text-brand-slate italic">"{good}"</p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-slate leading-relaxed"><strong>Why it works:</strong> {tip}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-4">Advanced Technique: Chain of Thought</h2>
            <p className="leading-relaxed mb-3">For complex tasks, tell the AI to think step by step before giving you an answer. This dramatically improves accuracy on anything that requires reasoning.</p>
            <div className="bg-gray-50 border border-brand-border rounded-xl p-4 text-sm">
              <div className="text-brand-sky font-semibold mb-2">Example prompt:</div>
              <p className="text-brand-slate italic leading-relaxed">"Before giving me your recommendation, think through this step by step: (1) What are the key factors to consider? (2) What are the tradeoffs of each option? (3) Then give me your recommendation with a clear rationale."</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-4">Real-World Templates You Can Use Today</h2>
            <div className="space-y-3">
              {[
                { title: 'Drafting an email', prompt: 'You are a professional business writer. Draft a [type] email to [recipient] about [topic]. The tone should be [formal/friendly/direct]. Keep it under [length]. The goal is to [outcome]. Do not use [any phrases to avoid].' },
                { title: 'Summarizing a document', prompt: 'Summarize the following [document type] in [X] bullet points. Write for a [audience] who [context about their knowledge level]. Focus on the most actionable insights. [Paste document]' },
                { title: 'Brainstorming ideas', prompt: 'Generate [number] ideas for [topic]. For each idea, include: a one-sentence description, who it\'s best for, and one potential downside. I\'m trying to [goal]. My main constraint is [constraint].' },
                { title: 'Reviewing your writing', prompt: 'Review the following [document type] and provide specific feedback on: (1) clarity, (2) tone for the intended audience of [audience], (3) any missing information, and (4) suggested improvements. Then provide an edited version. [Paste writing]' },
              ].map(({ title, prompt }) => (
                <div key={title} className="border border-brand-border rounded-xl p-4 bg-white">
                  <h3 className="text-sm font-semibold text-brand-navy mb-2">{title}</h3>
                  <p className="text-xs text-brand-slate leading-relaxed font-mono bg-gray-50 p-3 rounded-lg">{prompt}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">Key Takeaways</h2>
            <ul className="space-y-2">
              {[
                'Give the AI a role that matches the expertise you need',
                'Provide context: who is the audience, what is the goal, what are the constraints',
                'Specify the format you want the output in',
                'Tell the AI what to avoid, not just what to do',
                'For complex tasks, ask it to think step by step',
                'Treat it like briefing a capable colleague, not typing into a search box',
              ].map(tip => (
                <li key={tip} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-sky mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          <div className="bg-brand-navy rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Get More Guides Like This</h3>
            <p className="text-brand-muted text-sm mb-4">Subscribe to our free weekly newsletter for practical AI tips and news.</p>
            <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
