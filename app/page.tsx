import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16">
      <div>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          BeFamous Growth Engine
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          BGE — viral content, scored &amp; improved
        </h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Generate hooks &amp; scripts (OpenAI), track metrics (Supabase), score
          virality, and fold winning patterns back into the next generation pass.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          Open dashboard
        </Link>
        <a
          href="/api/learning-insights"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
        >
          Learning insights (JSON)
        </a>
      </div>

      <section className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
        <h2 className="font-medium">API quick reference</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>
            <code>POST /api/generate-content</code> — body: niche, goal, tone
          </li>
          <li>
            <code>GET /api/learning-insights</code> — winning patterns
          </li>
          <li>
            <code>POST /api/posts</code> — create draft/posted row
          </li>
          <li>
            <code>POST /api/metrics/ingest</code> — manual metrics
          </li>
          <li>
            <code>POST /api/scores/recalculate</code> — refresh scores
          </li>
          <li>
            Cron: <code>/api/cron/daily-content</code>,{" "}
            <code>metrics-ingest</code>, <code>score-calculation</code>,{" "}
            <code>learning-refresh</code>
          </li>
        </ul>
      </section>
    </main>
  );
}
