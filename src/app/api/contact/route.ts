import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, type, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required.' }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Rate limiting: max 3 inquiries per email per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', oneDayAgo)

    if (count && count >= 3) {
      return NextResponse.json({ success: false, error: 'Too many messages. Please try again tomorrow.' }, { status: 429 })
    }

    const { error } = await supabaseAdmin
      .from('inquiries')
      .insert({
        name: name.trim().slice(0, 200),
        email: email.trim().toLowerCase().slice(0, 320),
        inquiry_type: (type || 'general').slice(0, 50),
        message: message.trim().slice(0, 5000),
        status: 'new',
      })

    if (error) {
      console.error('Contact form error:', error)
      return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Contact API error:', e)
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
