export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await req.json()
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    // Fetch the article
    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .select('title, slug, category_slug, source_name')
      .eq('slug', slug)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Generate OG image by calling our own edge function
    const ogUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aiforesights.com'}/api/og?title=${encodeURIComponent(article.title)}&_t=${Date.now()}`
    const imgResponse = await fetch(ogUrl, { cache: 'no-store' })
    if (!imgResponse.ok) {
      return NextResponse.json({ error: 'Failed to generate OG image' }, { status: 500 })
    }

    const imageBuffer = Buffer.from(await imgResponse.arrayBuffer())
    const fileName = `og/${article.slug}.png`

    // Ensure the og-images bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === 'og-images')
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket('og-images', { public: true })
    }

    // Upload to Supabase Storage (overwrite if exists)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('og-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('og-images')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    // Save the OG image URL to the article record
    await supabaseAdmin
      .from('articles')
      .update({ og_image_url: publicUrl })
      .eq('slug', slug)

    return NextResponse.json({
      success: true,
      ogImageUrl: publicUrl,
      articleTitle: article.title,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
