import type { PostMetricsInput } from "@/lib/types";

/**
 * Viral signal (unbounded). User formula:
 * score = (views * 0.4) + (shares * 2) + (comments * 1.5) + (saves * 2)
 */
export function calculateScore(m: PostMetricsInput): number {
  return (
    m.views * 0.4 +
    m.shares * 2 +
    m.comments * 1.5 +
    m.saves * 2
  );
}
