"use client";

import { useState, useTransition } from "react";
import type { ContentDraft } from "@/lib/content-engine";
import { generateFiveMvaTestAction } from "./actions";

/**
 * Always mounted from the dashboard page (no conditional rendering).
 * DB-free: calls generateBatchContent("MVA", 5) via server action.
 */
export function MvaTestPanel() {
  const [drafts, setDrafts] = useState<ContentDraft[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, start] = useTransition();

  return (
    <section
      className="mb-8 rounded-2xl border-2 border-violet-400 bg-violet-50/80 p-5 shadow-sm dark:border-violet-600 dark:bg-violet-950/30"
      aria-label="MVA test generator"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-900 dark:text-violet-200">
        Test (no database)
      </h2>
      <p className="mt-1 text-sm text-violet-800/90 dark:text-violet-200/80">
        <code className="rounded bg-violet-100 px-1 font-mono text-xs dark:bg-violet-900/80">generateBatchContent(&quot;MVA&quot;, 5)</code>{" "}
        — check the browser console for logged results.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setErr(null);
          setDrafts(null);
          start(async () => {
            const r = await generateFiveMvaTestAction();
            if (!r.ok) {
              setErr(r.error);
              console.error("[BGE] generateBatchContent('MVA', 5) failed:", r.error);
              return;
            }
            console.log("[BGE] generateBatchContent('MVA', 5) results:", r.drafts);
            setDrafts(r.drafts);
          });
        }}
        className="mt-4 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-400"
      >
        Generate 5 MVA Ads
      </button>
      {busy && (
        <p className="mt-3 text-sm text-violet-800 dark:text-violet-300">Generating…</p>
      )}
      {err && <p className="mt-3 text-sm text-red-700 dark:text-red-300">{err}</p>}
      {drafts && drafts.length > 0 && (
        <ul className="mt-5 max-h-[480px] space-y-4 overflow-y-auto border-t border-violet-200 pt-4 dark:border-violet-800">
          {drafts.map((d, i) => (
            <li
              key={`mva5-page-${i}-${d.hook.slice(0, 16)}`}
              className="rounded-lg border border-violet-200 bg-white p-3 text-sm dark:border-violet-900 dark:bg-neutral-900/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                  {d.platform} · #{i + 1}
                </span>
                {d.mva_variation ? (
                  <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-900 dark:bg-violet-900/60 dark:text-violet-100">
                    {d.mva_variation}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                Hook
              </p>
              <p className="font-medium text-neutral-900 dark:text-white">{d.hook}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                Script
              </p>
              <p className="whitespace-pre-wrap text-xs text-neutral-700 dark:text-neutral-300">
                {d.script}
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                Caption
              </p>
              <p className="whitespace-pre-wrap text-xs text-neutral-600 dark:text-neutral-400">
                {d.caption}
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                CTA
              </p>
              <p className="text-xs font-medium text-violet-800 dark:text-violet-200">{d.cta}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                Visual plan
              </p>
              <ul className="list-inside list-decimal text-xs text-neutral-600 dark:text-neutral-400">
                {(d.visual_plan ?? []).map((line, j) => (
                  <li key={j}>{line}</li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                Hashtags
              </p>
              <p className="text-xs text-neutral-500">{(d.hashtags_list ?? []).join(" ")}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
