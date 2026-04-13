export type Platform = "instagram" | "tiktok" | "youtube_shorts";

export type ContentBucket =
  | "authority"
  | "story"
  | "education"
  | "controversy"
  | "conversion";

export type PostItemKind =
  | "hook"
  | "caption"
  | "cta"
  | "video_idea"
  | "lead_post"
  | "conversion_post"
  | "ad_script"
  | "lead_magnet"
  | "post";

export type PostStatus = "draft" | "posted" | "archived";

export type AssetType = "image" | "video" | "other";
export type AssetStatus = "queued" | "attached" | "published";

export type BrandRow = {
  id: string;
  name: string;
  niche: string;
  audience: string;
  offer: string;
  tone: string;
  primary_goal: string;
  preferred_platforms: string[];
  call_to_action_style: string;
  created_at: string;
};

export type PostRow = {
  id: string;
  brand_id: string;
  generation_batch_id: string | null;
  content_bucket: ContentBucket;
  platform: Platform;
  hook: string;
  body: string;
  caption: string;
  cta: string;
  video_idea: string;
  lead_magnet_idea: string;
  item_kind: PostItemKind;
  queued_asset_id: string | null;
  status: PostStatus;
  created_at: string;
};

export type PostMetricsRow = {
  id: string;
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers_gained: number;
  leads_generated: number;
  posted_at: string | null;
  recorded_at: string;
};

export type PostScoreRow = {
  id: string;
  post_id: string;
  viral_score: number;
  hook_score: number | null;
  engagement_rate: number | null;
  follower_conversion_score: number | null;
  lead_score: number | null;
  created_at: string;
};

export type LearningInsightRow = {
  id: string;
  brand_id: string;
  winning_patterns: unknown;
  top_keywords: unknown;
  best_hooks: unknown;
  top_buckets: unknown;
  cta_styles: unknown;
  notes: string;
  created_at: string;
};

export type QueuedAssetRow = {
  id: string;
  brand_id: string;
  asset_type: AssetType;
  asset_url: string;
  asset_name: string;
  status: AssetStatus;
  created_at: string;
};

export type CampaignItem = {
  content_bucket: ContentBucket;
  item_kind: PostItemKind;
  platform: Platform;
  hook: string;
  body: string;
  caption: string;
  cta: string;
  video_idea: string;
  lead_magnet_idea: string;
};

export type CampaignPackage = {
  batch_label: string;
  brand_id?: string;
  items: CampaignItem[];
};

export type WinningPatternsPayload = {
  common_hook_patterns: string[];
  top_keywords: { word: string; count: number }[];
  content_types: string[];
  top_buckets: { bucket: ContentBucket; count: number }[];
  cta_styles: string[];
  sample_hooks: string[];
  summary: string;
};
