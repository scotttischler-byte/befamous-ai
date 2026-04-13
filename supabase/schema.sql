-- BeFamous Growth Engine — full internal schema (multi-brand)
-- Apply in Supabase SQL Editor or: supabase db reset / migrate

create extension if not exists "pgcrypto";

-- Clean slate (comment out if upgrading live data you need to keep)
drop table if exists public.queued_assets cascade;
drop table if exists public.learning_insights cascade;
drop table if exists public.post_scores cascade;
drop table if exists public.post_metrics cascade;
drop table if exists public.posts cascade;
drop table if exists public.brands cascade;

drop type if exists public.post_status cascade;
drop type if exists public.asset_status cascade;
drop type if exists public.asset_type_enum cascade;

create type public.post_status as enum ('draft', 'posted', 'archived');
create type public.asset_type_enum as enum ('image', 'video', 'other');
create type public.asset_status as enum ('queued', 'attached', 'published');

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche text not null default '',
  audience text not null default '',
  offer text not null default '',
  tone text not null default '',
  primary_goal text not null default '',
  preferred_platforms text[] not null default array['tiktok']::text[],
  call_to_action_style text not null default '',
  created_at timestamptz not null default now()
);

create table public.queued_assets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  asset_type public.asset_type_enum not null default 'other',
  asset_url text not null default '',
  asset_name text not null default '',
  status public.asset_status not null default 'queued',
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  generation_batch_id uuid,
  content_bucket text not null check (
    content_bucket in (
      'authority',
      'story',
      'education',
      'controversy',
      'conversion'
    )
  ),
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube_shorts')),
  hook text not null default '',
  body text not null default '',
  caption text not null default '',
  cta text not null default '',
  video_idea text not null default '',
  lead_magnet_idea text not null default '',
  item_kind text not null default 'post' check (
    item_kind in (
      'hook',
      'caption',
      'cta',
      'video_idea',
      'lead_post',
      'conversion_post',
      'ad_script',
      'lead_magnet',
      'post'
    )
  ),
  queued_asset_id uuid references public.queued_assets (id) on delete set null,
  status public.post_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.post_metrics (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  views integer not null default 0 check (views >= 0),
  likes integer not null default 0 check (likes >= 0),
  comments integer not null default 0 check (comments >= 0),
  shares integer not null default 0 check (shares >= 0),
  saves integer not null default 0 check (saves >= 0),
  followers_gained integer not null default 0 check (followers_gained >= 0),
  leads_generated integer not null default 0 check (leads_generated >= 0),
  posted_at timestamptz,
  recorded_at timestamptz not null default now()
);

create table public.post_scores (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  viral_score double precision not null check (viral_score >= 0 and viral_score <= 100),
  hook_score double precision,
  engagement_rate double precision,
  follower_conversion_score double precision,
  lead_score double precision,
  created_at timestamptz not null default now()
);

create table public.learning_insights (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  winning_patterns jsonb not null default '[]'::jsonb,
  top_keywords jsonb not null default '[]'::jsonb,
  best_hooks jsonb not null default '[]'::jsonb,
  top_buckets jsonb not null default '[]'::jsonb,
  cta_styles jsonb not null default '[]'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (brand_id)
);

create index posts_brand_status_idx on public.posts (brand_id, status, created_at desc);
create index posts_batch_idx on public.posts (generation_batch_id);
create index post_metrics_post_idx on public.post_metrics (post_id, recorded_at desc);
create index post_scores_post_idx on public.post_scores (post_id, created_at desc);
create index queued_assets_brand_idx on public.queued_assets (brand_id, created_at desc);

alter table public.brands enable row level security;
alter table public.posts enable row level security;
alter table public.post_metrics enable row level security;
alter table public.post_scores enable row level security;
alter table public.learning_insights enable row level security;
alter table public.queued_assets enable row level security;

create policy "brands_authenticated"
  on public.brands for all to authenticated using (true) with check (true);
create policy "posts_authenticated"
  on public.posts for all to authenticated using (true) with check (true);
create policy "post_metrics_authenticated"
  on public.post_metrics for all to authenticated using (true) with check (true);
create policy "post_scores_authenticated"
  on public.post_scores for all to authenticated using (true) with check (true);
create policy "learning_insights_authenticated"
  on public.learning_insights for all to authenticated using (true) with check (true);
create policy "queued_assets_authenticated"
  on public.queued_assets for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Seed default brand profiles (idempotent)
-- ---------------------------------------------------------------------------
create unique index if not exists brands_name_unique on public.brands (lower(name));

insert into public.brands (name, niche, audience, offer, tone, primary_goal, preferred_platforms, call_to_action_style)
select * from (values
  (
    'MVA',
    'Motor vehicle accident victims & injury leads',
    'People recently in a car accident; overwhelmed; searching for help',
    'Free case review for accident victims',
    'Urgent, empathetic, authority-driven',
    'Qualified injury leads + consult bookings',
    array['tiktok', 'instagram', 'youtube_shorts']::text[],
    'DM CRASH, call now, or book consult — always time-sensitive'
  ),
  (
    'Law Firm Marketing',
    'Law firm growth & intake',
    'Firm owners & marketing managers who need cases, not vanity metrics',
    'Free marketing audit / case intake system review',
    'Credible, professional, emotionally intelligent',
    'More signed cases from paid + organic',
    array['instagram', 'youtube_shorts', 'tiktok']::text[],
    'Free consultation / case review — emphasize deadlines and rights'
  ),
  (
    'Fitness',
    'Performance & body transformation',
    'Busy men 35-55 who want strength, energy, and visible results',
    'Performance coaching for busy men over 40',
    'Bold, disciplined, high-energy — no soft wellness fluff',
    'Applications to coaching / program waitlist',
    array['tiktok', 'instagram', 'youtube_shorts']::text[],
    'Apply / book call / download protocol — proof-first'
  ),
  (
    'NBA / GameDay Global',
    'Sports fans, collectors, gift buyers',
    'NBA fans, gift givers, collectors who want premium fan accessories',
    'Premium NBA hardwood dog tags and silicone sports rings',
    'Fan pride, exclusivity, giftability, game-day energy',
    'Daily orders + email/SMS list growth',
    array['tiktok', 'instagram', 'youtube_shorts']::text[],
    'Shop link, limited drop, link in bio with urgency'
  ),
  (
    'Real Estate / Business',
    'Wealth, deals, business authority',
    'Investors and entrepreneurs hunting leverage and off-market edge',
    'Off-market real estate deals and deal-making mentorship',
    'Contrarian authority, credibility, behind-the-scenes',
    'Lead list + strategy call + deal flow',
    array['youtube_shorts', 'instagram', 'tiktok']::text[],
    'DM DEALS, join list, book strategy call'
  )
) as v(name, niche, audience, offer, tone, primary_goal, preferred_platforms, call_to_action_style)
where not exists (select 1 from public.brands b where lower(b.name) = lower(v.name));
