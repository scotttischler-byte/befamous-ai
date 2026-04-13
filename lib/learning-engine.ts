import { analyzeTopPosts } from "@/lib/learning";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AnalyzedPost } from "@/lib/types";

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
  "you",
  "your",
  "is",
  "are",
  "was",
  "with",
  "that",
  "this",
  "it",
  "at",
  "be",
  "as",
  "by",
  "not",
  "if",
  "we",
  "our",
  "they",
  "them",
  "from",
  "have",
  "has",
  "had",
  "but",
  "what",
  "when",
  "who",
  "how",
  "all",
  "can",
  "will",
  "just",
  "about",
  "into",
  "more",
  "get",
  "out",
  "up",
  "so",
  "do",
  "no",
]);

export type WinningPatternsBundle = {
  top_hooks: string[];
  common_phrases: string[];
  cta_patterns: string[];
  /** Ready-to-inject system prompt block */
  promptBlock: string;
};

function topPercentilePool(analyzed: AnalyzedPost[], brandId: string): AnalyzedPost[] {
  const brandPosts = analyzed.filter((a) => a.post.brand_id === brandId);
  if (!brandPosts.length) return [];
  const withScore = brandPosts.filter((a) => a.score > 0);
  const pool = withScore.length ? withScore : brandPosts;
  pool.sort((a, b) => b.score - a.score);
  const cut = Math.max(1, Math.ceil(pool.length * 0.1));
  return pool.slice(0, cut);
}

function extractCommonPhrases(corpus: string, limit = 14): string[] {
  const words = corpus
    .toLowerCase()
    .replace(/[^a-z0-9#'\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  const bigrams: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    const bg = `${words[i]} ${words[i + 1]}`;
    bigrams[bg] = (bigrams[bg] ?? 0) + 1;
  }
  return Object.entries(bigrams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([p]) => p);
}

/**
 * Analyze top ~10% performing posts for a brand and extract reusable creative signals.
 */
export async function getWinningPatterns(
  brandId: string
): Promise<WinningPatternsBundle> {
  const analyzed = await analyzeTopPosts(brandId);
  const top = topPercentilePool(analyzed, brandId);

  if (!top.length) {
    return {
      top_hooks: [],
      common_phrases: [],
      cta_patterns: [],
      promptBlock:
        "LEARNING_SIGNALS: (empty) — still use strong hooks, specific mistakes, and case-check CTAs.",
    };
  }

  const top_hooks = [...new Set(top.map((t) => t.post.hook).filter(Boolean))].slice(
    0,
    12
  );
  const cta_patterns = [...new Set(top.map((t) => t.post.cta).filter(Boolean))].slice(
    0,
    10
  );
  const corpus = top
    .map((t) => `${t.post.caption} ${t.post.content} ${t.post.script ?? ""}`)
    .join(" ");
  const common_phrases = extractCommonPhrases(corpus);

  let storedPatterns = "";
  try {
    const supabase = getSupabaseAdmin();
    const { data: wp } = await supabase
      .from("winning_patterns")
      .select("*")
      .eq("brand_id", brandId)
      .order("avg_score", { ascending: false })
      .limit(12);
    if (wp?.length) {
      storedPatterns =
        "\n\nSTORED_WINNING_PATTERNS (from learning cron):\n" +
        wp
          .map(
            (r) =>
              `- hook:${String(r.hook_pattern).slice(0, 90)} | cta:${String(r.cta_pattern).slice(0, 70)} | topic:${r.topic} | avg:${r.avg_score}`
          )
          .join("\n");
    }
  } catch {
    /* ignore */
  }

  const promptBlock = [
    "LEARNING_SIGNALS (top ~10% performers for this brand — bias new ads toward these, do not copy verbatim):",
    top_hooks.length
      ? `TOP_HOOKS:\n${top_hooks.map((h) => `- ${h}`).join("\n")}`
      : "TOP_HOOKS: (none)",
    common_phrases.length
      ? `COMMON_PHRASES (2-grams):\n${common_phrases.map((p) => `- ${p}`).join("\n")}`
      : "COMMON_PHRASES: (none)",
    cta_patterns.length
      ? `CTA_PATTERNS:\n${cta_patterns.map((c) => `- ${c}`).join("\n")}`
      : "CTA_PATTERNS: (none)",
    storedPatterns,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { top_hooks, common_phrases, cta_patterns, promptBlock };
}

/** Compact block for the OpenAI system prompt. */
export async function getWinningPatternsPromptBlock(
  brandId: string
): Promise<string> {
  const bundle = await getWinningPatterns(brandId);
  return bundle.promptBlock;
}
