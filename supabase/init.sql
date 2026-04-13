-- Minimal bootstrap schema (CREATE IF NOT EXISTS).
-- Production BeFamous stack (brands, posts.script, visual_plan, score, performance_logs, viral scoring): use schema.sql

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  brand text,
  platform text,
  hook text,
  caption text,
  cta text,
  hashtags text,
  status text DEFAULT 'draft',
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid,
  views int DEFAULT 0,
  likes int DEFAULT 0,
  comments int DEFAULT 0,
  shares int DEFAULT 0,
  saves int DEFAULT 0,
  score float DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS winning_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_pattern text,
  cta_pattern text,
  topic text,
  avg_score float,
  created_at timestamp DEFAULT now()
);
