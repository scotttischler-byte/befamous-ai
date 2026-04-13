import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  computeScoresForPost,
  normalizeScores,
  rawPerformanceSignal,
} from "@/lib/scoring-engine";
import type { PostMetricsRow } from "@/lib/types";

type MetricRow = PostMetricsRow;

/** Latest metric row per post (by recorded_at). */
async function latestMetricsByPost(): Promise<Map<string, MetricRow>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("post_metrics")
    .select("*")
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  const map = new Map<string, MetricRow>();
  for (const row of data ?? []) {
    if (!map.has(row.post_id)) {
      map.set(row.post_id, row as MetricRow);
    }
  }
  return map;
}

export async function recalculateScoresForAllPosts(): Promise<{
  scored: number;
}> {
  const supabase = getSupabaseAdmin();
  const metricsMap = await latestMetricsByPost();

  const { data: posts, error: pErr } = await supabase.from("posts").select("*");
  if (pErr) throw pErr;
  if (!posts?.length) return { scored: 0 };

  const raws = posts.map((p) => {
    const m = metricsMap.get(p.id);
    if (!m) {
      return {
        post: p,
        raw: 0,
        m: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          followers_gained: 0,
          leads_generated: 0,
        },
      };
    }
    return {
      post: p,
      raw: rawPerformanceSignal(m),
      m: {
        views: m.views,
        likes: m.likes,
        comments: m.comments,
        shares: m.shares,
        saves: m.saves,
        followers_gained: m.followers_gained,
        leads_generated: m.leads_generated,
      },
    };
  });

  const rawScores = raws.map((r) => r.raw);
  const normalized = normalizeScores(rawScores);

  let scored = 0;
  for (let i = 0; i < raws.length; i++) {
    const { post, m } = raws[i]!;
    const viral = normalized[i] ?? 0;
    const computed = computeScoresForPost(post, m, viral);
    const { error } = await supabase.from("post_scores").insert({
      post_id: post.id,
      viral_score: computed.viral_score,
      hook_score: computed.hook_score,
      engagement_rate: computed.engagement_rate,
      follower_conversion_score: computed.follower_conversion_score,
      lead_score: computed.lead_score,
    });
    if (error) throw error;
    scored++;
  }

  return { scored };
}
