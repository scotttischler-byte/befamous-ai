"use client";

import { useMemo, useState, useTransition } from "react";
import type { BrandRow } from "@/lib/types";
import type { DashboardSnapshot } from "@/lib/dashboard-load";
import {
  generateTenAction,
  markPostedAction,
  refreshLearningAction,
  runDailyCampaignAction,
  setActiveBrandAction,
  submitMetricsAction,
  updatePostMediaAction,
} from "./actions";

type Props = {
  brands: BrandRow[];
  activeBrandId: string | null;
  snapshot: DashboardSnapshot | null;
};

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-600"
    >
      {done ? "Copied" : label}
    </button>
  );
}

export function DashboardClient({ brands, activeBrandId, snapshot }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [leadMode, setLeadMode] = useState(false);

  const brand = useMemo(
    () => brands.find((b) => b.id === activeBrandId) ?? null,
    [brands, activeBrandId]
  );

  const drafts = snapshot?.drafts ?? [];
  const posted = snapshot?.posted ?? [];
  const allPosts = [...drafts, ...posted];

  async function flash(
    fn: () => Promise<{ ok: boolean; error?: string } | void>
  ) {
    setMsg(null);
    setErr(null);
    start(async () => {
      try {
        const r = await fn();
        if (r && "ok" in r && !r.ok) {
          setErr(r.error ?? "Failed");
          return;
        }
        setMsg("Done.");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error");
      }
    });
  }

  if (!brands.length) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm dark:border-amber-900 dark:bg-amber-950/40">
        No brands. Apply <code className="font-mono">supabase/schema.sql</code> then refresh.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(msg || err) && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            err
              ? "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200"
              : "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
          }`}
        >
          {err ?? msg}
        </div>
      )}

      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Active brand
        </h2>
        <form
          className="mt-3 flex flex-wrap items-end gap-3"
          action={async (fd) => {
            setErr(null);
            setMsg(null);
            await setActiveBrandAction(String(fd.get("brand_id")));
            setMsg("Brand switched.");
          }}
        >
          <select
            name="brand_id"
            defaultValue={activeBrandId ?? brands[0]!.id}
            className="min-w-[260px] rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.brand_tag})
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Switch
          </button>
        </form>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={leadMode}
            onChange={(e) => setLeadMode(e.target.checked)}
          />
          <span>
            <strong>Generate for leads</strong> — urgency hooks, pain-first, harder CTAs
          </span>
        </label>
        {brand && (
          <dl className="mt-4 grid gap-2 text-sm text-neutral-600 dark:text-neutral-400 md:grid-cols-2">
            <div>
              <dt className="text-neutral-400">Offer</dt>
              <dd>{brand.offer}</dd>
            </div>
            <div>
              <dt className="text-neutral-400">Audience</dt>
              <dd>{brand.audience}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 dark:border-blue-900 dark:bg-blue-950/20">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-300">
          Content engine
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending || !activeBrandId}
            onClick={() =>
              flash(() =>
                activeBrandId
                  ? runDailyCampaignAction(activeBrandId, leadMode)
                  : Promise.resolve({ ok: false, error: "No brand" })
              )
            }
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Run daily content
          </button>
          <button
            type="button"
            disabled={pending || !activeBrandId}
            onClick={() =>
              flash(() =>
                activeBrandId
                  ? generateTenAction(activeBrandId, leadMode)
                  : Promise.resolve({ ok: false, error: "No brand" })
              )
            }
            className="rounded-xl border border-blue-600 px-5 py-3 text-sm font-semibold text-blue-700 disabled:opacity-50 dark:text-blue-400"
          >
            Generate 10 posts
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase text-neutral-500">Draft queue</h2>
        {drafts.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No drafts.</p>
        ) : (
          <ul className="mt-4 space-y-5">
            {drafts.slice(0, 30).map((p) => {
              const variants = (p.platform_variants ?? {}) as Record<
                string,
                { caption?: string; hook?: string }
              >;
              const copyText = [p.hook, p.caption, p.cta, p.hashtags].filter(Boolean).join("\n\n");
              return (
                <li
                  key={p.id}
                  className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-900/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase text-blue-600">
                      {p.brand_tag} · {p.platform}
                      {p.generate_for_leads ? " · LEAD" : ""}
                    </span>
                    <div className="flex gap-2">
                      <CopyBtn text={copyText} />
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => flash(() => markPostedAction(p.id))}
                        className="rounded-md bg-neutral-900 px-2 py-1 text-xs text-white dark:bg-white dark:text-neutral-900"
                      >
                        Mark posted
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium">{p.hook}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                    {p.caption}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">{p.cta}</p>
                  <p className="mt-1 text-xs text-neutral-400">{p.hashtags}</p>
                  {Object.keys(variants).length > 0 && (
                    <details className="mt-2 text-xs text-neutral-500">
                      <summary className="cursor-pointer">Platform variants</summary>
                      <pre className="mt-2 overflow-x-auto rounded bg-neutral-100 p-2 dark:bg-neutral-950">
                        {JSON.stringify(variants, null, 2)}
                      </pre>
                    </details>
                  )}
                  <form
                    className="mt-3 flex flex-wrap items-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800"
                    action={async (fd) => {
                      await flash(() => updatePostMediaAction(fd));
                    }}
                  >
                    <input type="hidden" name="post_id" value={p.id} />
                    <label className="flex flex-col text-xs">
                      image_url
                      <input
                        name="image_url"
                        defaultValue={p.image_url}
                        className="w-56 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </label>
                    <label className="flex flex-col text-xs">
                      video_url
                      <input
                        name="video_url"
                        defaultValue={p.video_url}
                        className="w-56 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded bg-neutral-200 px-2 py-1 text-xs dark:bg-neutral-800"
                    >
                      Save media
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase text-neutral-500">Posted</h2>
        {posted.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">None yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {posted.slice(0, 20).map((p) => (
              <li
                key={p.id}
                className="flex justify-between gap-4 border-b border-neutral-100 py-2 dark:border-neutral-800"
              >
                <span className="line-clamp-2">{p.hook || p.caption}</span>
                <CopyBtn text={p.caption || p.hook} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase text-neutral-500">
          Performance tracking
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Score = views×0.4 + shares×2 + comments×1.5 + saves×2 (stored on each snapshot).
        </p>
        <form
          className="mt-4 grid max-w-lg gap-3 text-sm"
          action={async (fd) => {
            await flash(() => submitMetricsAction(fd));
          }}
        >
          <select
            name="post_id"
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option value="">Select post…</option>
            {allPosts.map((p) => (
              <option key={p.id} value={p.id}>
                {(p.hook || p.caption || p.id).slice(0, 55)}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {(["views", "likes", "comments", "shares", "saves"] as const).map((f) => (
              <label key={f} className="flex flex-col gap-1 text-xs">
                {f}
                <input
                  type="number"
                  name={f}
                  min={0}
                  defaultValue={0}
                  className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-lg bg-neutral-900 px-4 py-2 text-white dark:bg-white dark:text-neutral-900"
          >
            Record performance
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase text-neutral-500">
            Top posts
          </h2>
          <button
            type="button"
            disabled={pending || !activeBrandId}
            onClick={() =>
              flash(() =>
                activeBrandId
                  ? refreshLearningAction(activeBrandId)
                  : Promise.resolve({ ok: false, error: "No brand" })
              )
            }
            className="text-xs text-blue-600 underline"
          >
            Rebuild winning patterns
          </button>
        </div>
        {!snapshot?.topPosts.length ? (
          <p className="mt-3 text-sm text-neutral-500">Log performance to rank posts.</p>
        ) : (
          <table className="mt-3 w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800">
                <th className="py-2">Hook</th>
                <th className="py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.topPosts.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800/80">
                  <td className="max-w-xs truncate py-2">{p.hook || p.caption}</td>
                  <td className="py-2 font-mono">{p.score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase text-neutral-500">
          Winning patterns
        </h2>
        {!snapshot?.patterns.length ? (
          <p className="mt-3 text-sm text-neutral-500">
            Run performance + rebuild, or wait for cron <code className="font-mono">/api/cron/learn</code>.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {snapshot.patterns.slice(0, 12).map((w) => (
              <li key={w.id} className="border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <span className="font-medium">{w.topic}</span>{" "}
                <span className="text-neutral-500">avg {w.avg_score.toFixed(1)}</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Hook: {w.hook_pattern.slice(0, 100)}…
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  CTA: {w.cta_pattern.slice(0, 80)}…
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase text-neutral-500">
          Growth trend (avg score / day)
        </h2>
        {!snapshot?.trend.length ? (
          <p className="mt-3 text-sm text-neutral-500">No history.</p>
        ) : (
          <ul className="mt-3 font-mono text-sm">
            {snapshot.trend.map((t) => (
              <li key={t.day} className="flex justify-between border-b border-neutral-100 py-1 dark:border-neutral-800">
                <span>{t.day}</span>
                <span>{t.avg}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
