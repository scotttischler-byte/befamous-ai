import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PostRow, PostScoreRow } from "@/lib/types";

export type DashboardPost = PostRow & {
  latest_viral_score: number | null;
  hook_score: number | null;
  engagement_rate: number | null;
};

export async function loadDashboardPosts(): Promise<DashboardPost[]> {
  const supabase = getSupabaseAdmin();

  const { data: posts, error: pErr } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (pErr) throw pErr;
  if (!posts?.length) return [];

  const { data: scores, error: sErr } = await supabase
    .from("post_scores")
    .select("*")
    .order("created_at", { ascending: false });
  if (sErr) throw sErr;

  const latestScoreByPost = new Map<string, PostScoreRow>();
  for (const row of scores ?? []) {
    if (!latestScoreByPost.has(row.post_id)) {
      latestScoreByPost.set(row.post_id, row as PostScoreRow);
    }
  }

  return (posts as PostRow[]).map((p) => {
    const s = latestScoreByPost.get(p.id);
    return {
      ...p,
      latest_viral_score: s?.viral_score ?? null,
      hook_score: s?.hook_score ?? null,
      engagement_rate: s?.engagement_rate ?? null,
    };
  });
}

export async function loadScoreTrend(): Promise<{ day: string; avg: number }[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("post_scores")
    .select("created_at, viral_score")
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw error;
  const byDay = new Map<string, { sum: number; n: number }>();
  for (const row of data ?? []) {
    const d = (row.created_at as string).slice(0, 10);
    const cur = byDay.get(d) ?? { sum: 0, n: 0 };
    cur.sum += row.viral_score;
    cur.n += 1;
    byDay.set(d, cur);
  }
  return [...byDay.entries()]
    .map(([day, v]) => ({ day, avg: Math.round((v.sum / v.n) * 10) / 10 }))
    .slice(-14);
}
