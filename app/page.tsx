import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-20">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          BeFamous Growth Engine
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white">
          Run AI-powered growth campaigns across your brands
        </h1>
        <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-300">
          Generate content, leads, and momentum daily. Execute campaigns, measure
          what lands, and feed winners back into the next run — built for internal
          operators growing multiple companies at once.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {[
          { t: "Follower growth", d: "Short-form systems tuned for reach + saves." },
          { t: "Lead generation", d: "CTA variants, lead posts, and conversion angles." },
          { t: "Campaign execution", d: "One-click daily batches per brand profile." },
          { t: "Learning loop", d: "Scores and insights bias the next generation pass." },
        ].map((x) => (
          <li
            key={x.t}
            className="rounded-2xl border border-neutral-200 bg-white/60 p-4 dark:border-neutral-800 dark:bg-neutral-950/40"
          >
            <p className="font-medium text-neutral-900 dark:text-white">{x.t}</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{x.d}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Open operator dashboard
        </Link>
        <a
          href="/api/brands"
          className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-medium dark:border-neutral-700"
        >
          Brands JSON
        </a>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 text-sm dark:border-neutral-800 dark:bg-neutral-900/30">
        <h2 className="font-semibold text-neutral-900 dark:text-white">
          API surface (authenticated server + cron)
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>
            <code>POST /api/run-daily-campaign</code> — persist full campaign batch
          </li>
          <li>
            <code>POST /api/generate-content</code> — package JSON, optional persist
          </li>
          <li>
            <code>POST /api/score-post</code> — metrics in, scores stored
          </li>
          <li>
            <code>GET/POST /api/learning-insights</code> — read / refresh patterns
          </li>
          <li>
            <code>POST /api/queue-asset</code> — metadata into queue
          </li>
          <li>
            Platform services: <code>/api/platforms/*/post</code> (structured, not live)
          </li>
        </ul>
      </section>
    </main>
  );
}
