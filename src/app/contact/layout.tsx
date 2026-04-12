import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — AI Foresights',
  description: 'Get in touch with AI Foresights. Questions, partnerships, advertising, or feedback — we'd love to hear from you.',
  alternates: {
    canonical: 'https://www.aiforesights.com/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
