import type { WinningPatterns } from "@/lib/types";

export type PostForLearning = {
  hook: string;
  content_text: string;
  viral_score: number;
  platform?: string;
};

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
      found.add("numbered_list_hooks");
    if (/^(pov|watch this|this is)/i.test(h)) found.add("pov_or_watch_hooks");
    if (/(secret|nobody tells you|truth)/i.test(h)) found.add("contrarian_truth_hooks");
    if (/(stop|don't|never|quit)/i.test(h)) found.add("pattern_interrupt_hooks");
    if (/^(you|your)/i.test(h)) found.add("direct_you_hooks");
  }
  return [...found];
}

function inferContentTypes(posts: PostForLearning[]): string[] {
  const types = new Set<string>();
  for (const p of posts) {
    const t = p.content_text || "";
    const words = t.split(/\s+/).filter(Boolean).length;
    if (words < 80) types.add("ultra_short_script");
    else if (words < 200) types.add("short_script");
    else types.add("longer_story");
    if (/hook:|scene:|cta:/i.test(t)) types.add("structured_script_format");
    if (/#\w+/.test(t)) types.add("hashtag_heavy_caption");
  }
  return [...types];
}

export function analyzeWinningPatterns(posts: PostForLearning[]): WinningPatterns {
  if (posts.length === 0) {
    return {
      common_hook_patterns: [],
      top_keywords: [],
      content_types: [],
      sample_hooks: [],
      summary: "No scored posts yet. Generate content, add metrics, and run scoring.",
    };
  }

  const hooks = posts.map((p) => p.hook).filter(Boolean);
  const patternLabels: Record<string, string> = {
    question_hooks: "Questions that spark curiosity",
    numbered_list_hooks: "Numbered hooks (3 ways, 5 mistakes…)",
    pov_or_watch_hooks: "POV / watch-this openers",
    contrarian_truth_hooks: "Contrarian / hidden truth angles",
    pattern_interrupt_hooks: "Stop / don’t / never interrupts",
    direct_you_hooks: "Direct 'you' addressing",
  };

  const rawPatterns = detectHookPatterns(hooks);
  const common_hook_patterns = rawPatterns.map((k) => patternLabels[k] ?? k);

  const freq = new Map<string, number>();
  for (const p of posts) {
    for (const w of tokenize(`${p.hook} ${p.content_text}`)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  const top_keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count }));

  const content_types = inferContentTypes(posts);
  const sample_hooks = hooks.slice(0, 8);

  const summary = `Analyzed ${posts.length} top-performing posts. Dominant structures: ${common_hook_patterns.slice(0, 3).join("; ") || "—"}. Lean into pattern interrupts and tight hooks under ~12 words.`;

  return {
    common_hook_patterns,
    top_keywords,
    content_types,
    sample_hooks,
    summary,
  };
}
