import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  analyzeWinningPatterns,
  type PostForLearning,
} from "@/lib/learning-engine";
import type { WinningPatterns } from "@/lib/types";

/** Latest score per post, joined with post copy — for learning. */
export async function fetchTopPostsForLearning(
  percentile: number = 0.2
): Promise<PostForLearning[]> {
  const supabase = getSupabaseAdmin();

  const { data: scores, error: scoresError } = await supabase
    .from("post_scores")
    .select("post_id, viral_score, created_at")
    .order("created_at", { ascending: false });

  if (scoresError) throw scoresError;
  if (!scores?.length) return [];

  const latestByPost = new Map<string, { viral_score: number }>();
  for (const row of scores) {
    if (!latestByPost.has(row.post_id)) {
      latestByPost.set(row.post_id, { viral_score: row.viral_score });
    }
  }

  const unique = [...latestByPost.entries()].sort(
    (a, b) => b[1].viral_score - a[1].viral_score
  );
  const scoreMap = new Map(
    unique.map(([id, v]) => [id, v.viral_score] as const)
  );
  const cut = Math.max(1, Math.ceil(unique.length * percentile));
  const topIds = unique.slice(0, cut).map(([id]) => id);

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, hook, content_text, platform")
    .in("id", topIds);

  if (postsError) throw postsError;
  if (!posts?.length) return [];

  return posts.map((p) => ({
    hook: p.hook ?? "",
    content_text: p.content_text ?? "",
    viral_score: scoreMap.get(p.id) ?? 0,
    platform: p.platform ?? undefined,
  }));
}

export async function getWinningPatterns(): Promise<WinningPatterns> {
  const posts = await fetchTopPostsForLearning(0.2);
  return analyzeWinningPatterns(posts);
}

export function formatPatternsForPrompt(p: WinningPatterns): string {
  if (!p.common_hook_patterns.length && !p.top_keywords.length) {
    return "No historical winners yet — prioritize bold pattern interrupts and sub-12-word hooks.";
  }
  const kw = p.top_keywords
    .slice(0, 8)
    .map((k) => k.word)
    .join(", ");
  return [
    "WINNING PATTERNS (from your top 20% posts):",
    `Hook structures: ${p.common_hook_patterns.join("; ") || "n/a"}`,
    `Strong keywords/themes: ${kw || "n/a"}`,
    `Content shapes: ${p.content_types.join(", ") || "n/a"}`,
    `Reference hooks: ${p.sample_hooks.slice(0, 3).map((h) => JSON.stringify(h)).join(" | ")}`,
  ].join("\n");
}
