import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// 10 DRAMATICALLY different themes — must be visually distinct at small card sizes
const THEMES = [
  // 0: Light sky blue (original)
  { bg: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)', text: '#0F172A', bar: 'linear-gradient(90deg, #0EA5E9, #0284C7, #0F172A)', dots: ['#0EA5E9', '#0284C7', '#0F172A'], logo: 'dark' },
  // 1: Deep navy
  { bg: 'linear-gradient(145deg, #0F172A 0%, #1e3a5f 50%, #0c4a6e 100%)', text: '#ffffff', bar: 'linear-gradient(90deg, #38bdf8, #0EA5E9, #7dd3fc)', dots: ['#38bdf8', '#0EA5E9', '#7dd3fc'], logo: 'white' },
  // 2: Bold sky blue to navy diagonal
  { bg: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 50%, #0F172A 100%)', text: '#ffffff', bar: 'linear-gradient(90deg, #ffffff, #e0f2fe, #bae6fd)', dots: ['#ffffff', '#e0f2fe', '#bae6fd'], logo: 'white' },
  // 3: Dark charcoal with amber accent
  { bg: 'linear-gradient(150deg, #18181b 0%, #27272a 50%, #3f3f46 100%)', text: '#fafafa', bar: 'linear-gradient(90deg, #f59e0b, #d97706, #0EA5E9)', dots: ['#f59e0b', '#d97706', '#0EA5E9'], logo: 'white' },
  // 4: Rich emerald green
  { bg: 'linear-gradient(145deg, #022c22 0%, #064e3b 50%, #065f46 100%)', text: '#ecfdf5', bar: 'linear-gradient(90deg, #34d399, #10b981, #0EA5E9)', dots: ['#34d399', '#10b981', '#0EA5E9'], logo: 'white' },
  // 5: Warm sunset orange
  { bg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fdba74 100%)', text: '#431407', bar: 'linear-gradient(90deg, #ea580c, #f97316, #0EA5E9)', dots: ['#ea580c', '#f97316', '#0EA5E9'], logo: 'dark' },
  // 6: Deep ocean blue
  { bg: 'linear-gradient(150deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)', text: '#ffffff', bar: 'linear-gradient(90deg, #bae6fd, #7dd3fc, #38bdf8)', dots: ['#bae6fd', '#7dd3fc', '#38bdf8'], logo: 'white' },
  // 7: Royal purple
  { bg: 'linear-gradient(145deg, #2e1065 0%, #4c1d95 50%, #5b21b6 100%)', text: '#f5f3ff', bar: 'linear-gradient(90deg, #a78bfa, #8b5cf6, #0EA5E9)', dots: ['#a78bfa', '#8b5cf6', '#0EA5E9'], logo: 'white' },
  // 8: Slate steel
  { bg: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)', text: '#f1f5f9', bar: 'linear-gradient(90deg, #0EA5E9, #38bdf8, #7dd3fc)', dots: ['#0EA5E9', '#38bdf8', '#7dd3fc'], logo: 'white' },
  // 9: Soft lavender
  { bg: 'linear-gradient(145deg, #faf5ff 0%, #ede9fe 50%, #c4b5fd 100%)', text: '#1e1b4b', bar: 'linear-gradient(90deg, #7c3aed, #6d28d9, #0EA5E9)', dots: ['#7c3aed', '#6d28d9', '#0EA5E9'], logo: 'dark' },
]

function hashTitle(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % THEMES.length
}

const LOGO_DARK = 'data:image/png;base64,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'

const LOGO_WHITE = 'data:image/png;base64,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'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  let title = 'AI Foresights'

  const dataParam = searchParams.get('data')
  if (dataParam) {
    try {
      const json = JSON.parse(atob(dataParam.replace(/-/g, '+').replace(/_/g, '/')))
      title = json.title || title
    } catch { /* fallback */ }
  }
  if (!dataParam) {
    title = searchParams.get('title') || title
  }

  const themeIndex = hashTitle(title)
  const theme = THEMES[themeIndex]
  const logoSrc = theme.logo === 'white' ? LOGO_WHITE : LOGO_DARK

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 70px', fontFamily: 'system-ui, -apple-system, sans-serif', background: theme.bg, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: theme.bar }} />
        <div style={{ display: 'flex' }} />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: title.length > 80 ? '42px' : title.length > 50 ? '50px' : '56px', fontWeight: 800, color: theme.text, lineHeight: 1.2, maxHeight: '340px', overflow: 'hidden', letterSpacing: '-1px' }}>
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={logoSrc} alt="AI Foresights" width={280} height={43} style={{ objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.dots[0] }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.dots[1] }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.dots[2] }} />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' } }
  )
}
