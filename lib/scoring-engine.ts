import type { PostMetricsRow, PostRow } from "@/lib/types";

/** Weighted raw signal — modular constants for tuning. */
export function rawPerformanceSignal(m: Pick<
  PostMetricsRow,
  | "views"
  | "likes"
  | "comments"
  | "shares"
  | "saves"
  | "followers_gained"
  | "leads_generated"
>): number {
  return (
    m.views * 0.28 +
    m.likes * 0.18 +
    m.comments * 0.12 +
    m.shares * 0.12 +
    m.saves * 0.1 +
    m.followers_gained * 0.1 +
    m.leads_generated * 0.1
  );
}

export function normalizeScores(raw: number[]): number[] {
  if (!raw.length) return [];
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  if (max <= min) return raw.map(() => 50);
  return raw.map((r) =>
    Math.round(((r - min) / (max - min)) * 100 * 100) / 100
  );
}

export function hookQualityScore(hook: string): number {
  const h = hook.trim();
  if (!h) return 0;
  let s = 38;
  if (/\?/.test(h)) s += 14;
  if (/\d/.test(h)) s += 10;
  if (/^(you|your|stop|don't|do not|never)/i.test(h)) s += 12;
  if (/^(pov|watch|this is)/i.test(h)) s += 10;
  if (h.length >= 28 && h.length <= 130) s += 10;
  return Math.min(100, s);
}

export function engagementRate(m: Pick<
  PostMetricsRow,
  "views" | "likes" | "comments" | "shares" | "saves"
>): number {
  if (m.views <= 0) return 0;
  const t = m.likes + m.comments + m.shares + m.saves;
  return Math.min(100, Math.round((t / m.views) * 100 * 100) / 100);
}

/** Followers per 1k views, scaled to 0–100 */
export function followerConversionScore(m: Pick<
  PostMetricsRow,
  "views" | "followers_gained"
>): number {
  if (m.views <= 0) return m.followers_gained > 0 ? 80 : 0;
  const per1k = (m.followers_gained / m.views) * 1000;
  return Math.min(100, Math.round(per1k * 400) / 100);
}

/** Leads per 1k views, scaled to 0–100 */
export function leadScoreMetric(m: Pick<
  PostMetricsRow,
  "views" | "leads_generated"
>): number {
  if (m.views <= 0) return m.leads_generated > 0 ? 90 : 0;
  const per1k = (m.leads_generated / m.views) * 1000;
  return Math.min(100, Math.round(per1k * 500) / 100);
}

export type ComputedScores = {
  viral_score: number;
  hook_score: number;
  engagement_rate: number;
  follower_conversion_score: number;
  lead_score: number;
};

export function computeScoresForPost(
  post: Pick<PostRow, "hook">,
  m: Pick<
    PostMetricsRow,
    | "views"
    | "likes"
    | "comments"
    | "shares"
    | "saves"
    | "followers_gained"
    | "leads_generated"
  >,
  /** Pre-normalized viral 0–100 for this batch */
  viralNormalized: number
): ComputedScores {
  return {
    viral_score: viralNormalized,
    hook_score: hookQualityScore(post.hook ?? ""),
    engagement_rate: engagementRate(m),
    follower_conversion_score: followerConversionScore(m),
    lead_score: leadScoreMetric(m),
  };
}
