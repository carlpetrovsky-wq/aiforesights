import { cn } from '@/lib/utils'

interface AdSlotProps {
  slot: string
  size?: 'leaderboard' | 'banner' | 'rectangle' | 'mobile'
  className?: string
}

const SIZE_CLASSES: Record<string, string> = {
  leaderboard: 'h-16 w-full',
  banner:      'h-14 w-full',
  rectangle:   'h-64 w-full',
  mobile:      'h-12 w-full',
}

const SIZE_LABELS: Record<string, string> = {
  leaderboard: '728×90 Leaderboard',
  banner:      'Banner',
  rectangle:   '300×250 Rectangle',
  mobile:      '320×50 Mobile',
}

export default function AdSlot({ slot, size = 'leaderboard', className }: AdSlotProps) {
  return (
    <div className={cn(
      'ad-slot',
      SIZE_CLASSES[size] ?? SIZE_CLASSES.leaderboard,
      'py-2 px-4',
      className
    )}>
      <div className="ad-slot-inner">
        <div className="text-[9px] mb-0.5">Advertisement</div>
        <div className="text-[10px] text-brand-border bg-brand-navyMid px-2 py-0.5 rounded inline-block">
          {slot} · {SIZE_LABELS[size]}
        </div>
      </div>
    </div>
  )
}
