import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { payloadFromRow } from "@/lib/learning-format";
import type {
  LearningInsightRow,
  PostRow,
  PostScoreRow,
  QueuedAssetRow,
} from "@/lib/types";

export type DashboardSnapshot = {
  drafts: PostRow[];
  posted: PostRow[];
  topPosts: (PostRow & { viral_score: number })[];
  insights: LearningInsightRow | null;
  patterns: ReturnType<typeof payloadFromRow> | null;
  trend: { day: string; avg: number }[];
  assets: QueuedAssetRow[];
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
    .limit(80);
  if (dErr) throw dErr;

  const { data: posted, error: pErr } = await supabase
    .from("posts")
    .select("*")
    .eq("brand_id", brandId)
    .eq("status", "posted")
    .order("created_at", { ascending: false })
    .limit(40);
  if (pErr) throw pErr;

  const { data: scores, error: sErr } = await supabase
    .from("post_scores")
    .select("*")
    .order("created_at", { ascending: false });
  if (sErr) throw sErr;

  const latestByPost = new Map<string, PostScoreRow>();
  for (const row of scores ?? []) {
    if (!latestByPost.has(row.post_id)) {
      latestByPost.set(row.post_id, row as PostScoreRow);
    }
  }

  const brandPostIds = new Set([
    ...(drafts ?? []).map((p) => p.id),
    ...(posted ?? []).map((p) => p.id),
  ]);

  const topPosts = [...(drafts ?? []), ...(posted ?? [])]
    .map((p) => ({
      ...(p as PostRow),
      viral_score: latestByPost.get(p.id)?.viral_score ?? 0,
    }))
    .filter((p) => brandPostIds.has(p.id))
    .sort((a, b) => b.viral_score - a.viral_score)
    .slice(0, 12);

  const { data: insight, error: iErr } = await supabase
    .from("learning_insights")
    .select("*")
    .eq("brand_id", brandId)
    .maybeSingle();
  if (iErr) throw iErr;

  const patterns = insight
    ? payloadFromRow(insight as LearningInsightRow)
    : null;

  const trendMap = new Map<string, { sum: number; n: number }>();
  for (const sc of scores ?? []) {
    const postId = sc.post_id;
    if (!brandPostIds.has(postId)) continue;
    const day = (sc.created_at as string).slice(0, 10);
    const cur = trendMap.get(day) ?? { sum: 0, n: 0 };
    cur.sum += sc.viral_score;
    cur.n += 1;
    trendMap.set(day, cur);
  }
  const trend = [...trendMap.entries()]
    .map(([day, v]) => ({ day, avg: Math.round((v.sum / v.n) * 10) / 10 }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-14);

  const { data: assets, error: aErr } = await supabase
    .from("queued_assets")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(40);
  if (aErr) throw aErr;

  return {
    drafts: (drafts ?? []) as PostRow[],
    posted: (posted ?? []) as PostRow[],
    topPosts,
    insights: (insight as LearningInsightRow) ?? null,
    patterns,
    trend,
    assets: (assets ?? []) as QueuedAssetRow[],
  };
}
