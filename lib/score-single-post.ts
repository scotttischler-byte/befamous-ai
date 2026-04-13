import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  computeScoresForPost,
  normalizeScores,
  rawPerformanceSignal,
} from "@/lib/scoring-engine";
import type { PostMetricsRow } from "@/lib/types";

export type MetricInput = {
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers_gained: number;
  leads_generated: number;
  posted_at?: string | null;
};

export async function recordMetricsAndScore(
  input: MetricInput
): Promise<{
  scores: ReturnType<typeof computeScoresForPost>;
  metric: PostMetricsRow;
}> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("post_metrics")
    .insert({
      post_id: input.post_id,
      views: input.views,
      likes: input.likes,
      comments: input.comments,
      shares: input.shares,
      saves: input.saves,
      followers_gained: input.followers_gained,
      leads_generated: input.leads_generated,
      posted_at: input.posted_at ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return scorePostAfterMetrics(input.post_id, data as PostMetricsRow);
}

/** Latest metric row per post for brand (for normalization context). */
async function latestMetricsForBrandPosts(brandId: string) {
  const supabase = getSupabaseAdmin();
  const { data: posts, error: pErr } = await supabase
    .from("posts")
    .select("id")
    .eq("brand_id", brandId);
  if (pErr) throw pErr;
  const ids = (posts ?? []).map((p) => p.id);
  if (!ids.length) return new Map<string, PostMetricsRow>();

  const { data: metrics, error: mErr } = await supabase
    .from("post_metrics")
    .select("*")
    .in("post_id", ids)
    .order("recorded_at", { ascending: false });
  if (mErr) throw mErr;

  const map = new Map<string, PostMetricsRow>();
  for (const row of metrics ?? []) {
    if (!map.has(row.post_id)) {
      map.set(row.post_id, row as PostMetricsRow);
    }
  }
  return map;
}

export async function scorePostAfterMetrics(
  postId: string,
  metricRow: PostMetricsRow
): Promise<{
  scores: ReturnType<typeof computeScoresForPost>;
  metric: PostMetricsRow;
}> {
  const supabase = getSupabaseAdmin();
  const { data: post, error: pErr } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();
  if (pErr || !post) throw new Error("Post not found");

  const brandMetrics = await latestMetricsForBrandPosts(post.brand_id);
  brandMetrics.set(postId, metricRow);

  const { data: brandPosts, error: bpErr } = await supabase
    .from("posts")
    .select("id, hook")
    .eq("brand_id", post.brand_id);
  if (bpErr) throw bpErr;

  const raws = (brandPosts ?? []).map((p) => {
    const m = brandMetrics.get(p.id);
    if (!m) return 0;
    return rawPerformanceSignal(m);
  });
  const normalized = normalizeScores(raws);
  const idx = (brandPosts ?? []).findIndex((p) => p.id === postId);
  const viralNorm = idx >= 0 ? normalized[idx] ?? 0 : 50;

  const scores = computeScoresForPost(post, metricRow, viralNorm);

  const { error: insErr } = await supabase.from("post_scores").insert({
    post_id: postId,
    viral_score: scores.viral_score,
    hook_score: scores.hook_score,
    engagement_rate: scores.engagement_rate,
    follower_conversion_score: scores.follower_conversion_score,
    lead_score: scores.lead_score,
  });
  if (insErr) throw insErr;

  return { scores, metric: metricRow };
}
