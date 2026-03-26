import { NextRequest, NextResponse } from 'next/server'
import { getTools } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit           = Number(searchParams.get('limit') ?? 20)
  const pricing         = searchParams.get('pricing') ?? undefined
  const experienceLevel = searchParams.get('level') ?? undefined
  const search          = searchParams.get('search') ?? undefined
  const featured        = searchParams.get('featured') === 'true' ? true : undefined
  const category        = searchParams.get('category') ?? undefined

  const tools = await getTools({ limit, pricing, experienceLevel, search, featured, category })
  return NextResponse.json(tools)
}
