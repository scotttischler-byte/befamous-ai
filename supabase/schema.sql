-- BeFamous Growth Engine — autonomous content + growth (Phase 2)
-- Destructive reset: drops prior BGE tables.

create extension if not exists "pgcrypto";

drop table if exists public.winning_patterns cascade;
drop table if exists public.performance cascade;
drop table if exists public.posts cascade;
drop table if exists public.brands cascade;

drop type if exists public.post_status cascade;

create type public.post_status as enum ('draft', 'posted');

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  brand_tag text not null unique,
  name text not null,
  audience text not null default '',
  tone text not null default '',
  primary_goal text not null default '',
  cta_style text not null default '',
  offer text not null default '',
  preferred_platforms text[] not null default array['tiktok']::text[],
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  brand_tag text not null,
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube_shorts')),
  content text not null default '',
  hook text not null default '',
  caption text not null default '',
  cta text not null default '',
  hashtags text not null default '',
  platform_variants jsonb not null default '{}'::jsonb,
  image_url text not null default '',
  video_url text not null default '',
  generate_for_leads boolean not null default false,
  status public.post_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.performance (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  views integer not null default 0 check (views >= 0),
  likes integer not null default 0 check (likes >= 0),
  comments integer not null default 0 check (comments >= 0),
  shares integer not null default 0 check (shares >= 0),
  saves integer not null default 0 check (saves >= 0),
  score double precision not null,
  recorded_at timestamptz not null default now()
);

create table public.winning_patterns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  hook_pattern text not null default '',
  cta_pattern text not null default '',
  topic text not null default '',
  avg_score double precision not null default 0,
  updated_at timestamptz not null default now()
);

create index posts_brand_status_idx on public.posts (brand_id, status, created_at desc);
create index posts_brand_tag_idx on public.posts (brand_tag);
create index performance_post_ts_idx on public.performance (post_id, recorded_at desc);
create index winning_patterns_brand_idx on public.winning_patterns (brand_id, avg_score desc);

alter table public.brands enable row level security;
alter table public.posts enable row level security;
alter table public.performance enable row level security;
alter table public.winning_patterns enable row level security;

create policy "brands_auth" on public.brands for all to authenticated using (true) with check (true);
create policy "posts_auth" on public.posts for all to authenticated using (true) with check (true);
create policy "performance_auth" on public.performance for all to authenticated using (true) with check (true);
create policy "winning_patterns_auth" on public.winning_patterns for all to authenticated using (true) with check (true);

-- Seed six operator brands (idempotent by brand_tag)
insert into public.brands (brand_tag, name, audience, tone, primary_goal, cta_style, offer, preferred_platforms)
select * from (values
  ('MVA', 'MVA', 'Accident victims & injured drivers', 'Urgent, empathetic, authoritative', 'Leads — free case review', 'Call / DM now — time-sensitive', 'Free case review for accident victims', array['tiktok','instagram','youtube_shorts']::text[]),
  ('LAW_FIRM', 'Law Firm', 'Attorneys & firm marketing leaders', 'Credible, professional, emotionally intelligent', 'Leads & consults', 'Free case evaluation / protect your rights', 'Free intake audit & case review', array['instagram','youtube_shorts','tiktok']::text[]),
  ('FITNESS', 'Fitness', 'Busy adults chasing transformation', 'Bold, disciplined, high-energy', 'Followers + applications', 'Apply / book call — proof-first', 'Performance coaching for busy professionals', array['tiktok','instagram','youtube_shorts']::text[]),
  ('NBA_DOG_TAGS', 'NBA Dog Tags', 'NBA fans & gift buyers', 'Pride, exclusivity, collectible energy', 'Orders + list growth', 'Shop link / limited drop', 'Premium NBA hardwood dog tags', array['tiktok','instagram','youtube_shorts']::text[]),
  ('GAMEDAY_RINGS', 'GameDay Rings', 'Athletes & fans', 'Game-day identity, giftability', 'Orders + DMs', 'Link in bio / claim yours', 'Silicone sports rings for fans', array['instagram','tiktok','youtube_shorts']::text[]),
  ('PERSONAL_BRAND', 'Personal Brand', 'Operators building authority', 'Contrarian, direct, proof-heavy', 'Authority + inbound leads', 'DM keyword / join list', '1:1 advisory & mentorship access', array['youtube_shorts','instagram','tiktok']::text[])
) as v(brand_tag, name, audience, tone, primary_goal, cta_style, offer, preferred_platforms)
where not exists (select 1 from public.brands b where b.brand_tag = v.brand_tag);
