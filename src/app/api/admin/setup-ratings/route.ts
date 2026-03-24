export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create article_ratings table
  const { error: tableError } = await supabaseAdmin.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.article_ratings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        article_slug TEXT NOT NULL,
        session_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(article_slug, session_id)
      );

      ALTER TABLE public.article_ratings ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Anyone can insert ratings" ON public.article_ratings;
      CREATE POLICY "Anyone can insert ratings" ON public.article_ratings
        FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Anyone can view ratings" ON public.article_ratings;
      CREATE POLICY "Anyone can view ratings" ON public.article_ratings
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Users can update own rating" ON public.article_ratings;
      CREATE POLICY "Users can update own rating" ON public.article_ratings
        FOR UPDATE USING (true) WITH CHECK (true);
    `
  })

  if (tableError) {
    // Table may already exist or RPC not available — try direct insert test
    return NextResponse.json({ error: tableError.message, hint: 'Create table manually in Supabase SQL editor' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'article_ratings table created' })
}
