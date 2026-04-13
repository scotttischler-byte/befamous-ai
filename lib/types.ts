export type Platform = "instagram" | "tiktok" | "youtube_shorts";
export type PostStatus = "draft" | "posted";

export type PostRow = {
  id: string;
  content_text: string;
  hook: string;
  platform: Platform;
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
  timestamp: string;
};

export type PostScoreRow = {
  id: string;
  post_id: string;
  viral_score: number;
  hook_score: number | null;
  retention_estimate: number | null;
  engagement_rate: number | null;
  created_at: string;
};

export type WinningPatterns = {
  common_hook_patterns: string[];
  top_keywords: { word: string; count: number }[];
  content_types: string[];
  sample_hooks: string[];
  summary: string;
};
