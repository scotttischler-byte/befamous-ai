import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ContentBucket, WinningPatternsPayload } from "@/lib/types";

import { AD_HOC_BRAND_ID } from "@/lib/adhoc-brand";

export function isAdHocBrandId(brandId: string): boolean {
  return brandId === AD_HOC_BRAND_ID;
}

export async function loadLearningPromptBlock(
  brandId: string
): Promise<string> {
  if (isAdHocBrandId(brandId)) {
    return "LEARNING DB: Ad-hoc run (no brand id) — use niche playbook only.";
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("learning_insights")
    .select("*")
    .eq("brand_id", brandId)
    .maybeSingle();

  if (error || !data) {
    return "LEARNING DB: No prior insights for this brand yet — still enforce bucket mix and niche playbook.";
  }

  const patterns = (data.winning_patterns as string[]) ?? [];
  const kw = (data.top_keywords as { word: string; count: number }[]) ?? [];
  const hooks = (data.best_hooks as string[]) ?? [];
  const buckets = (data.top_buckets as { bucket: ContentBucket; count: number }[]) ?? [];
  const ctas = (data.cta_styles as string[]) ?? [];

  return [
    "LEARNING FROM YOUR TOP 20% (stored insights — bias new outputs toward these):",
    `Winning patterns: ${patterns.slice(0, 8).join("; ") || "n/a"}`,
    `Keywords: ${kw.slice(0, 12).map((k) => k.word).join(", ") || "n/a"}`,
    `Strong hooks to echo (structure, not copy): ${hooks.slice(0, 5).map((h) => JSON.stringify(h)).join(" | ") || "n/a"}`,
    `High-performing buckets: ${buckets.map((b) => `${b.bucket}(${b.count})`).join(", ") || "n/a"}`,
    `CTA styles that worked: ${ctas.slice(0, 6).join("; ") || "n/a"}`,
    data.notes ? `Notes: ${data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function payloadFromRow(row: {
  winning_patterns: unknown;
  top_keywords: unknown;
  best_hooks: unknown;
  top_buckets: unknown;
  cta_styles: unknown;
  notes: string;
}): WinningPatternsPayload {
  return {
    common_hook_patterns: (row.winning_patterns as string[]) ?? [],
    top_keywords: (row.top_keywords as { word: string; count: number }[]) ?? [],
    content_types: [],
    top_buckets: (row.top_buckets as { bucket: ContentBucket; count: number }[]) ?? [],
    cta_styles: (row.cta_styles as string[]) ?? [],
    sample_hooks: (row.best_hooks as string[]) ?? [],
    summary: row.notes || "",
  };
}
