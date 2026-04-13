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
  return [
    "w-full rounded-2xl border border-white/[0.12] bg-white/[0.05] px-3.5 py-3 text-sm text-white",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none backdrop-blur-sm",
    "transition duration-200 ease-out",
    "hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_0_20px_-4px_rgba(168,85,247,0.15)]",
    "focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/35 focus:ring-offset-2 focus:ring-offset-[#07070c]",
    "placeholder:text-white/30",
  ].join(" ");
}

function labelCls() {
  return "mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200/55";
}

function IconSparkStack({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 12l8-4.5M12 12v9M12 12L4 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChartUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19h16M7 15l4-4 3 3 5-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HookEngineApp() {
  const [form, setForm] = useState<HookFormState>(DEFAULT_FORM);
  const [results, setResults] = useState<GeneratedHook[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const update = useCallback(<K extends keyof HookFormState>(key: K, value: HookFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const onGenerate = useCallback(() => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setResults(generateMockHooks(form));
      setIsGenerating(false);
    }, 520);
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
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_110%_70%_at_50%_-15%,rgba(168,85,247,0.28),transparent_52%),radial-gradient(ellipse_55%_50%_at_100%_15%,rgba(59,130,246,0.16),transparent),radial-gradient(ellipse_45%_40%_at_0%_80%,rgba(236,72,153,0.12),transparent)]"
        aria-hidden
      />

      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050508]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
              BeFamous App
            </span>
            <span className="hidden shrink-0 rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500/15 to-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-100/95 shadow-[0_0_20px_rgba(192,38,211,0.2)] sm:inline">
              Internal Growth Engine
            </span>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-xs font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-200 hover:border-white/25 hover:bg-white/[0.1] hover:shadow-[0_0_24px_rgba(59,130,246,0.12)] active:scale-[0.98] sm:px-4 sm:text-sm"
          >
            ← Home
          </Link>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:hidden lg:px-8">
          <span className="inline-block rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500/15 to-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-100/95">
            Internal Growth Engine
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <section className="mb-10 text-center lg:mb-12 lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-br from-white via-white to-blue-200/80 bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(139,92,246,0.25)]">
              Hook Engine
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-100/45 lg:mx-0 lg:text-lg">
            Generate scroll-stopping hooks, angles, and starter captions fast.
          </p>
        </section>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-10 lg:col-span-8">
            <section className="relative">
              <div
                className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-fuchsia-500/35 via-blue-500/25 to-violet-600/35 opacity-80 blur-[1px]"
                aria-hidden
              />
              <div className="relative rounded-3xl border border-white/[0.1] bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(168,85,247,0.08),0_24px_80px_-28px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl sm:p-9">
                <h2 className="text-base font-semibold tracking-tight text-white">Brief the engine</h2>
                <p className="mt-2 text-sm text-blue-100/40">
                  The more specific your audience, offer, and CTA, the sharper the angles.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
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
                        <option key={p} value={p} className="bg-neutral-950">
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
                        <option key={n} value={n} className="bg-neutral-950">
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
                        <option key={g} value={g} className="bg-neutral-950">
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
                        <option key={t} value={t} className="bg-neutral-950">
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
                        <option key={c} value={c} className="bg-neutral-950">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={onGenerate}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-violet-600 to-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_14px_44px_-10px_rgba(236,72,153,0.45),0_0_0_1px_rgba(255,255,255,0.1)_inset] transition duration-200 enabled:hover:scale-[1.02] enabled:hover:shadow-[0_18px_50px_-8px_rgba(139,92,246,0.55),0_0_40px_-10px_rgba(59,130,246,0.35)] enabled:active:scale-[0.98] disabled:cursor-wait disabled:opacity-90 sm:w-auto"
                  >
                    {isGenerating ? (
                      <>
                        <span
                          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                          aria-hidden
                        />
                        <span>Generating…</span>
                      </>
                    ) : (
                      "Generate hooks"
                    )}
                  </button>
                  <p className="text-center text-xs text-blue-100/35 sm:text-left">
                    Mock engine — templates + your brief. API wiring comes next.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-white">Output</h2>
                {results.length > 0 ? (
                  <span className="text-xs font-medium text-fuchsia-300/70">{results.length} cards</span>
                ) : null}
              </div>

              {results.length === 0 && !isGenerating ? (
                <div className="rounded-3xl border border-dashed border-white/[0.14] bg-white/[0.03] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm">
                  <p className="text-sm text-blue-100/45">
                    Set your brief above, then hit{" "}
                    <strong className="text-fuchsia-200/90">Generate hooks</strong> to preview angles.
                  </p>
                </div>
              ) : null}

              {isGenerating && results.length === 0 ? (
                <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/[0.1] bg-white/[0.03] py-16 backdrop-blur-md">
                  <span
                    className="h-5 w-5 animate-spin rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-400"
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-blue-100/50">Crafting angles…</span>
                </div>
              ) : null}

              {results.length > 0 ? (
                <ul className="space-y-5">
                  {results.map((h, idx) => (
                    <li
                      key={h.id}
                      className="hook-output-card group relative rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.9),0_0_0_1px_rgba(168,85,247,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition duration-300 hover:border-fuchsia-500/25 hover:shadow-[0_24px_70px_-24px_rgba(139,92,246,0.25),0_0_48px_-12px_rgba(59,130,246,0.15)]"
                      style={{ animationDelay: `${idx * 55}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
                        <span className="font-mono text-[11px] text-blue-300/40">#{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => void copyAll(h)}
                          className="shrink-0 rounded-lg border border-white/15 bg-gradient-to-b from-white/[0.12] to-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_20px_-4px_rgba(236,72,153,0.25)] transition hover:border-fuchsia-400/40 hover:shadow-[0_0_24px_rgba(236,72,153,0.2)] active:scale-[0.97]"
                        >
                          {copiedId === `all-${h.id}` ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <div className="mt-5 space-y-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-fuchsia-300/95">
                            Hook
                          </p>
                          <p className="mt-2 text-[15px] leading-relaxed text-white">{h.hook}</p>
                          <button
                            type="button"
                            onClick={() => void copyBlock(`hook-${h.id}`, h.hook)}
                            className="mt-2 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                          >
                            {copiedId === `hook-${h.id}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300/90">
                            Angle
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-blue-100/75">{h.angle}</p>
                          <button
                            type="button"
                            onClick={() => void copyBlock(`angle-${h.id}`, h.angle)}
                            className="mt-2 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                          >
                            {copiedId === `angle-${h.id}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pink-300/95">
                            Starter caption
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-blue-100/75">{h.starterCaption}</p>
                          <button
                            type="button"
                            onClick={() => void copyBlock(`cap-${h.id}`, h.starterCaption)}
                            className="mt-2 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                          >
                            {copiedId === `cap-${h.id}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] p-6 shadow-[0_0_40px_-16px_rgba(139,92,246,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-fuchsia-500/20 hover:shadow-[0_0_48px_-12px_rgba(168,85,247,0.2)]">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-500/25 to-violet-600/20 text-fuchsia-200 shadow-[0_0_24px_rgba(236,72,153,0.15)]">
                  <IconSparkStack className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">Saved winning patterns</h3>
                  <p className="mt-2 text-xs leading-relaxed text-blue-100/45">
                    Connect performance data to pin repeatable hooks here — placeholder for v2.
                  </p>
                </div>
              </div>
              <div className="mt-5 h-16 rounded-xl border border-dashed border-white/12 bg-white/[0.03]" />
            </div>
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] p-6 shadow-[0_0_40px_-16px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-blue-400/25 hover:shadow-[0_0_48px_-12px_rgba(59,130,246,0.18)]">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/25 bg-gradient-to-br from-blue-500/25 to-cyan-500/10 text-blue-200 shadow-[0_0_24px_rgba(59,130,246,0.2)]">
                  <IconChartUp className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">Top performing formats</h3>
                  <p className="mt-2 text-xs leading-relaxed text-blue-100/45">
                    Ranked by score once posts are logged — placeholder.
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-blue-100/40">
                <li className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 transition hover:border-blue-400/20">
                  Pattern A — TBD
                </li>
                <li className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 transition hover:border-blue-400/20">
                  Pattern B — TBD
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 to-blue-950/30 p-6 shadow-[0_0_40px_-12px_rgba(139,92,246,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15 text-violet-200">
                  <IconBolt className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-violet-100">Automation coming soon</h3>
                  <p className="mt-2 text-xs leading-relaxed text-blue-100/45">
                    Scheduled generation, brand presets, and assisted posting — on the roadmap.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
