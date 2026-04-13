import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calculateScore } from "@/lib/score";
import type { PostMetricsInput } from "@/lib/types";

export async function recordPerformance(
  postId: string,
  metrics: PostMetricsInput
): Promise<{ score: number }> {
  const supabase = getSupabaseAdmin();
  const score = calculateScore(metrics);
  const { error } = await supabase.from("performance").insert({
    post_id: postId,
    views: metrics.views,
    likes: metrics.likes,
    comments: metrics.comments,
    shares: metrics.shares,
    saves: metrics.saves,
    score,
  });
  if (error) throw error;
  return { score };
}
