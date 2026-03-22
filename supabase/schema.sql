-- ============================================================
-- AIForesights.com — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name varchar(128) not null unique,
  slug varchar(128) not null unique,
  description text,
  icon varchar(64),
  dot_color varchar(16) default '#0EA5E9',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- RSS SOURCES
-- ============================================================
create table if not exists sources (
  id uuid primary key default uuid_generate_v4(),
  name varchar(256) not null,
  url varchar(1024) not null,
  feed_url varchar(1024),
  source_type varchar(32) default 'rss',
  category_id uuid references categories(id),
  is_active boolean default true,
  last_fetched_at timestamptz,
  fetch_interval_minutes int default 60,
  logo_url varchar(1024),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ARTICLES
-- ============================================================
create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
  title varchar(512) not null,
  slug varchar(512) not null unique,
  excerpt text,
  content text,
  summary text,
  thumbnail_url varchar(1024),
  source_url varchar(1024) not null,
  source_id uuid references sources(id),
  source_name varchar(256),
  source_color varchar(16),
  category_id uuid references categories(id),
  category_slug varchar(128),
  author varchar(256),
  published_at timestamptz,
  fetched_at timestamptz default now(),
  vote_count int default 0,
  view_count int default 0,
  status varchar(32) default 'published',
  is_featured boolean default false,
  tags jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast slug lookup and sorting
create index if not exists articles_slug_idx on articles(slug);
create index if not exists articles_published_idx on articles(published_at desc);
create index if not exists articles_category_idx on articles(category_slug);
create index if not exists articles_featured_idx on articles(is_featured);
create index if not exists articles_votes_idx on articles(vote_count desc);

-- ============================================================
-- TOOLS
-- ============================================================
create table if not exists tools (
  id uuid primary key default uuid_generate_v4(),
  name varchar(256) not null,
  slug varchar(256) not null unique,
  description text,
  long_description text,
  website_url varchar(1024) not null,
  logo_url varchar(1024),
  thumbnail_url varchar(1024),
  category varchar(128),
  pricing varchar(32) default 'free',
  tags jsonb default '[]',
  experience_level varchar(32) default 'beginner',
  save_count int default 0,
  view_count int default 0,
  status varchar(32) default 'published',
  is_featured boolean default false,
  affiliate_url varchar(1024),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tools_slug_idx on tools(slug);
create index if not exists tools_pricing_idx on tools(pricing);
create index if not exists tools_featured_idx on tools(is_featured);
create index if not exists tools_saves_idx on tools(save_count desc);

-- ============================================================
-- SUBSCRIBERS (newsletter)
-- ============================================================
create table if not exists subscribers (
  id uuid primary key default uuid_generate_v4(),
  email varchar(320) not null unique,
  name varchar(256),
  is_active boolean default true,
  source varchar(128) default 'website',
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

create index if not exists subscribers_email_idx on subscribers(email);
create index if not exists subscribers_active_idx on subscribers(is_active);

-- ============================================================
-- NEWSLETTER SENDS
-- ============================================================
create table if not exists newsletters (
  id uuid primary key default uuid_generate_v4(),
  subject varchar(512) not null,
  content text,
  sent_at timestamptz,
  recipient_count int default 0,
  status varchar(32) default 'draft',
  created_at timestamptz default now()
);

-- ============================================================
-- AD SLOTS
-- ============================================================
create table if not exists ad_slots (
  id uuid primary key default uuid_generate_v4(),
  slot_id varchar(128) not null unique,
  label varchar(256),
  size varchar(32),
  position varchar(128),
  is_active boolean default true,
  adsense_unit_id varchar(256),
  custom_html text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SITE SETTINGS (key-value store for admin config)
-- ============================================================
create table if not exists settings (
  key varchar(128) primary key,
  value text,
  description text,
  updated_at timestamptz default now()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
alter table categories enable row level security;
alter table sources enable row level security;
alter table articles enable row level security;
alter table tools enable row level security;
alter table subscribers enable row level security;
alter table newsletters enable row level security;
alter table ad_slots enable row level security;
alter table settings enable row level security;

-- Public read access for published content
create policy "Public read categories" on categories for select using (true);
create policy "Public read articles" on articles for select using (status = 'published');
create policy "Public read tools" on tools for select using (status = 'published');
create policy "Public read ad_slots" on ad_slots for select using (true);

-- Insert for newsletter signups (anyone can subscribe)
create policy "Anyone can subscribe" on subscribers for insert with check (true);

-- Settings public read
create policy "Public read settings" on settings for select using (true);

-- ============================================================
-- SEED: CATEGORIES
-- ============================================================
insert into categories (name, slug, description, dot_color, sort_order) values
  ('Latest News',       'latest-news',  'Breaking AI developments and announcements', '#0EA5E9', 1),
  ('Future of AI',      'future-of-ai', 'Trends, predictions, and emerging research',  '#8B5CF6', 2),
  ('Best AI Tools',     'best-ai-tools','Top AI tools, platforms, and applications',   '#10B981', 3),
  ('Make Money with AI','make-money',   'Side hustles, income strategies, guides',      '#F59E0B', 4),
  ('Learn AI',          'learn-ai',     'Courses, videos, books for professionals',     '#EF4444', 5)
on conflict (slug) do nothing;

-- ============================================================
-- SEED: RSS SOURCES
-- ============================================================
insert into sources (name, url, feed_url, source_type, is_active) values
  ('TechCrunch AI',    'https://techcrunch.com/category/artificial-intelligence/', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'rss', true),
  ('MIT Tech Review',  'https://www.technologyreview.com/topic/artificial-intelligence/', 'https://www.technologyreview.com/topic/artificial-intelligence/feed', 'rss', true),
  ('The Verge AI',     'https://www.theverge.com/ai-artificial-intelligence', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'rss', true),
  ('VentureBeat AI',   'https://venturebeat.com/category/ai/', 'https://venturebeat.com/category/ai/feed/', 'rss', true),
  ('Ars Technica AI',  'https://arstechnica.com/ai/', 'https://arstechnica.com/tag/artificial-intelligence/feed/', 'rss', true),
  ('Wired AI',         'https://www.wired.com/tag/artificial-intelligence/', 'https://www.wired.com/feed/tag/ai/latest/rss', 'rss', true)
on conflict do nothing;

-- ============================================================
-- SEED: TOOLS
-- ============================================================
insert into tools (name, slug, description, website_url, pricing, tags, experience_level, is_featured, save_count) values
  ('ChatGPT',       'chatgpt',      'The original AI assistant. Great for writing, brainstorming, and answering questions in plain English.',      'https://chat.openai.com',                  'freemium', '["Writing","Coding","Research"]',        'beginner',     true,  1240),
  ('Claude',        'claude',       'Exceptional for reading long documents, writing, and nuanced analysis. Very easy to use.',                    'https://claude.ai',                        'freemium', '["Writing","Analysis","Documents"]',     'beginner',     true,  986),
  ('Perplexity AI', 'perplexity',   'AI search that gives you direct answers with cited sources. Replaces Googling for most research.',           'https://perplexity.ai',                    'freemium', '["Search","Research","Citations"]',      'beginner',     true,  743),
  ('Midjourney',    'midjourney',   'Create stunning AI artwork and images from text descriptions. No design skills needed.',                     'https://midjourney.com',                   'paid',     '["Image Generation","Art","Design"]',    'beginner',     false, 621),
  ('Cursor',        'cursor',       'AI code editor that writes and explains code. Great for non-developers who want to build things.',           'https://cursor.sh',                        'freemium', '["Coding","Developer","Productivity"]',  'intermediate', true,  445),
  ('Jasper AI',     'jasper',       'AI writing platform for marketers and business owners. Creates content that sounds like your brand.',        'https://jasper.ai',                        'paid',     '["Marketing","Copywriting","Content"]',  'intermediate', false, 389),
  ('Notion AI',     'notion-ai',    'AI built into Notion for writing, summarizing, and organizing your notes and documents.',                   'https://notion.so',                        'paid',     '["Productivity","Writing","Notes"]',     'beginner',     false, 334),
  ('Runway ML',     'runway',       'Create and edit video with AI. Remove backgrounds, generate video clips from text.',                        'https://runwayml.com',                     'freemium', '["Video","Creative","Editing"]',         'intermediate', false, 298),
  ('Hugging Face',  'huggingface',  'The largest library of open-source AI models. Free to use, built for developers and researchers.',          'https://huggingface.co',                   'free',     '["Open Source","Models","Research"]',    'advanced',     false, 267),
  ('Canva AI',      'canva-ai',     'AI-powered design for people who are not designers. Create beautiful graphics, presentations, and more.',   'https://canva.com',                        'freemium', '["Design","Marketing","Social Media"]',  'beginner',     false, 521)
on conflict (slug) do nothing;

-- ============================================================
-- SEED: AD SLOTS
-- ============================================================
insert into ad_slots (slot_id, label, size, position, is_active) values
  ('top-leaderboard',  'Top Leaderboard',    'leaderboard', 'Above fold, below hero',         true),
  ('sidebar',          'Sidebar Rectangle',  'rectangle',   'Right sidebar, sticky',           true),
  ('in-feed',          'In-Feed Native',     'banner',      'Between article rows',            true),
  ('bottom-leaderboard','Bottom Leaderboard','leaderboard', 'Below main content',              true),
  ('pre-footer',       'Pre-Footer Banner',  'banner',      'Above footer',                    true)
on conflict (slot_id) do nothing;

-- ============================================================
-- SEED: SETTINGS
-- ============================================================
insert into settings (key, value, description) values
  ('site_name',           'AI Foresights',              'Site display name'),
  ('tagline',             'A New Dawn Is Here',          'Site tagline'),
  ('subscriber_count',    '2400',                        'Displayed subscriber count'),
  ('rss_auto_publish',    'true',                        'Auto-publish RSS articles without review'),
  ('newsletter_frequency','weekly',                      'Newsletter send frequency'),
  ('adsense_publisher_id','',                            'Google AdSense publisher ID (ca-pub-xxxxxxxx)'),
  ('mailchimp_list_id',   '',                            'Mailchimp audience/list ID')
on conflict (key) do nothing;
