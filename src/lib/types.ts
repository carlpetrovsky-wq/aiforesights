export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  summary?: string
  thumbnailUrl?: string
  sourceUrl: string
  sourceName: string
  sourceColor?: string
  author?: string
  publishedAt: string
  category: string
  tags: string[]
  voteCount: number
  isFeatured: boolean
}

export interface Tool {
  id: string
  name: string
  slug: string
  description: string
  websiteUrl: string
  logoUrl?: string
  pricing: 'free' | 'freemium' | 'paid' | 'enterprise'
  category: string
  tags: string[]
  saveCount: number
  isFeatured: boolean
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all'
}

export interface LearningResource {
  id: string
  title: string
  description: string
  type: 'video' | 'course' | 'book' | 'guide'
  url: string
  affiliateUrl?: string
  platform: string
  duration?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  isFree: boolean
  thumbnailBg: string
  thumbnailUrl?: string
  isAffiliate: boolean
}

export interface Category {
  slug: string
  label: string
  description: string
  color: string
  dotColor: string
}

export interface Subscriber {
  email: string
  name?: string
}

export type PricingTier = 'free' | 'freemium' | 'paid' | 'enterprise'
export type ExperienceLevel = 'brand-new' | 'beginner' | 'intermediate' | 'professional' | 'business-owner'
