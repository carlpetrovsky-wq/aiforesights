import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

const NUM_BACKGROUNDS = 10

function hashTitle(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0
  }
  return (Math.abs(hash) % NUM_BACKGROUNDS) + 1 // 1-10
}

function wrapText(
  ctx: any,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  ctx.font = `bold ${fontSize}px "DejaVu Sans", system-ui, sans-serif`
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    const metrics = ctx.measureText(test)
    if (metrics.width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

export async function GET(req: NextRequest) {
  try {
    const { createCanvas, loadImage, GlobalFonts } = await import('@napi-rs/canvas')
    
    const { searchParams } = req.nextUrl
    let title = searchParams.get('title') || 'AI Foresights'
    
    // Also support base64 data param
    const dataParam = searchParams.get('data')
    if (dataParam) {
      try {
        const json = JSON.parse(Buffer.from(dataParam, 'base64url').toString())
        title = json.title || title
      } catch { /* fallback */ }
    }

    const W = 1200
    const H = 630
    const bgIndex = hashTitle(title)

    // Fetch background image from our own public folder
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aiforesights.com'
    const bgUrl = `${siteUrl}/og-bg/bg-${bgIndex}.jpg`
    const bgResponse = await fetch(bgUrl)
    if (!bgResponse.ok) {
      return new NextResponse('Background fetch failed', { status: 500 })
    }
    const bgBuffer = Buffer.from(await bgResponse.arrayBuffer())
    const bgImage = await loadImage(bgBuffer)

    // Create canvas
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    // Draw background
    ctx.drawImage(bgImage, 0, 0, W, H)

    // Dark gradient overlay for text readability
    for (let x = 0; x < W; x++) {
      const opacity = (190 - (x / W) * 90) / 255
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
      ctx.fillRect(x, 0, 1, H)
    }

    // Bottom bar overlay for logo area
    for (let y = H - 90; y < H; y++) {
      const opacity = Math.min(220, 160 + ((y - (H - 90)) / 90) * 60) / 255
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
      ctx.fillRect(0, y, W, 1)
    }

    // Top accent bar
    ctx.fillStyle = '#0EA5E9'
    ctx.fillRect(0, 0, W, 5)

    // Title text
    const fontSize = title.length > 80 ? 40 : title.length > 50 ? 46 : 52
    const lines = wrapText(ctx, title, W - 160, fontSize)

    ctx.font = `bold ${fontSize}px "DejaVu Sans", system-ui, sans-serif`
    let yPos = 110
    for (const line of lines.slice(0, 4)) {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillText(line, 72, yPos + 2)
      // Text
      ctx.fillStyle = '#ffffff'
      ctx.fillText(line, 70, yPos)
      yPos += fontSize + 12
    }

    // Load and draw white logo
    const logoUrl = `${siteUrl}/logo-horizontal.png`
    const logoResponse = await fetch(logoUrl)
    if (logoResponse.ok) {
      const logoBuffer = Buffer.from(await logoResponse.arrayBuffer())
      const logoImg = await loadImage(logoBuffer)
      const logoW = 260
      const logoH = (logoImg.height / logoImg.width) * logoW
      
      // Draw logo with white tint (draw it then apply white color)
      ctx.save()
      ctx.globalAlpha = 0.9
      // Draw logo at bottom left — we'll invert it to white
      const logoY = H - logoH - 28
      
      // Create a temporary canvas for the white logo
      const logoCanvas = createCanvas(logoW, Math.ceil(logoH))
      const logoCtx = logoCanvas.getContext('2d')
      logoCtx.drawImage(logoImg, 0, 0, logoW, logoH)
      
      // Get image data and invert to white
      const imageData = logoCtx.getImageData(0, 0, logoW, Math.ceil(logoH))
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 50) { // if pixel has alpha
          data[i] = 255     // R
          data[i + 1] = 255 // G
          data[i + 2] = 255 // B
        }
      }
      logoCtx.putImageData(imageData, 0, 0)
      
      ctx.drawImage(logoCanvas, 60, logoY)
      ctx.restore()
    }

    // Website URL
    ctx.font = '16px "DejaVu Sans", system-ui, sans-serif'
    ctx.fillStyle = 'rgba(200, 200, 200, 0.9)'
    ctx.fillText('aiforesights.com', W - 195, H - 33)

    // Accent dots
    const dotColors = ['#0EA5E9', '#0284C7', '#ffffff']
    const dotY = H - 38
    const dotX = W - 70
    dotColors.forEach((color, i) => {
      ctx.beginPath()
      ctx.arc(dotX + i * 18, dotY, 5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })

    // Export as PNG
    const pngBuffer = canvas.toBuffer('image/png')

    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pngBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    // Fallback: redirect to default static image
    return NextResponse.redirect(new URL('/og-default.png', req.url))
  }
}
