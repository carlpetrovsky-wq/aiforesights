import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Download the image from Supabase Storage
    const { data, error } = await supabase.storage
      .from('og-images')
      .download(`og/${params.slug}.png`)

    if (error || !data) {
      // Fallback: redirect to default OG image
      return NextResponse.redirect(new URL('/og-default.png', req.url))
    }

    const buffer = Buffer.from(await data.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch {
    return NextResponse.redirect(new URL('/og-default.png', req.url))
  }
}
