export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Add og_image_url column to articles if it doesn't exist
    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image_url TEXT;`
    })

    // If rpc doesn't work, try direct approach
    if (error) {
      // Try to select the column — if it works, it already exists
      const { error: testError } = await supabase
        .from('articles')
        .select('og_image_url')
        .limit(1)

      if (testError && testError.message.includes('og_image_url')) {
        return NextResponse.json({
          error: 'Column does not exist and could not be created automatically. Please run this SQL in Supabase Dashboard > SQL Editor:\n\nALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image_url TEXT;',
          rpcError: error.message,
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Column og_image_url already exists',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Column og_image_url added to articles table',
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
