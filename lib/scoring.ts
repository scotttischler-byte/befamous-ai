import type { PostMetricsRow } from "@/lib/types";

/** Raw weighted engagement signal (unbounded). */
export function rawViralSignal(m: Pick<
  PostMetricsRow,
  | "views"
  | "likes"
  | "comments"
  | "shares"
  | "followers_gained"
>): number {
  return (
    m.views * 0.4 +
    m.likes * 0.2 +
    m.comments * 0.15 +
    m.shares * 0.15 +
    m.followers_gained * 0.1
  );
}

/** Normalize a batch of raw scores to 0–100 (min–max). */
export function normalizeToViralScores(rawScores: number[]): number[] {
  if (rawScores.length === 0) return [];
  const min = Math.min(...rawScores);
  const max = Math.max(...rawScores);
  if (max <= min) {
    return rawScores.map(() => 50);
  }
  return rawScores.map((r) =>
    Math.round(((r - min) / (max - min)) * 100 * 100) / 100
  );
}

export function hookQualityScore(hook: string): number {
  const h = hook.trim();
  if (!h) return 0;
  let s = 40;
  if (/\?/.test(h)) s += 15;
  if (/\d/.test(h)) s += 10;
  if (/^(you|your|stop|don't|do not)/i.test(h)) s += 10;
  if (/^(pov|watch|this is)/i.test(h)) s += 10;
  if (h.length >= 40 && h.length <= 120) s += 10;
  return Math.min(100, s);
}

export function retentionEstimateFromHook(hook: string): number {
  const h = hook.trim();
  if (!h) return 0;
  let r = 35;
  if (h.split(/\s+/).length <= 14) r += 20;
  if (/[!?]/.test(h)) r += 15;
  if (/secret|truth|mistake|never/i.test(h)) r += 15;
  return Math.min(100, r);
}

export function engagementRateFromMetrics(m: Pick<
  PostMetricsRow,
  "views" | "likes" | "comments" | "shares" | "saves"
>): number {
  if (m.views <= 0) return 0;
  const interactions = m.likes + m.comments + m.shares + m.saves;
  return Math.min(100, Math.round((interactions / m.views) * 10_000) / 100);
}
