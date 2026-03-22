import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  } catch {
    return 'Recently'
  }
}

export function pricingLabel(pricing: string): string {
  const map: Record<string, string> = {
    free: 'Free', freemium: 'Freemium', paid: 'Paid', enterprise: 'Enterprise',
  }
  return map[pricing] ?? pricing
}

export function pricingClass(pricing: string): string {
  const map: Record<string, string> = {
    free: 'badge-free', freemium: 'badge-freemium', paid: 'badge-paid', enterprise: 'bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded',
  }
  return map[pricing] ?? 'badge-freemium'
}

export function learningTypeIcon(type: string): string {
  const map: Record<string, string> = {
    video: '▶', course: '📚', book: '📖', guide: '📄',
  }
  return map[type] ?? '📄'
}

export function learningTypeColor(type: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    video:  { bg: 'bg-amber-50',  text: 'text-amber-700'  },
    course: { bg: 'bg-emerald-50',text: 'text-emerald-700' },
    book:   { bg: 'bg-purple-50', text: 'text-purple-700'  },
    guide:  { bg: 'bg-blue-50',   text: 'text-blue-700'    },
  }
  return map[type] ?? { bg: 'bg-gray-50', text: 'text-gray-700' }
}

export function levelClass(level: string): string {
  const map: Record<string, string> = {
    beginner:     'bg-emerald-50 text-emerald-700',
    intermediate: 'bg-blue-50 text-blue-700',
    advanced:     'bg-purple-50 text-purple-700',
  }
  return map[level] ?? 'bg-gray-50 text-gray-700'
}
