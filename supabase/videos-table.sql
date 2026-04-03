-- Run this in your Supabase SQL editor
-- Go to: https://vlavisroxzwifprjzcar.supabase.co → SQL Editor → New query

CREATE TABLE IF NOT EXISTS videos (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id          text NOT NULL,
  title               text NOT NULL,
  intro               text NOT NULL,
  tags                text[] DEFAULT '{}',
  published_at        timestamptz DEFAULT now(),
  is_active           boolean DEFAULT false,
  newsletter_included boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- Index for fast active video lookup
CREATE INDEX IF NOT EXISTS videos_is_active_idx ON videos (is_active);
CREATE INDEX IF NOT EXISTS videos_published_at_idx ON videos (published_at DESC);

-- Allow public read access (same as articles table)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON videos
  FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON videos
  FOR ALL USING (true);
