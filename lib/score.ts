import type { PostMetricsInput } from "@/lib/types";

/**
 * Viral score (unbounded) — weighted blend for learning + ranking.
 *
 * score =
 *   (views * 0.3) +
 *   (shares * 0.3) +
 *   (comments * 0.2) +
 *   (likes * 0.1) +
 *   (conversion_estimate * 0.1)
 */
export function calculateScore(m: PostMetricsInput): number {
  const conversion = m.conversion_estimate ?? 0;
  return (
    m.views * 0.3 +
    m.shares * 0.3 +
    m.comments * 0.2 +
    m.likes * 0.1 +
    conversion * 0.1
  );
}
