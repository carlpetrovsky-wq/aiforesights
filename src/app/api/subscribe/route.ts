import { NextRequest, NextResponse } from 'next/server'
import { subscribeEmail } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const result = await subscribeEmail(email, name)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({
      success: true,
      message: result.alreadySubscribed ? 'Already subscribed!' : 'Subscribed successfully!',
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
