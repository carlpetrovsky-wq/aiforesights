import { NextRequest, NextResponse } from 'next/server'

// This route was used for MailerLite "Contact Inquiries" group setup.
// With Brevo, contact form inquiries are sent via transactional email
// directly to Carl — no group setup needed.
// Keeping this route as a no-op to avoid 404s if admin UI references it.

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    message: 'Contact form inquiries now use Brevo transactional email — no group setup needed. Inquiries are emailed directly to carlpetrovsky@gmail.com.',
  })
}
