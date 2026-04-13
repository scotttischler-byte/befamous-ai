-- BeFamous Growth Engine (BGE) — Phase 1 schema
-- Run in Supabase SQL Editor or via supabase db push

create extension if not exists "pgcrypto";

create type public.post_status as enum ('draft', 'posted');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  content_text text not null default '',
  hook text not null default '',
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube_shorts')),
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
  "timestamp" timestamptz not null default now()
);

create table public.post_scores (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  viral_score double precision not null check (viral_score >= 0 and viral_score <= 100),
  hook_score double precision,
  retention_estimate double precision,
  engagement_rate double precision,
  created_at timestamptz not null default now()
);

create index post_metrics_post_id_idx on public.post_metrics (post_id);
create index post_metrics_timestamp_idx on public.post_metrics ("timestamp" desc);
create index post_scores_post_id_idx on public.post_scores (post_id);
create index post_scores_viral_score_idx on public.post_scores (viral_score desc);
create index posts_platform_status_idx on public.posts (platform, status);
create index posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;
alter table public.post_metrics enable row level security;
alter table public.post_scores enable row level security;

-- Authenticated users can manage their workspace data (extend with user_id later)
create policy "posts_authenticated_all"
  on public.posts for all
  to authenticated
  using (true)
  with check (true);

create policy "post_metrics_authenticated_all"
  on public.post_metrics for all
  to authenticated
  using (true)
  with check (true);

create policy "post_scores_authenticated_all"
  on public.post_scores for all
  to authenticated
  using (true)
  with check (true);

-- Service role bypasses RLS by default; anon has no access until you add public read policies
