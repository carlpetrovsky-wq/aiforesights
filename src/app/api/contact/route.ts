import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Send notification to Carl via MailerLite by adding the inquiry sender
// as a subscriber with inquiry details in custom fields.
// Carl sees new inquiries in the MailerLite "Contact Inquiries" group.
async function notifyViaMailerLite(name: string, email: string, type: string, message: string) {
  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) return

  try {
    // Add the person to MailerLite with inquiry details in fields
    // This triggers a notification in your MailerLite dashboard
    await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        fields: {
          name,
          last_name: `[${type}] ${message.slice(0, 200)}`,
        },
        groups: process.env.MAILERLITE_INQUIRIES_GROUP_ID
          ? [process.env.MAILERLITE_INQUIRIES_GROUP_ID]
          : [],
        status: 'active',
      }),
    })
  } catch (e) {
    console.error('MailerLite notification error:', e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, type, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required.' }, { status: 400 })
    }

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

    const trimmedName = name.trim().slice(0, 200)
    const trimmedEmail = email.trim().toLowerCase().slice(0, 320)
    const trimmedType = (type || 'general').slice(0, 50)
    const trimmedMessage = message.trim().slice(0, 5000)

    const { error } = await supabaseAdmin
      .from('inquiries')
      .insert({
        name: trimmedName,
        email: trimmedEmail,
        inquiry_type: trimmedType,
        message: trimmedMessage,
        status: 'new',
      })

    if (error) {
      console.error('Contact form error:', error)
      return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // Send notification (non-blocking — don't fail the form if this errors)
    notifyViaMailerLite(trimmedName, trimmedEmail, trimmedType, trimmedMessage)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Contact API error:', e)
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
