import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AnalyzedPost, ContentPostRow } from "@/lib/types";

async function latestPerformanceByPost(): Promise<Map<string, number>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("performance")
    .select("post_id, score, recorded_at")
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    if (!map.has(row.post_id)) {
      map.set(row.post_id, row.score as number);
    }
  }
  return map;
}

/** Posts joined with their latest performance score (0 if none). */
export async function analyzeTopPosts(
  brandId?: string
): Promise<AnalyzedPost[]> {
  const supabase = getSupabaseAdmin();
  let q = supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (brandId) q = q.eq("brand_id", brandId);
  const { data: posts, error } = await q.limit(500);
  if (error) throw error;

  const scores = await latestPerformanceByPost();
  const list: AnalyzedPost[] = (posts ?? []).map((p) => ({
    post: p as ContentPostRow,
    score: scores.get(p.id) ?? 0,
  }));

  list.sort((a, b) => b.score - a.score);
  return list;
}

export type ExtractedPattern = {
  brand_id: string;
  hook_pattern: string;
  cta_pattern: string;
  topic: string;
  avg_score: number;
};

/** Derive pattern rows from top 10% scored posts for a brand. */
export function extractWinningPatterns(
  analyzed: AnalyzedPost[],
  brandId: string
): ExtractedPattern[] {
  const brandPosts = analyzed.filter((a) => a.post.brand_id === brandId);
  if (!brandPosts.length) return [];

  const withScore = brandPosts.filter((a) => a.score > 0);
  const pool = withScore.length ? withScore : brandPosts;
  const cut = Math.max(1, Math.ceil(pool.length * 0.1));
  const top = pool.slice(0, cut);

  return top.map((a) => {
    const firstTag =
      a.post.hashtags
        .split(/[\s#,]+/)
        .map((t) => t.trim())
        .find((t) => t.length > 2) ?? "general";
    return {
      brand_id: brandId,
      hook_pattern: a.post.hook.slice(0, 160) || "(no hook)",
      cta_pattern: a.post.cta.slice(0, 160) || "(no cta)",
      topic: firstTag.toLowerCase(),
      avg_score: a.score,
    };
  });
}

/** Replace learned rows for a brand. */
export async function updateWinningPatterns(brandId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const analyzed = await analyzeTopPosts(brandId);
  const rows = extractWinningPatterns(analyzed, brandId);

  await supabase.from("winning_patterns").delete().eq("brand_id", brandId);

  if (!rows.length) return 0;

  const { error } = await supabase.from("winning_patterns").insert(
    rows.map((r) => ({
      brand_id: r.brand_id,
      hook_pattern: r.hook_pattern,
      cta_pattern: r.cta_pattern,
      topic: r.topic,
      avg_score: r.avg_score,
    }))
  );
  if (error) throw error;
  return rows.length;
}

export async function updateWinningPatternsAllBrands(): Promise<{
  brand_id: string;
  rows: number;
}[]> {
  const supabase = getSupabaseAdmin();
  const { data: brands, error } = await supabase.from("brands").select("id");
  if (error) throw error;
  const out: { brand_id: string; rows: number }[] = [];
  for (const b of brands ?? []) {
    const n = await updateWinningPatterns(b.id);
    out.push({ brand_id: b.id, rows: n });
  }
  return out;
}
