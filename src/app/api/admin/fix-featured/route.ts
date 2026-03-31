export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get('admin_token')?.value
  const bearerToken = req.headers.get('authorization')?.replace('Bearer ', '')
  const expected = process.env.ADMIN_TOKEN
  if (!expected || (cookieToken !== expected && bearerToken !== expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Unstar the 9 old articles, keep only the 3 March 31 ones
  const keepIds = [
    'b4698bda-3164-4e21-b232-8cf9485f419b', // Shifting to AI model
    '19713011-fa80-464b-83b7-130cdc99dbdf', // Ring bets on AI
    '7de9a48e-7aa8-421d-8081-ec5e09e0d638', // AI benchmarks
  ]

  // Unstar everything
  const { error: e1 } = await supabaseAdmin
    .from('articles')
    .update({ is_featured: false })
    .eq('is_featured', true)
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

  // Re-star only the 3 correct ones
  const { error: e2 } = await supabaseAdmin
    .from('articles')
    .update({ is_featured: true })
    .in('id', keepIds)
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  return NextResponse.json({ success: true, message: 'Unstarred 9 old articles, kept 3 March 31 articles starred' })
}
