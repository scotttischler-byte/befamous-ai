"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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

type EngineStatus = "idle" | "generating" | "done";

function fieldCls() {
  return [
    "w-full rounded-2xl border border-white/[0.12] bg-black/30 px-3.5 py-3 text-sm font-medium text-white antialiased",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] outline-none backdrop-blur-md",
    "transition duration-200 ease-out",
    "hover:border-white/22 hover:bg-white/[0.07] hover:brightness-110 hover:shadow-[0_0_24px_-4px_rgba(109,40,217,0.2)]",
    "focus:border-purple-400/50 focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-[#06060a]",
    "placeholder:text-white/35",
  ].join(" ");
}

function labelCls() {
  return "mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200/60";
}

function IconPlatform({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2" y="3" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 17h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="7" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 16c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 16c0-1.3 1.1-2 2.5-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function IconTone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 2l1.2 3.6h3.8l-3 2.2 1.1 3.5L10 10.3 6.9 11.3l1.1-3.5-3-2.2h3.8L10 2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M4 17h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
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

function EngineStatusBar({ status }: { status: EngineStatus }) {
  if (status === "idle") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm font-medium text-emerald-100/95 shadow-[0_0_24px_-8px_rgba(52,211,153,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <span
          className="relative flex h-2.5 w-2.5 shrink-0"
          aria-hidden
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
        </span>
        Engine Ready
      </div>
    );
  }
  if (status === "generating") {
    return (
      <div className="engine-status-shimmer relative overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-r from-blue-950/50 via-violet-950/40 to-fuchsia-950/50 px-4 py-3 text-sm font-medium text-blue-100/95 shadow-[0_0_32px_-8px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <span className="relative z-10 flex items-center gap-2">
          <span className="inline-flex gap-0.5" aria-hidden>
            <span className="animate-bounce [animation-delay:0ms]" style={{ animationDuration: "1s" }}>
              .
            </span>
            <span className="animate-bounce [animation-delay:150ms]" style={{ animationDuration: "1s" }}>
              .
            </span>
            <span className="animate-bounce [animation-delay:300ms]" style={{ animationDuration: "1s" }}>
              .
            </span>
          </span>
          Generating high-performing hooks...
        </span>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-fuchsia-500/35 bg-gradient-to-r from-fuchsia-950/40 to-violet-950/35 px-4 py-3 text-sm font-semibold text-fuchsia-100 shadow-[0_0_36px_-6px_rgba(236,72,153,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
      Hooks ready
    </div>
  );
}

export function HookEngineApp() {
  const [form, setForm] = useState<HookFormState>(DEFAULT_FORM);
  const [results, setResults] = useState<GeneratedHook[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("idle");

  useEffect(() => {
    if (engineStatus !== "done") return;
    const t = window.setTimeout(() => setEngineStatus("idle"), 2800);
    return () => window.clearTimeout(t);
  }, [engineStatus]);

  const update = useCallback(<K extends keyof HookFormState>(key: K, value: HookFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const onGenerate = useCallback(() => {
    setEngineStatus("generating");
    setIsGenerating(true);
    window.setTimeout(() => {
      setResults(generateMockHooks(form));
      setIsGenerating(false);
      setEngineStatus("done");
    }, 920);
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
      const block = `Hook:\n${h.hook}\n\nAngle (why it works):\n${h.angle}\n\nSuggested CTA:\n${h.suggestedCta}`;
      await copyBlock(`all-${h.id}`, block);
    },
    [copyBlock],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#04040a] text-white">
      {/* Animated aurora + grain */}
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden" aria-hidden>
        <div className="hook-engine-bg-animated absolute -inset-[35%] scale-110" />
      </div>
      <div
        className="hook-engine-grain pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      />

      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#04040a]/75 backdrop-blur-xl">
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
            className="shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-xs font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-200 hover:border-white/25 hover:bg-white/[0.1] active:scale-[0.98] sm:px-4 sm:text-sm"
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="shadow-[0_0_100px_-40px_rgba(109,40,217,0.35),0_0_80px_-50px_rgba(37,99,235,0.2)]">
          <section className="mb-10 text-center lg:mb-14 lg:text-left">
            <h1 className="text-[2.125rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-br from-white via-white to-blue-300/90 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(109,40,217,0.35)]">
                Hook Engine
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-blue-100/50 lg:mx-0 lg:text-lg">
              Generate scroll-stopping hooks, angles, and starter captions fast.
            </p>
          </section>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-8 lg:col-span-8">
              <EngineStatusBar status={engineStatus} />

              <section className="relative">
                <div
                  className="pointer-events-none absolute -inset-[1px] rounded-[1.4rem] bg-gradient-to-br from-[#6D28D9]/50 via-[#2563EB]/35 to-[#EC4899]/45 opacity-90 blur-[1.5px]"
                  aria-hidden
                />
                <div className="relative rounded-3xl border border-white/[0.1] bg-black/45 p-6 shadow-[inset_0_2px_24px_rgba(0,0,0,0.45),0_0_0_1px_rgba(109,40,217,0.12),0_28px_90px_-32px_rgba(0,0,0,0.9)] backdrop-blur-lg sm:p-10">
                  <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                    Brief the Engine
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/45">
                    The more specific your audience, offer, and CTA — the sharper the hooks.
                  </p>
                  <div className="mt-9 grid gap-7 sm:grid-cols-2">
                    <div>
                      <label className={labelCls()} htmlFor="platform">
                        <IconPlatform className="h-4 w-4 text-fuchsia-400/90" />
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
                        <IconTarget className="h-4 w-4 text-blue-400/90" />
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
                        <IconTone className="h-4 w-4 text-pink-400/90" />
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
                        <IconUsers className="h-4 w-4 text-cyan-300/85" />
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

                  <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={onGenerate}
                      className={`group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-violet-600 to-blue-600 px-10 py-4 text-sm font-bold tracking-wide text-white transition duration-200 enabled:hover:scale-[1.03] enabled:hover:shadow-[0_22px_56px_-10px_rgba(236,72,153,0.55),0_0_56px_-8px_rgba(37,99,235,0.45)] enabled:active:scale-[0.98] disabled:cursor-wait disabled:opacity-90 sm:w-auto ${
                        !isGenerating ? "cta-generate-idle" : ""
                      }`}
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
                        "Generate Hooks"
                      )}
                    </button>
                    <p className="text-center text-xs text-blue-100/35 sm:text-left">
                      Mock engine — templates + your brief. API wiring comes next.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <h2 className="text-2xl font-bold tracking-tight text-white">Output</h2>
                  {results.length > 0 ? (
                    <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300/80">
                      {results.length} hooks
                    </span>
                  ) : null}
                </div>

                {results.length === 0 && !isGenerating ? (
                  <div className="rounded-3xl border border-dashed border-white/[0.14] bg-black/30 px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
                    <p className="text-sm text-blue-100/45">
                      Set your brief above, then hit{" "}
                      <strong className="text-fuchsia-200/90">Generate Hooks</strong> to load your pack.
                    </p>
                  </div>
                ) : null}

                {isGenerating && results.length === 0 ? (
                  <div className="engine-status-shimmer relative overflow-hidden rounded-3xl border border-white/[0.1] bg-black/35 py-20 text-center backdrop-blur-md">
                    <span
                      className="relative z-10 inline-flex h-8 w-8 animate-spin rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-400"
                      aria-hidden
                    />
                    <p className="relative z-10 mt-4 text-sm font-medium text-blue-100/55">
                      Shaping your hook pack…
                    </p>
                  </div>
                ) : null}

                {results.length > 0 ? (
                  <ul className="space-y-6">
                    {results.map((h, idx) => (
                      <li
                        key={h.id}
                        className="hook-output-card group relative rounded-2xl border border-white/[0.1] bg-gradient-to-br from-black/50 to-black/20 p-6 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.95),0_0_0_1px_rgba(109,40,217,0.12),0_0_48px_-16px_rgba(37,99,235,0.12),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition duration-300 hover:border-fuchsia-500/30 hover:shadow-[0_28px_80px_-24px_rgba(109,40,217,0.25),0_0_56px_-12px_rgba(236,72,153,0.15)]"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] pb-5">
                          <span className="font-mono text-xs text-blue-300/45">#{String(idx + 1).padStart(2, "0")}</span>
                          <button
                            type="button"
                            onClick={() => void copyAll(h)}
                            className="shrink-0 rounded-xl border border-white/18 bg-gradient-to-b from-white/[0.14] to-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_24px_-4px_rgba(236,72,153,0.35)] transition hover:border-fuchsia-400/45 active:scale-[0.96]"
                          >
                            {copiedId === `all-${h.id}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <div className="mt-6 space-y-7">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-fuchsia-300/95">
                              Hook
                            </p>
                            <p className="mt-3 text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
                              {h.hook}
                            </p>
                            <button
                              type="button"
                              onClick={() => void copyBlock(`hook-${h.id}`, h.hook)}
                              className="mt-3 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                            >
                              {copiedId === `hook-${h.id}` ? "Copied" : "Copy hook"}
                            </button>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-300/95">
                              Angle
                            </p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">
                              Why it works
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-blue-100/80">{h.angle}</p>
                            <button
                              type="button"
                              onClick={() => void copyBlock(`angle-${h.id}`, h.angle)}
                              className="mt-3 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                            >
                              {copiedId === `angle-${h.id}` ? "Copied" : "Copy angle"}
                            </button>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-pink-300/95">
                              Suggested CTA
                            </p>
                            <p className="mt-3 text-sm font-medium leading-relaxed text-pink-100/90">
                              {h.suggestedCta}
                            </p>
                            <button
                              type="button"
                              onClick={() => void copyBlock(`cta-${h.id}`, h.suggestedCta)}
                              className="mt-3 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                            >
                              {copiedId === `cta-${h.id}` ? "Copied" : "Copy CTA"}
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
              <div className="rounded-2xl border border-white/[0.1] bg-black/35 p-6 shadow-[0_0_48px_-16px_rgba(109,40,217,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-fuchsia-400/25 hover:shadow-[0_0_56px_-12px_rgba(236,72,153,0.25)]">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/30 to-violet-600/25 text-fuchsia-100 shadow-[0_0_28px_rgba(236,72,153,0.25)]">
                    <IconSparkStack className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Winning Patterns</h3>
                    <p className="mt-2 text-xs leading-relaxed text-blue-100/45">
                      Connect performance data to pin repeatable hooks here — placeholder for v2.
                    </p>
                  </div>
                </div>
                <div className="mt-5 h-16 rounded-xl border border-dashed border-white/12 bg-white/[0.03] shadow-[inset_0_0_24px_rgba(109,40,217,0.08)]" />
              </div>
              <div className="rounded-2xl border border-white/[0.1] bg-black/35 p-6 shadow-[0_0_48px_-16px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-blue-400/30 hover:shadow-[0_0_56px_-12px_rgba(37,99,235,0.25)]">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/30 to-cyan-500/15 text-blue-100 shadow-[0_0_28px_rgba(37,99,235,0.25)]">
                    <IconChartUp className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Top Formats</h3>
                    <p className="mt-2 text-xs leading-relaxed text-blue-100/45">
                      Ranked by score once posts are logged — placeholder.
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-blue-100/45">
                  <li className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 transition hover:border-blue-400/25">
                    Pattern A — TBD
                  </li>
                  <li className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 transition hover:border-blue-400/25">
                    Pattern B — TBD
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-violet-500/35 bg-gradient-to-br from-violet-950/55 to-blue-950/35 p-6 shadow-[0_0_48px_-12px_rgba(109,40,217,0.4),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/20 text-violet-100 shadow-[0_0_24px_rgba(139,92,246,0.3)]">
                    <IconBolt className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-violet-100">Automation (Coming Soon)</h3>
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
    </div>
  );
}
