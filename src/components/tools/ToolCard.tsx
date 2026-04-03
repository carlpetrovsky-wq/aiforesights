'use client'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Tool } from '@/lib/types'
import { pricingClass, pricingLabel, cn } from '@/lib/utils'

interface ToolCardProps {
  tool: Tool
  variant?: 'sidebar' | 'grid'
}

export default function ToolCard({ tool, variant = 'sidebar' }: ToolCardProps) {
  if (variant === 'sidebar') {
    return (
      <div className="flex items-start gap-2.5 py-2.5 border-b border-brand-border last:border-0 group cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-xs font-semibold text-brand-slate shrink-0 group-hover:border-brand-sky transition-colors overflow-hidden">
          {tool.logoUrl ? (
            <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style') }} />
          ) : null}
          <span style={tool.logoUrl ? {display:'none'} : {}}>{tool.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <Link href={`/tool/${tool.slug}`} className="text-[12px] font-medium text-brand-navy hover:text-brand-sky transition-colors line-clamp-1">
              {tool.name}
            </Link>
            <a href={tool.affiliateUrl || tool.websiteUrl} target="_blank" rel={`noopener noreferrer${tool.affiliateUrl ? ' sponsored' : ''}`} className="shrink-0 text-brand-muted hover:text-brand-sky transition-colors">
              <ExternalLink size={10} />
            </a>
          </div>
          <p className="text-[10px] text-brand-slate line-clamp-1 mt-0.5">{tool.description}</p>
          <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded mt-1 inline-block', pricingClass(tool.pricing))}>
            {pricingLabel(tool.pricing)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-brand-border rounded-xl p-4 hover:border-brand-sky hover:shadow-sm transition-all group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-sm font-bold text-brand-slate shrink-0 group-hover:border-brand-sky transition-colors overflow-hidden">
          {tool.logoUrl ? (
            <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style') }} />
          ) : null}
          <span style={tool.logoUrl ? {display:'none'} : {}}>{tool.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/tool/${tool.slug}`} className="text-sm font-semibold text-brand-navy hover:text-brand-sky transition-colors line-clamp-1">
                {tool.name}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', pricingClass(tool.pricing))}>
                  {pricingLabel(tool.pricing)}
                </span>
                {tool.isFeatured && (
                  <span className="text-[10px] font-semibold bg-brand-sky text-white px-1.5 py-0.5 rounded">
                    Featured
                  </span>
                )}
              </div>
            </div>
            <a href={tool.affiliateUrl || tool.websiteUrl} target="_blank" rel={`noopener noreferrer${tool.affiliateUrl ? ' sponsored' : ''}`}
               className="text-brand-muted hover:text-brand-sky transition-colors shrink-0 text-xs flex items-center gap-1">
              Visit <ExternalLink size={11} />
            </a>
          </div>

          {tool.description && (
            <p className="text-[12px] text-brand-slate line-clamp-2 mt-2 leading-relaxed">{tool.description}</p>
          )}

          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tool.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] bg-gray-100 text-brand-slate px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
