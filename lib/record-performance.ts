import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calculateScore } from "@/lib/score";
import type { PostMetricsInput } from "@/lib/types";

export async function recordPerformance(
  postId: string,
  metrics: PostMetricsInput
): Promise<{ score: number }> {
  const supabase = getSupabaseAdmin();
  const score = calculateScore(metrics);
  const conversion = metrics.conversion_estimate ?? 0;
  const { error } = await supabase.from("performance").insert({
    post_id: postId,
    views: metrics.views,
    likes: metrics.likes,
    comments: metrics.comments,
    shares: metrics.shares,
    saves: metrics.saves ?? 0,
    conversion_estimate: conversion,
    score,
  });
  if (error) throw error;

  await supabase.from("performance_logs").insert({
    post_id: postId,
    views: metrics.views,
    likes: metrics.likes,
    comments: metrics.comments,
    shares: metrics.shares,
    conversion_estimate: conversion,
    score,
  });

  await supabase.from("posts").update({ score }).eq("id", postId);

  return { score };
}
