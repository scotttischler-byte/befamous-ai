"use client";

import { useMemo, useState, useTransition } from "react";
import type { ContentDraft } from "@/lib/content-engine";
import type { EnvDashboardStatus } from "@/lib/env-check";
import type { BrandRow, BrandTag } from "@/lib/types";
import type { DashboardSnapshot } from "@/lib/dashboard-load";
import {
  exportLatestMvaVideoPlanAction,
  generateDemoVerticalAction,
  generateTenAction,
  generateTenMvaAdsPersistAction,
  listTopPerformersAction,
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
  envStatus: EnvDashboardStatus;
  brandsError: string | null;
};

function InstantGeneratePanel() {
  const [preview, setPreview] = useState<{
    label: string;
    drafts: ContentDraft[];
  } | null>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [busy, start] = useTransition();

  function run(tag: BrandTag, label: string) {
    setLocalErr(null);
    setPreview(null);
    start(async () => {
      const r = await generateDemoVerticalAction(tag);
      if (!r.ok) {
        setLocalErr(r.error);
        return;
      }
      setPreview({ label, drafts: r.drafts });
    });
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
        Instant generate
      </h2>
      <p className="mt-2 text-sm text-emerald-900/80 dark:text-emerald-200/80">
        Ten posts per click. Runs without Supabase; uses demo copy if OpenAI keys are missing.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => run("MVA", "MVA")}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-emerald-600"
        >
          Generate 10 MVA Posts
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run("LAW_FIRM", "Law Firm")}
          className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-900 disabled:opacity-50 dark:border-emerald-500 dark:text-emerald-200"
        >
          Generate 10 Law Firm Posts
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run("FITNESS", "Fitness")}
          className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-900 disabled:opacity-50 dark:border-emerald-500 dark:text-emerald-200"
        >
          Generate 10 Fitness Posts
        </button>
      </div>

      {busy && (
        <p className="mt-3 text-sm text-emerald-800 dark:text-emerald-300">Generating…</p>
      )}
      {localErr && (
        <p className="mt-3 text-sm text-red-700 dark:text-red-300">{localErr}</p>
      )}
      {preview && (
        <div className="mt-6 space-y-4 border-t border-emerald-200 pt-6 dark:border-emerald-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {preview.label} — {preview.drafts.length} posts
            </h3>
            <CopyBtn
              label="Copy all"
              text={preview.drafts
                .map(
                  (d, i) =>
                    `#${i + 1} [${d.platform}]${d.mva_variation ? ` · ${d.mva_variation}` : ""}\n\nHook:\n${d.hook}\n\nScript:\n${d.script}\n\nCaption:\n${d.caption}\n\nCTA:\n${d.cta}\n\nVisual plan:\n${(d.visual_plan ?? []).join("\n")}\n\nHashtags:\n${(d.hashtags_list ?? []).join(" ")}`
                )
                .join("\n\n---\n\n")}
            />
          </div>
          <ul className="max-h-[480px] space-y-4 overflow-y-auto pr-1">
            {preview.drafts.map((d, i) => (
              <li
                key={`${d.hook}-${i}`}
                className="rounded-lg border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                    {d.platform} · #{i + 1}
                  </span>
                  <CopyBtn
                    text={[
                      `Hook:\n${d.hook}`,
                      `Script:\n${d.script}`,
                      `Caption:\n${d.caption}`,
                      `CTA:\n${d.cta}`,
                      `Visual plan:\n${(d.visual_plan ?? []).join("\n")}`,
                      `Hashtags:\n${(d.hashtags_list ?? []).join(" ")}`,
                    ].join("\n\n")}
                  />
                </div>
                {d.mva_variation ? (
                  <p className="mt-1 text-[10px] font-semibold uppercase text-emerald-800 dark:text-emerald-300">
                    {d.mva_variation}
                  </p>
                ) : null}
                <p className="mt-1 text-[10px] font-bold uppercase text-neutral-400">Hook</p>
                <p className="font-medium text-neutral-900 dark:text-white">{d.hook}</p>
                <p className="mt-2 text-[10px] font-bold uppercase text-neutral-400">Script</p>
                <p className="whitespace-pre-wrap text-xs text-neutral-700 dark:text-neutral-300">
                  {d.script}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase text-neutral-400">Caption</p>
                <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                  {d.caption}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase text-neutral-400">CTA</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{d.cta}</p>
                <p className="mt-2 text-[10px] font-bold uppercase text-neutral-400">Visual plan</p>
                <ul className="list-inside list-decimal text-xs text-neutral-600 dark:text-neutral-400">
                  {(d.visual_plan ?? []).map((line, j) => (
                    <li key={j}>{line}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] font-bold uppercase text-neutral-400">Hashtags</p>
                <p className="text-xs text-neutral-500">{(d.hashtags_list ?? []).join(" ")}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

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

type TopItem = { id: string; hook: string; score: number; captionPreview: string };

export function DashboardClient({
  brands,
  activeBrandId,
  snapshot,
  envStatus,
  brandsError,
}: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [leadMode, setLeadMode] = useState(false);
  const [topPerformers, setTopPerformers] = useState<TopItem[] | null>(null);
  const [topErr, setTopErr] = useState<string | null>(null);

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
      <div className="space-y-8">
        <InstantGeneratePanel />
        {!envStatus.supabase.ready ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Fix the &quot;Missing environment variables&quot; banner above to load brands and use the
            full cockpit (persist, metrics, learning).
          </p>
        ) : brandsError ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Brands could not be loaded. See the error banner above.
          </p>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm dark:border-amber-900 dark:bg-amber-950/40">
            No brands yet. Apply <code className="font-mono">supabase/schema.sql</code> then refresh.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <InstantGeneratePanel />
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

      <section className="rounded-2xl border border-indigo-300 bg-indigo-50/60 p-5 dark:border-indigo-800 dark:bg-indigo-950/30">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-900 dark:text-indigo-200">
          Autonomous growth
        </h2>
        <p className="mt-2 text-sm text-indigo-900/80 dark:text-indigo-200/80">
          MVA pipeline: persist ads, export CapCut-style scene plans, inspect top performers by viral score.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              flash(async () => {
                const r = await generateTenMvaAdsPersistAction();
                return r.ok
                  ? { ok: true as const }
                  : { ok: false as const, error: r.error };
              })
            }
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Generate 10 Ads
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              flash(async () => {
                const r = await exportLatestMvaVideoPlanAction();
                if (!r.ok) return { ok: false as const, error: r.error };
                const blob = new Blob([JSON.stringify(r.exports, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `bge-capcut-plans-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                return { ok: true as const };
              })
            }
            className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-900 disabled:opacity-50 dark:text-indigo-200"
          >
            Export to Video Plan
          </button>
          <button
            type="button"
            disabled={pending || !activeBrandId}
            onClick={() => {
              setTopErr(null);
              setTopPerformers(null);
              start(async () => {
                if (!activeBrandId) return;
                const r = await listTopPerformersAction(activeBrandId);
                if (!r.ok) {
                  setTopErr(r.error);
                  return;
                }
                setTopPerformers(r.items);
              });
            }}
            className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-900 disabled:opacity-50 dark:text-indigo-200"
          >
            View Top Performers
          </button>
        </div>
        {topErr && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{topErr}</p>}
        {topPerformers && topPerformers.length > 0 && (
          <div className="mt-4 max-h-56 overflow-y-auto rounded-lg border border-indigo-200 bg-white p-3 text-sm dark:border-indigo-900 dark:bg-neutral-900/80">
            <p className="text-xs font-semibold uppercase text-indigo-700 dark:text-indigo-300">
              Top performers (active brand)
            </p>
            <ul className="mt-2 space-y-2">
              {topPerformers.map((t) => (
                <li key={t.id} className="border-b border-neutral-100 pb-2 dark:border-neutral-800">
                  <span className="font-mono text-xs text-indigo-600">{t.score}</span>{" "}
                  <span className="font-medium">{t.hook.slice(0, 72)}</span>
                  <p className="text-xs text-neutral-500">{t.captionPreview}…</p>
                </li>
              ))}
            </ul>
          </div>
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
              const vp = Array.isArray(p.visual_plan) ? p.visual_plan : [];
              const copyText = [
                p.hook && `Hook:\n${p.hook}`,
                p.content && `Script:\n${p.content}`,
                p.caption && `Caption:\n${p.caption}`,
                p.cta && `CTA:\n${p.cta}`,
                vp.length && `Visual plan:\n${vp.join("\n")}`,
                p.hashtags && `Hashtags:\n${p.hashtags}`,
              ]
                .filter(Boolean)
                .join("\n\n");
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
                  <p className="mt-1 text-[10px] font-bold uppercase text-neutral-400">Hook</p>
                  <p className="text-sm font-medium">{p.hook}</p>
                  {p.content ? (
                    <>
                      <p className="mt-2 text-[10px] font-bold uppercase text-neutral-400">Script</p>
                      <p className="whitespace-pre-wrap text-xs text-neutral-600 dark:text-neutral-400">
                        {p.content}
                      </p>
                    </>
                  ) : null}
                  <p className="mt-2 text-[10px] font-bold uppercase text-neutral-400">Caption</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                    {p.caption}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase text-neutral-400">CTA</p>
                  <p className="text-xs text-neutral-500">{p.cta}</p>
                  {Array.isArray(p.visual_plan) && p.visual_plan.length > 0 ? (
                    <>
                      <p className="mt-2 text-[10px] font-bold uppercase text-neutral-400">
                        Visual plan
                      </p>
                      <ul className="list-inside list-decimal text-xs text-neutral-600 dark:text-neutral-400">
                        {p.visual_plan.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
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
          Score = views×0.3 + shares×0.3 + comments×0.2 + likes×0.1 + conversion_est×0.1 (also written to{" "}
          <code className="font-mono">performance_logs</code> via <code className="font-mono">/api/performance/log</code>
          ).
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
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {(
              [
                "views",
                "likes",
                "comments",
                "shares",
                "saves",
                "conversion_estimate",
              ] as const
            ).map((f) => (
              <label key={f} className="flex flex-col gap-1 text-xs">
                {f === "conversion_estimate" ? "conversion_est." : f}
                <input
                  type="number"
                  name={f}
                  min={0}
                  step={f === "conversion_estimate" ? "0.1" : "1"}
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
