# Supabase Setup — AIForesights

## Step 1: Create Supabase project
1. Go to supabase.com → New project
2. Name: `aiforesights`, Region: US East
3. Save your database password

## Step 2: Run the schema
1. In Supabase dashboard → SQL Editor
2. Open `supabase/schema.sql`
3. Paste the entire contents → Run

## Step 3: Add environment variables to Vercel
Go to Vercel → aiforesights project → Settings → Environment Variables
Add these two:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Also add to `.env.local` for local development.

## Step 4: Redeploy
After adding env vars, trigger a new deployment in Vercel.

## Tables created
- `categories` — site categories (seeded with 5)
- `sources` — RSS feed sources (seeded with 6)
- `articles` — news articles from RSS feeds
- `tools` — AI tools directory (seeded with 10)
- `subscribers` — newsletter subscribers
- `newsletters` — newsletter send history
- `ad_slots` — ad placement configuration (seeded with 5)
- `settings` — key-value site config

## API Routes
- `GET /api/articles` — fetch articles (params: limit, sortBy, category, featured)
- `GET /api/tools` — fetch tools (params: limit, pricing, level, search, featured)
- `POST /api/subscribe` — subscribe email { email, name }
