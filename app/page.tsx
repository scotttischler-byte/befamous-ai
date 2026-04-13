import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-20">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          BeFamous · autonomous growth
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Full-stack content + performance loop
        </h1>
        <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-300">
          Daily generation for every brand, manual performance capture, viral scoring,
          and a <strong>winning_patterns</strong> table that steers the next batch.
          Lead mode dials urgency when you need consults, applications, or orders.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Operator dashboard
        </Link>
        <a
          href="/api/brands"
          className="rounded-xl border border-neutral-300 px-5 py-3 text-sm dark:border-neutral-700"
        >
          Brands JSON
        </a>
        <Link
          href="/test"
          className="rounded-xl border border-neutral-300 px-5 py-3 text-sm dark:border-neutral-700"
        >
          Env test page
        </Link>
      </div>

      <section className="rounded-2xl border border-neutral-200 p-5 text-sm dark:border-neutral-800">
        <h2 className="font-semibold">Core modules</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>
            <code>lib/content-engine.ts</code> — daily + batch generation, platform variants,
            media prompt helper, persistence
          </li>
          <li>
            <code>lib/brands.ts</code> — six operator profiles (MVA → Personal Brand)
          </li>
          <li>
            <code>lib/score.ts</code> — <code>calculateScore</code> (views/shares/comments/likes/conversion_est)
          </li>
          <li>
            <code>lib/learning.ts</code> — top 10% → <code>winning_patterns</code>
          </li>
          <li>
            Crons: <code>/api/cron/generate-daily</code>, <code>/api/cron/learn</code>
          </li>
        </ul>
      </section>
    </main>
  );
}
