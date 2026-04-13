export type Platform = "instagram" | "tiktok" | "youtube_shorts";

export type BrandTag =
  | "MVA"
  | "LAW_FIRM"
  | "FITNESS"
  | "NBA_DOG_TAGS"
  | "GAMEDAY_RINGS"
  | "PERSONAL_BRAND";

export type PostStatus = "draft" | "posted";

export type BrandRow = {
  id: string;
  brand_tag: string;
  name: string;
  audience: string;
  tone: string;
  primary_goal: string;
  cta_style: string;
  offer: string;
  preferred_platforms: string[];
  created_at: string;
};

export type PlatformVariants = Partial<
  Record<
    Platform,
    { caption?: string; hashtags?: string; hook?: string; cta?: string }
  >
>;

export type ContentPostRow = {
  id: string;
  brand_id: string;
  brand_tag: string;
  platform: Platform;
  content: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  platform_variants: PlatformVariants;
  image_url: string;
  video_url: string;
  generate_for_leads: boolean;
  status: PostStatus;
  created_at: string;
};

export type PerformanceRow = {
  id: string;
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  score: number;
  recorded_at: string;
};

export type WinningPatternRow = {
  id: string;
  brand_id: string;
  hook_pattern: string;
  cta_pattern: string;
  topic: string;
  avg_score: number;
  updated_at: string;
};

export type PostMetricsInput = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
};

export type AnalyzedPost = {
  post: ContentPostRow;
  score: number;
};
