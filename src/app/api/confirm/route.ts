export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { addContact } from '@/lib/brevo'

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

  // Add to Brevo as active contact
  try {
    await addContact(subscriber.email, subscriber.name ?? undefined)
  } catch (e) {
    console.error('Brevo activate error:', e)
  }

  return NextResponse.redirect(`${siteUrl}/confirm?status=success`)
}
