export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { brevoFetch } from '@/lib/brevo'

// Brevo setup verification — check account, lists, senders
export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  try {
    // Check account
    const account = await brevoFetch('/account')
    results.account = {
      email: account?.email,
      plan: account?.plan?.[0]?.type ?? 'unknown',
      credits: account?.plan?.[0]?.credits ?? 0,
    }

    // Check lists
    const lists = await brevoFetch('/contacts/lists?limit=50')
    results.lists = (lists?.lists ?? []).map((l: any) => ({
      id: l.id,
      name: l.name,
      totalSubscribers: l.totalSubscribers,
    }))

    // Check senders
    const senders = await brevoFetch('/senders')
    results.senders = (senders?.senders ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      active: s.active,
    }))

    return NextResponse.json({
      success: true,
      message: 'Brevo account verified. Review lists and senders below.',
      ...results,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[setup-automations] Error:', message)
    return NextResponse.json({ error: message, partial: results }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return POST(req)
}
