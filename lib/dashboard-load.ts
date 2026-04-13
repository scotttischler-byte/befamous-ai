import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ContentPostRow, WinningPatternRow } from "@/lib/types";

async function latestScoreByPost(
  brandId: string
): Promise<Map<string, number>> {
  const supabase = getSupabaseAdmin();
  const { data: posts } = await supabase
    .from("posts")
    .select("id")
    .eq("brand_id", brandId);
  const ids = (posts ?? []).map((p) => p.id);
  if (!ids.length) return new Map();

  const { data: perf, error } = await supabase
    .from("performance")
    .select("post_id, score, recorded_at")
    .in("post_id", ids)
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of perf ?? []) {
    if (!map.has(row.post_id)) {
      map.set(row.post_id, row.score as number);
    }
  }
  return map;
}

export type DashboardSnapshot = {
  drafts: ContentPostRow[];
  posted: ContentPostRow[];
  topPosts: (ContentPostRow & { score: number })[];
  patterns: WinningPatternRow[];
  trend: { day: string; avg: number }[];
};

export async function loadDashboardSnapshot(
  brandId: string
): Promise<DashboardSnapshot> {
  const supabase = getSupabaseAdmin();

  const { data: drafts, error: dErr } = await supabase
    .from("posts")
    .select("*")
    .eq("brand_id", brandId)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(100);
  if (dErr) throw dErr;

  const { data: posted, error: pErr } = await supabase
    .from("posts")
    .select("*")
    .eq("brand_id", brandId)
    .eq("status", "posted")
    .order("created_at", { ascending: false })
    .limit(60);
  if (pErr) throw pErr;

  const scores = await latestScoreByPost(brandId);
  const all = [...(drafts ?? []), ...(posted ?? [])] as ContentPostRow[];
  const topPosts = all
    .map((p) => ({ ...p, score: scores.get(p.id) ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  const { data: patterns, error: wErr } = await supabase
    .from("winning_patterns")
    .select("*")
    .eq("brand_id", brandId)
    .order("avg_score", { ascending: false })
    .limit(30);
  if (wErr) throw wErr;

  let perfRows: { post_id: string; score: number; recorded_at: string }[] = [];
  if (all.length) {
    const { data, error: perfErr } = await supabase
      .from("performance")
      .select("post_id, score, recorded_at")
      .in("post_id", all.map((p) => p.id))
      .order("recorded_at", { ascending: true });
    if (perfErr) throw perfErr;
    perfRows = (data ?? []) as typeof perfRows;
  }

  const trendMap = new Map<string, { sum: number; n: number }>();
  for (const row of perfRows) {
    const day = (row.recorded_at as string).slice(0, 10);
    const cur = trendMap.get(day) ?? { sum: 0, n: 0 };
    cur.sum += row.score as number;
    cur.n += 1;
    trendMap.set(day, cur);
  }
  const trend = [...trendMap.entries()]
    .map(([day, v]) => ({ day, avg: Math.round((v.sum / v.n) * 10) / 10 }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-14);

  return {
    drafts: (drafts ?? []) as ContentPostRow[],
    posted: (posted ?? []) as ContentPostRow[],
    topPosts,
    patterns: (patterns ?? []) as WinningPatternRow[],
    trend,
  };
}
