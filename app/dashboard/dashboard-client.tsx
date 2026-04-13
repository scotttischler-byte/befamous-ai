"use client";

import { useMemo, useState, useTransition } from "react";
import type { BrandRow } from "@/lib/types";
import type { DashboardSnapshot } from "@/lib/dashboard-load";
import {
  attachAssetToPostAction,
  markPostedAction,
  queueAssetAction,
  refreshLearningAction,
  runDailyCampaignAction,
  setActiveBrandAction,
  submitMetricsAction,
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

  const brand = useMemo(
    () => brands.find((b) => b.id === activeBrandId) ?? null,
    [brands, activeBrandId]
  );

  const draftOptions = snapshot?.drafts ?? [];
  const postedOptions = snapshot?.posted ?? [];

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
        setMsg("Saved.");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error");
      }
    });
  }

  if (!brands.length) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm dark:border-amber-900 dark:bg-amber-950/40">
        No brands found. Apply <code className="font-mono">supabase/schema.sql</code>{" "}
        in Supabase (includes seed brands), then refresh.
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

      {/* Active brand */}
      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Active brand
        </h2>
        <form
          className="mt-3 flex flex-wrap items-end gap-3"
          action={async (fd) => {
            const id = String(fd.get("brand_id"));
            setErr(null);
            setMsg(null);
            await setActiveBrandAction(id);
            setMsg("Brand switched.");
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-500">Profile</span>
            <select
              name="brand_id"
              defaultValue={activeBrandId ?? brands[0]!.id}
              className="min-w-[240px] rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            Switch brand
          </button>
        </form>
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
            <div>
              <dt className="text-neutral-400">Goal</dt>
              <dd>{brand.primary_goal}</dd>
            </div>
            <div>
              <dt className="text-neutral-400">CTA style</dt>
              <dd>{brand.call_to_action_style}</dd>
            </div>
          </dl>
        )}
      </section>

      {/* Run daily campaign */}
      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Run daily campaign
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Generates a full batch (hooks, captions, CTAs, video ideas, lead posts,
          conversion, ad script, lead magnet) and saves{" "}
          <strong>drafts</strong> to your queue using the active brand profile +
          learning loop.
        </p>
        <button
          type="button"
          disabled={pending || !activeBrandId}
          onClick={() =>
            flash(async () => {
              if (!activeBrandId) return { ok: false, error: "No brand" };
              return runDailyCampaignAction(activeBrandId);
            })
          }
          className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Running…" : "Run daily campaign"}
        </button>
      </section>

      {/* Draft queue */}
      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Draft queue
        </h2>
        {draftOptions.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No drafts yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {draftOptions.slice(0, 25).map((p) => {
              const blob = [p.hook, p.body, p.caption].filter(Boolean).join("\n");
              return (
                <li
                  key={p.id}
                  className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-900/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase text-blue-600">
                      {p.content_bucket} · {p.item_kind} · {p.platform}
                    </span>
                    <div className="flex gap-2">
                      <CopyBtn text={blob || p.video_idea || p.cta} />
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          flash(() => markPostedAction(p.id))
                        }
                        className="rounded-md bg-neutral-900 px-2 py-1 text-xs text-white dark:bg-white dark:text-neutral-900"
                      >
                        Mark posted
                      </button>
                    </div>
                  </div>
                  {p.hook ? (
                    <p className="mt-2 text-sm font-medium">{p.hook}</p>
                  ) : null}
                  {p.body ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                      {p.body}
                    </p>
                  ) : null}
                  {p.caption ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
                      {p.caption}
                    </p>
                  ) : null}
                  {p.video_idea ? (
                    <p className="mt-2 text-xs text-neutral-500">
                      Video: {p.video_idea}
                    </p>
                  ) : null}
                  {p.cta ? (
                    <p className="mt-1 text-xs text-neutral-500">CTA: {p.cta}</p>
                  ) : null}
                  {snapshot?.assets?.length ? (
                    <form
                      className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800"
                      action={async (fd) => {
                        const aid = String(fd.get("asset_id"));
                        await flash(() =>
                          attachAssetToPostAction(
                            p.id,
                            aid === "" ? null : aid
                          )
                        );
                      }}
                    >
                      <select
                        name="asset_id"
                        defaultValue={p.queued_asset_id ?? ""}
                        className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-950"
                      >
                        <option value="">No asset</option>
                        {snapshot.assets.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.asset_name} ({a.asset_type})
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-neutral-200 px-2 py-1 text-xs dark:bg-neutral-800"
                      >
                        Attach
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Posted */}
      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Posted content
        </h2>
        {postedOptions.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Nothing marked posted yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {postedOptions.slice(0, 15).map((p) => (
              <li key={p.id} className="flex justify-between gap-4 border-b border-neutral-100 py-2 dark:border-neutral-800">
                <span className="line-clamp-2">{p.hook || p.caption || p.body}</span>
                <CopyBtn text={p.caption || p.body || p.hook} label="Copy" />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Metrics */}
      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Manual metrics + scoring
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Log a snapshot after a post is live. Scores normalize within the brand
          and feed the learning loop.
        </p>
        <form
          className="mt-4 grid max-w-xl gap-3 text-sm"
          action={async (fd) => {
            await flash(() => submitMetricsAction(fd));
          }}
        >
          <label className="flex flex-col gap-1">
            <span>Post</span>
            <select
              name="post_id"
              required
              className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            >
              <option value="">Select…</option>
              {[...draftOptions, ...postedOptions].map((p) => (
                <option key={p.id} value={p.id}>
                  {(p.hook || p.caption || p.id).slice(0, 60)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(
              [
                "views",
                "likes",
                "comments",
                "shares",
                "saves",
                "followers_gained",
                "leads_generated",
              ] as const
            ).map((f) => (
              <label key={f} className="flex flex-col gap-1">
                <span className="text-xs text-neutral-500">{f}</span>
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
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">Posted at (ISO optional)</span>
            <input
              type="text"
              name="posted_at"
              placeholder="2026-04-13T12:00:00Z"
              className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-lg bg-neutral-900 px-4 py-2 text-white dark:bg-white dark:text-neutral-900"
          >
            Record metrics &amp; score
          </button>
        </form>
      </section>

      {/* Asset metadata */}
      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Queue asset (URL / metadata)
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Paste a CDN or drive link today; swap to real uploads when storage is wired.
        </p>
        <form
          className="mt-4 grid max-w-xl gap-3 text-sm"
          action={async (fd) => {
            await flash(() => queueAssetAction(fd));
          }}
        >
          <input type="hidden" name="brand_id" value={activeBrandId ?? ""} />
          <label className="flex flex-col gap-1">
            <span>Asset URL</span>
            <input
              name="asset_url"
              required
              placeholder="https://…"
              className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Name</span>
            <input
              name="asset_name"
              required
              placeholder="e.g. MVA hero clip v2"
              className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Type</span>
            <select
              name="asset_type"
              className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            >
              <option value="image">image</option>
              <option value="video">video</option>
              <option value="other">other</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={pending || !activeBrandId}
            className="w-fit rounded-lg border border-neutral-300 px-4 py-2 dark:border-neutral-600"
          >
            Queue asset
          </button>
        </form>
      </section>

      {/* Top posts */}
      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Top performing posts
        </h2>
        {!snapshot?.topPosts.length ? (
          <p className="mt-3 text-sm text-neutral-500">Score posts to see leaders.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800">
                  <th className="py-2">Hook / caption</th>
                  <th className="py-2">Viral</th>
                  <th className="py-2">Bucket</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.topPosts.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800/80">
                    <td className="max-w-xs truncate py-2">
                      {p.hook || p.caption || p.body}
                    </td>
                    <td className="py-2 font-mono">{p.viral_score.toFixed(1)}</td>
                    <td className="py-2">{p.content_bucket}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Winning patterns */}
      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Winning patterns
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
            className="text-xs font-medium text-blue-600 underline"
          >
            Refresh from scores
          </button>
        </div>
        {!snapshot?.patterns ? (
          <p className="mt-3 text-sm text-neutral-500">
            No learning row yet — add scores, then refresh.
          </p>
        ) : (
          <div className="mt-3 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
            <ul className="list-disc pl-4">
              {snapshot.patterns.common_hook_patterns.slice(0, 10).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            {snapshot.patterns.summary ? (
              <p className="text-neutral-500">{snapshot.patterns.summary}</p>
            ) : null}
          </div>
        )}
      </section>

      {/* Trend */}
      <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Growth trends (viral score)
        </h2>
        {!snapshot?.trend.length ? (
          <p className="mt-3 text-sm text-neutral-500">No score history for this brand.</p>
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
