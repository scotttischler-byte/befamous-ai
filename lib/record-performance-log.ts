import { calculateScore } from "@/lib/score";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PostMetricsLogInput } from "@/lib/types";

/**
 * Append to performance_logs and sync posts.score + legacy performance row.
 */
export async function recordPerformanceLog(
  input: PostMetricsLogInput
): Promise<{ score: number }> {
  const supabase = getSupabaseAdmin();
  const metrics = {
    views: input.views,
    likes: input.likes,
    comments: input.comments,
    shares: input.shares,
    conversion_estimate: input.conversion_estimate,
  };
  const score = calculateScore(metrics);

  const { error: logErr } = await supabase.from("performance_logs").insert({
    post_id: input.post_id,
    views: input.views,
    likes: input.likes,
    comments: input.comments,
    shares: input.shares,
    conversion_estimate: input.conversion_estimate,
    score,
  });
  if (logErr) throw logErr;

  const { error: postErr } = await supabase
    .from("posts")
    .update({ score })
    .eq("id", input.post_id);
  if (postErr) throw postErr;

  const { error: perfErr } = await supabase.from("performance").insert({
    post_id: input.post_id,
    views: input.views,
    likes: input.likes,
    comments: input.comments,
    shares: input.shares,
    saves: 0,
    conversion_estimate: input.conversion_estimate,
    score,
  });
  if (perfErr) throw perfErr;

  return { score };
}
