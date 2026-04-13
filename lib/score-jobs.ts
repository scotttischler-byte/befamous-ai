import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  engagementRateFromMetrics,
  hookQualityScore,
  normalizeToViralScores,
  rawViralSignal,
  retentionEstimateFromHook,
} from "@/lib/scoring";

/** Aggregate latest metrics per post (sum across rows — adjust if you prefer last row only). */
export async function recalculateAllScores(): Promise<{ updated: number }> {
  const supabase = getSupabaseAdmin();

  const { data: posts, error: pErr } = await supabase.from("posts").select("id, hook");
  if (pErr) throw pErr;
  if (!posts?.length) return { updated: 0 };

  const { data: metrics, error: mErr } = await supabase.from("post_metrics").select("*");
  if (mErr) throw mErr;

  type M = NonNullable<typeof metrics>[number];
  const byPost = new Map<string, M[]>();
  for (const row of metrics ?? []) {
    const list = byPost.get(row.post_id) ?? [];
    list.push(row);
    byPost.set(row.post_id, list);
  }

  function aggregate(postId: string) {
    const rows = byPost.get(postId) ?? [];
    if (!rows.length) {
      return {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        followers_gained: 0,
      };
    }
    return rows.reduce(
      (acc, r) => ({
        views: acc.views + r.views,
        likes: acc.likes + r.likes,
        comments: acc.comments + r.comments,
        shares: acc.shares + r.shares,
        saves: acc.saves + r.saves,
        followers_gained: acc.followers_gained + r.followers_gained,
      }),
      {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        followers_gained: 0,
      }
    );
  }

  const raws = posts.map((p) => rawViralSignal(aggregate(p.id)));
  const normalized = normalizeToViralScores(raws);

  let updated = 0;
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]!;
    const agg = aggregate(post.id);
    const viral_score = normalized[i] ?? 0;
    const hook_score = hookQualityScore(post.hook ?? "");
    const retention_estimate = retentionEstimateFromHook(post.hook ?? "");
    const engagement_rate = engagementRateFromMetrics(agg);

    const { error } = await supabase.from("post_scores").insert({
      post_id: post.id,
      viral_score,
      hook_score,
      retention_estimate,
      engagement_rate,
    });
    if (error) throw error;
    updated++;
  }

  return { updated };
}
