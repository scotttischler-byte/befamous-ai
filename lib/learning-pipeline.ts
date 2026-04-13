import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ContentBucket, PostRow } from "@/lib/types";

const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "is",
  "it",
  "this",
  "that",
  "with",
  "your",
  "you",
  "i",
  "my",
  "we",
  "our",
  "are",
  "was",
  "be",
  "as",
  "at",
  "by",
  "from",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#@\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function detectHookPatterns(hooks: string[]): string[] {
  const found = new Set<string>();
  for (const h of hooks) {
    if (!h.trim()) continue;
    if (/\?/.test(h)) found.add("question_hooks");
    if (/^\d|#\d|\d\s*(reasons|ways|mistakes|signs)/i.test(h))
      found.add("numbered_hooks");
    if (/^(pov|watch this|this is)/i.test(h)) found.add("pov_hooks");
    if (/(secret|nobody tells you|truth)/i.test(h)) found.add("contrarian_truth");
    if (/(stop|don't|never|quit)/i.test(h)) found.add("pattern_interrupt");
    if (/^(you|your)/i.test(h)) found.add("direct_you");
  }
  return [...found];
}

function extractCtaStyles(ctas: string[]): string[] {
  const styles = new Set<string>();
  for (const c of ctas) {
    const t = c.toLowerCase();
    if (/dm|comment|link in bio|bio/i.test(t)) styles.add("social_native_cta");
    if (/book|call|schedule|apply/i.test(t)) styles.add("booking_cta");
    if (/free|review|audit/i.test(t)) styles.add("free_value_cta");
    if (/now|today|before/i.test(t)) styles.add("urgency_cta");
  }
  return [...styles];
}

type PostWithScore = PostRow & { viral_score: number };

export async function refreshLearningForBrand(brandId: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: scores, error: sErr } = await supabase
    .from("post_scores")
    .select("post_id, viral_score, created_at")
    .order("created_at", { ascending: false });
  if (sErr) throw sErr;

  const latestScore = new Map<string, number>();
  for (const row of scores ?? []) {
    if (!latestScore.has(row.post_id)) {
      latestScore.set(row.post_id, row.viral_score);
    }
  }

  const postIds = [...latestScore.keys()];
  if (!postIds.length) {
    await supabase.from("learning_insights").upsert(
      {
        brand_id: brandId,
        winning_patterns: [],
        top_keywords: [],
        best_hooks: [],
        top_buckets: [],
        cta_styles: [],
        notes: "No scores yet — run metrics + scoring first.",
      },
      { onConflict: "brand_id" }
    );
    return;
  }

  const { data: posts, error: pErr } = await supabase
    .from("posts")
    .select("*")
    .eq("brand_id", brandId)
    .in("id", postIds);
  if (pErr) throw pErr;

  const enriched: PostWithScore[] = (posts ?? [])
    .map((p) => ({
      ...(p as PostRow),
      viral_score: latestScore.get(p.id) ?? 0,
    }))
    .filter((p) => latestScore.has(p.id));

  if (!enriched.length) {
    await supabase.from("learning_insights").upsert(
      {
        brand_id: brandId,
        winning_patterns: [],
        top_keywords: [],
        best_hooks: [],
        top_buckets: [],
        cta_styles: [],
        notes: "No overlap between scored posts and this brand yet.",
      },
      { onConflict: "brand_id" }
    );
    return;
  }

  enriched.sort((a, b) => b.viral_score - a.viral_score);
  const cut = Math.max(1, Math.ceil(enriched.length * 0.2));
  const top = enriched.slice(0, cut);

  const hooks = top.map((p) => p.hook).filter(Boolean);
  const patternKeys = detectHookPatterns(hooks);
  const patternLabels: Record<string, string> = {
    question_hooks: "Question hooks (curiosity)",
    numbered_hooks: "Numbered hooks",
    pov_hooks: "POV / watch-this openers",
    contrarian_truth: "Contrarian / hidden truth",
    pattern_interrupt: "Stop / don’t / never interrupts",
    direct_you: 'Direct "you" addressing',
  };
  const patterns = patternKeys.map((k) => patternLabels[k] ?? k);

  const freq = new Map<string, number>();
  for (const p of top) {
    const blob = `${p.hook} ${p.body} ${p.caption}`;
    for (const w of tokenize(blob)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  const top_keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  const bucketCount = new Map<ContentBucket, number>();
  for (const p of top) {
    const b = p.content_bucket as ContentBucket;
    bucketCount.set(b, (bucketCount.get(b) ?? 0) + 1);
  }
  const top_buckets = [...bucketCount.entries()]
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => b.count - a.count);

  const ctas = top.map((p) => p.cta).filter(Boolean);
  const cta_styles = extractCtaStyles(ctas);

  const best_hooks = hooks.slice(0, 15);

  const notes = `Top ${top.length} posts analyzed (${brandId.slice(0, 8)}…). Refresh after new scores land.`;

  await supabase.from("learning_insights").upsert(
    {
      brand_id: brandId,
      winning_patterns: patterns,
      top_keywords,
      best_hooks,
      top_buckets,
      cta_styles,
      notes,
    },
    { onConflict: "brand_id" }
  );
}
