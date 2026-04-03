export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, channel, description, youtube_id } = await req.json()

  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const prompt = `You are writing editorial copy for AIForesights.com, an AI news site for non-technical professionals aged 35-65 — retirees, small business owners, and everyday people.

A video has been selected as this week's "AI Video of the Week" pick. Write an editorial intro that:
- Opens with WHY this video matters right now for everyday people (not tech experts)
- Explains what the viewer will learn or walk away understanding
- Sets expectations honestly — is it beginner-friendly? Mind-bending? Practical?
- Ends with a clear reason to watch it today

Tone: warm, plain English, like a knowledgeable friend recommending something. No hype. No jargon.
Length: exactly 3 paragraphs, each 2-4 sentences. Separate with blank lines.
Do NOT start with "This video" or "In this video".

VIDEO DETAILS:
Title: ${title}
Channel: ${channel || 'Unknown'}
Description: ${description ? description.slice(0, 400) : 'Not available'}
YouTube ID: ${youtube_id}

Also suggest 3-5 short tags relevant to this video for the AI/tech audience.

Respond in this exact JSON format with no other text:
{
  "intro": "paragraph one\\n\\nparagraph two\\n\\nparagraph three",
  "tags": ["tag1", "tag2", "tag3"]
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return NextResponse.json({ intro: parsed.intro, tags: parsed.tags })
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw }, { status: 500 })
  }
}
