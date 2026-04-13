"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { generateMockHooks, type GeneratedHook } from "@/lib/hook-engine-mock";
import {
  DEFAULT_FORM,
  GOALS,
  NICHES,
  OUTPUT_COUNTS,
  PLATFORMS,
  TONES,
  type HookFormState,
} from "@/lib/hook-engine-types";

function fieldCls() {
  return "w-full rounded-xl border border-white/[0.1] bg-black/35 px-3 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20";
}

function labelCls() {
  return "mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-white/45";
}

export function HookEngineApp() {
  const [form, setForm] = useState<HookFormState>(DEFAULT_FORM);
  const [results, setResults] = useState<GeneratedHook[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const update = useCallback(<K extends keyof HookFormState>(key: K, value: HookFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const onGenerate = useCallback(() => {
    setResults(generateMockHooks(form));
  }, [form]);

  const copyBlock = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  }, []);

  const copyAll = useCallback(
    async (h: GeneratedHook) => {
      const block = `Hook:\n${h.hook}\n\nAngle:\n${h.angle}\n\nStarter caption:\n${h.starterCaption}`;
      await copyBlock(`all-${h.id}`, block);
    },
    [copyBlock],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050508] text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_110%_70%_at_50%_-15%,rgba(147,51,234,0.22),transparent_50%),radial-gradient(ellipse_60%_50%_at_100%_20%,rgba(59,130,246,0.1),transparent),radial-gradient(ellipse_50%_45%_at_0%_75%,rgba(236,72,153,0.1),transparent)]"
        aria-hidden
      />

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050508]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
              BeFamous App
            </span>
            <span className="hidden shrink-0 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-200/95 sm:inline">
              Internal Growth Engine
            </span>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-200 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] sm:px-4 sm:text-sm"
          >
            ← Home
          </Link>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:hidden lg:px-8">
          <span className="inline-block rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-200/95">
            Internal Growth Engine
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero */}
        <section className="mb-8 text-center lg:mb-10 lg:text-left">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.5rem]">
            <span className="bg-gradient-to-br from-white via-white to-white/75 bg-clip-text text-transparent">
              Hook Engine
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/55 lg:mx-0 lg:text-lg">
            Generate scroll-stopping hooks, angles, and starter captions fast.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-8 lg:col-span-8">
            {/* Form card */}
            <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] sm:p-7">
              <h2 className="text-sm font-semibold text-white/90">Brief the engine</h2>
              <p className="mt-1 text-xs text-white/45">
                The more specific your audience, offer, and CTA, the sharper the angles.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className={labelCls()} htmlFor="platform">
                    Platform
                  </label>
                  <select
                    id="platform"
                    className={fieldCls()}
                    value={form.platform}
                    onChange={(e) => update("platform", e.target.value)}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p} className="bg-neutral-900">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls()} htmlFor="niche">
                    Niche
                  </label>
                  <select
                    id="niche"
                    className={fieldCls()}
                    value={form.niche}
                    onChange={(e) => update("niche", e.target.value)}
                  >
                    {NICHES.map((n) => (
                      <option key={n} value={n} className="bg-neutral-900">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls()} htmlFor="goal">
                    Content Goal
                  </label>
                  <select
                    id="goal"
                    className={fieldCls()}
                    value={form.goal}
                    onChange={(e) => update("goal", e.target.value)}
                  >
                    {GOALS.map((g) => (
                      <option key={g} value={g} className="bg-neutral-900">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls()} htmlFor="tone">
                    Tone
                  </label>
                  <select
                    id="tone"
                    className={fieldCls()}
                    value={form.tone}
                    onChange={(e) => update("tone", e.target.value)}
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t} className="bg-neutral-900">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls()} htmlFor="audience">
                    Audience
                  </label>
                  <input
                    id="audience"
                    type="text"
                    className={fieldCls()}
                    placeholder="e.g. first-time founders in Texas"
                    value={form.audience}
                    onChange={(e) => update("audience", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls()} htmlFor="offer">
                    Offer or Topic
                  </label>
                  <input
                    id="offer"
                    type="text"
                    className={fieldCls()}
                    placeholder="What you’re selling or teaching"
                    value={form.offer}
                    onChange={(e) => update("offer", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls()} htmlFor="cta">
                    Call to Action
                  </label>
                  <input
                    id="cta"
                    type="text"
                    className={fieldCls()}
                    placeholder="e.g. link in bio, book a call, comment YES"
                    value={form.cta}
                    onChange={(e) => update("cta", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls()} htmlFor="count">
                    Number of outputs
                  </label>
                  <select
                    id="count"
                    className={fieldCls()}
                    value={form.outputCount}
                    onChange={(e) =>
                      update("outputCount", Number(e.target.value) as HookFormState["outputCount"])
                    }
                  >
                    {OUTPUT_COUNTS.map((c) => (
                      <option key={c} value={c} className="bg-neutral-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={onGenerate}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-8px_rgba(139,92,246,0.5)] transition duration-200 hover:brightness-110 hover:shadow-[0_12px_44px_-6px_rgba(168,85,247,0.45)] sm:w-auto"
                >
                  Generate hooks
                </button>
                <p className="text-center text-xs text-white/35 sm:text-left">
                  Mock engine — templates + your brief. API wiring comes next.
                </p>
              </div>
            </section>

            {/* Results */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">Output</h2>
                {results.length > 0 ? (
                  <span className="text-xs text-white/40">{results.length} cards</span>
                ) : null}
              </div>

              {results.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/[0.12] bg-black/25 px-6 py-14 text-center">
                  <p className="text-sm text-white/45">
                    Set your brief above, then hit <strong className="text-white/70">Generate hooks</strong> to
                    preview angles.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {results.map((h, idx) => (
                    <li
                      key={h.id}
                      className="group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-5 shadow-[0_16px_50px_-30px_rgba(0,0,0,0.85)] transition hover:border-white/[0.14]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-[11px] text-white/35">#{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => void copyAll(h)}
                          className="shrink-0 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/90 transition hover:bg-white/[0.1]"
                        >
                          {copiedId === `all-${h.id}` ? "Copied" : "Copy all"}
                        </button>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-300/90">
                            Hook
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-white/90">{h.hook}</p>
                          <button
                            type="button"
                            onClick={() => void copyBlock(`hook-${h.id}`, h.hook)}
                            className="mt-2 text-xs font-medium text-blue-400/90 hover:text-blue-300"
                          >
                            {copiedId === `hook-${h.id}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/90">
                            Angle
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-white/75">{h.angle}</p>
                          <button
                            type="button"
                            onClick={() => void copyBlock(`angle-${h.id}`, h.angle)}
                            className="mt-2 text-xs font-medium text-blue-400/90 hover:text-blue-300"
                          >
                            {copiedId === `angle-${h.id}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-300/90">
                            Starter caption
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-white/75">{h.starterCaption}</p>
                          <button
                            type="button"
                            onClick={() => void copyBlock(`cap-${h.id}`, h.starterCaption)}
                            className="mt-2 text-xs font-medium text-blue-400/90 hover:text-blue-300"
                          >
                            {copiedId === `cap-${h.id}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Side panel */}
          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-white/[0.07] bg-black/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h3 className="text-sm font-semibold text-white/90">Saved winning patterns</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Connect performance data to pin repeatable hooks here — placeholder for v2.
              </p>
              <div className="mt-4 h-16 rounded-xl border border-dashed border-white/10 bg-white/[0.02]" />
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-black/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h3 className="text-sm font-semibold text-white/90">Top performing formats</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Ranked by score once posts are logged — placeholder.
              </p>
              <ul className="mt-3 space-y-2 text-xs text-white/35">
                <li className="rounded-lg border border-white/[0.06] px-3 py-2">Pattern A — TBD</li>
                <li className="rounded-lg border border-white/[0.06] px-3 py-2">Pattern B — TBD</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-950/25 p-5">
              <h3 className="text-sm font-semibold text-violet-200/95">Automation coming soon</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Scheduled generation, brand presets, and assisted posting — on the roadmap.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
