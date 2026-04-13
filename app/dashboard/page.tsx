import Link from "next/link";
import { getWinningPatterns } from "@/lib/insights-service";
import {
  loadDashboardPosts,
  loadScoreTrend,
} from "@/lib/dashboard-data";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-semibold">BGE Dashboard</h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Set{" "}
          <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          in{" "}
          <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">
            .env.local
          </code>
          , run the SQL migration, then refresh.
        </p>
        <Link href="/" className="mt-6 inline-block text-blue-600 underline">
          ← Home
        </Link>
      </div>
    );
  }

  const [posts, trend, patterns] = await Promise.all([
    loadDashboardPosts(),
    loadScoreTrend(),
    getWinningPatterns().catch(() => null),
  ]);

  const topPosts = [...posts]
    .filter((p) => p.latest_viral_score != null)
    .sort((a, b) => (b.latest_viral_score ?? 0) - (a.latest_viral_score ?? 0))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">BeFamous Growth Engine</p>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <Link
          href="/"
          className="text-sm text-blue-600 underline hover:no-underline"
        >
          Home
        </Link>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="text-sm font-medium text-neutral-500">
            Viral score trend (14d)
          </h2>
          {trend.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              No scores yet. POST metrics, then recalculate scores.
            </p>
          ) : (
            <ul className="mt-3 max-h-48 space-y-1 overflow-auto text-sm font-mono">
              {trend.map((t) => (
                <li key={t.day} className="flex justify-between gap-4">
                  <span>{t.day}</span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    avg {t.avg}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="text-sm font-medium text-neutral-500">Winning hooks</h2>
          {!patterns || patterns.sample_hooks.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              Add posts + scores to populate learning insights.
            </p>
          ) : (
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm">
              {patterns.sample_hooks.slice(0, 6).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-neutral-500">Top posts</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
              <tr>
                <th className="px-3 py-2 font-medium">Hook</th>
                <th className="px-3 py-2 font-medium">Platform</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Viral</th>
                <th className="px-3 py-2 font-medium">Eng %</th>
              </tr>
            </thead>
            <tbody>
              {(topPosts.length ? topPosts : posts.slice(0, 12)).map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-neutral-100 dark:border-neutral-800/80"
                >
                  <td className="max-w-xs truncate px-3 py-2">{p.hook || "—"}</td>
                  <td className="px-3 py-2">{p.platform}</td>
                  <td className="px-3 py-2">{p.status}</td>
                  <td className="px-3 py-2 font-mono">
                    {p.latest_viral_score != null
                      ? p.latest_viral_score.toFixed(1)
                      : "—"}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {p.engagement_rate != null
                      ? p.engagement_rate.toFixed(2)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {patterns && patterns.common_hook_patterns.length > 0 && (
        <section className="mt-8 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="text-sm font-medium text-neutral-500">
            Winning patterns
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
            {patterns.common_hook_patterns.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            {patterns.summary}
          </p>
        </section>
      )}
    </div>
  );
}
