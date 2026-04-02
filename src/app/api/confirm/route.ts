export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function addToMailerLiteActive(email: string, name?: string) {
  const apiKey = process.env.MAILERLITE_API_KEY
  const groupId = process.env.MAILERLITE_GROUP_ID
  if (!apiKey) return

  const nameParts = (name || '').trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  try {
    await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        status: 'active',
        fields: {
          ...(firstName && { name: firstName }),
          ...(lastName && { last_name: lastName }),
        },
        groups: groupId ? [groupId] : [],
      }),
    })
  } catch (err) {
    console.error('MailerLite activate error:', err)
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aiforesights.com'

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/confirm?status=invalid`)
  }

  // Find subscriber by token
  const { data: subscriber, error } = await supabaseAdmin
    .from('subscribers')
    .select('id, email, name, confirmed, confirm_expires_at')
    .eq('confirm_token', token)
    .maybeSingle()

  if (error || !subscriber) {
    return NextResponse.redirect(`${siteUrl}/confirm?status=invalid`)
  }

  if (subscriber.confirmed) {
    return NextResponse.redirect(`${siteUrl}/confirm?status=already`)
  }

  // Check expiry
  if (subscriber.confirm_expires_at && new Date(subscriber.confirm_expires_at) < new Date()) {
    return NextResponse.redirect(`${siteUrl}/confirm?status=expired`)
  }

  // Mark confirmed
  await supabaseAdmin
    .from('subscribers')
    .update({
      confirmed: true,
      is_active: true,
      confirm_token: null,
      confirm_expires_at: null,
    })
    .eq('id', subscriber.id)

  // Now add to MailerLite active group
  await addToMailerLiteActive(subscriber.email, subscriber.name ?? undefined)

  return NextResponse.redirect(`${siteUrl}/confirm?status=success`)
}
