-- ============================================================
-- Migration: Add geo/profile columns to subscribers
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add new columns (safe to run multiple times with IF NOT EXISTS pattern)
DO $$ BEGIN
  ALTER TABLE subscribers ADD COLUMN first_name varchar(128);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscribers ADD COLUMN last_name varchar(128);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscribers ADD COLUMN city varchar(128);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscribers ADD COLUMN state varchar(64);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscribers ADD COLUMN country varchar(64);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscribers ADD COLUMN ip_address varchar(45);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscribers ADD COLUMN latitude double precision;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscribers ADD COLUMN longitude double precision;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscribers ADD COLUMN notes text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
