'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmContent() {
  const params = useSearchParams()
  const status = params.get('status')

  const states = {
    success: {
      emoji: '🎉',
      title: "You're confirmed!",
      message: "Welcome to AI Foresights. You'll start receiving our newsletter with the latest AI news, tools, and insights.",
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      cta: 'Go to the homepage',
      href: '/',
    },
    already: {
      emoji: '✅',
      title: "Already confirmed",
      message: "Your email address is already confirmed and active. You're all set!",
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
      cta: 'Go to the homepage',
      href: '/',
    },
    expired: {
      emoji: '⏰',
      title: "Link expired",
      message: "This confirmation link has expired. Please sign up again and we'll send you a fresh confirmation email.",
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      cta: 'Sign up again',
      href: '/newsletter',
    },
    invalid: {
      emoji: '❌',
      title: "Invalid link",
      message: "This confirmation link isn't valid. It may have already been used or the URL is incorrect.",
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      cta: 'Sign up again',
      href: '/newsletter',
    },
  }

  const state = states[status as keyof typeof states] ?? states.invalid

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <Link href="/" className="inline-block mb-10">
          <span className="text-xl font-bold text-white">AI <span className="text-sky-400">Foresights</span></span>
        </Link>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-10">
          <div className={`w-16 h-16 ${state.bg} rounded-full flex items-center justify-center mx-auto mb-6 text-3xl`}>
            {state.emoji}
          </div>
          <h1 className={`text-2xl font-bold mb-3 ${state.color}`}>{state.title}</h1>
          <p className="text-slate-400 leading-relaxed mb-8">{state.message}</p>
          <Link
            href={state.href}
            className="inline-block px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition"
          >
            {state.cta}
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-600">
          Questions? Email us at{' '}
          <a href="mailto:hello@aiforesights.com" className="text-sky-500 hover:underline">
            hello@aiforesights.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  )
}
