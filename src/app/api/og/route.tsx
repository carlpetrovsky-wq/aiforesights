import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  // Support base64url-encoded JSON data param (avoids &amp; encoding issues)
  let title = 'AI Foresights'
  let category = ''
  let source = ''

  const dataParam = searchParams.get('data')
  if (dataParam) {
    try {
      // base64url decode
      const json = JSON.parse(atob(dataParam.replace(/-/g, '+').replace(/_/g, '/')))
      title = json.title || title
      category = json.category || category
      source = json.source || source
    } catch {
      // fallback to individual params
    }
  }

  // Fallback: support legacy individual params
  if (!dataParam) {
    title = searchParams.get('title') || title
    category = searchParams.get('category') || category
    source = searchParams.get('source') || source
  }

  const categoryLabel = category
    ? category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : ''

  const isOwnContent = source === 'AI Foresights'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #0EA5E9, #0284C7, #0F172A)',
          }}
        />

        {/* Category + source badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {categoryLabel && (
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#0EA5E9',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                background: 'rgba(14, 165, 233, 0.1)',
                padding: '8px 20px',
                borderRadius: '8px',
              }}
            >
              {categoryLabel}
            </div>
          )}
          {isOwnContent && (
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#64748b',
                letterSpacing: '1px',
              }}
            >
              ORIGINAL ARTICLE
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: title.length > 80 ? '42px' : title.length > 50 ? '50px' : '56px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.2,
              maxHeight: '340px',
              overflow: 'hidden',
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom bar: branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Actual AI Foresights branded logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="data:image/png;base64,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"
              alt="AI Foresights"
              width={280}
              height={43}
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Right side decorative dots */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0EA5E9' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0284C7' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0F172A' }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
