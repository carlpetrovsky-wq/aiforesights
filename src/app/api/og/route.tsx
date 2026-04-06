import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') || 'AI Foresights'
  const category = searchParams.get('category') || ''
  const source = searchParams.get('source') || ''

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
            {/* Simple logo circle since we can't easily load local images in edge */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0EA5E9, #0F172A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '22px',
                fontWeight: 800,
              }}
            >
              AI
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.5px',
                }}
              >
                AI Foresights
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  fontWeight: 500,
                }}
              >
                aiforesights.com — A New Dawn Is Here
              </div>
            </div>
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
