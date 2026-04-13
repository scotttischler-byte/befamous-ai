import Link from "next/link";
import { HomeModeSwitch } from "@/components/landing/home-mode-switch";
import {
  IconArrowRight,
  IconChart,
  IconLayers,
  IconSparkles,
  IconZap,
} from "@/components/landing/landing-icons";

const valueCards = [
  {
    title: "Generate Viral Content",
    body: "AI drafts hooks, captions, and CTAs tuned for short-form—so you ship ideas that stop the scroll.",
    Icon: IconSparkles,
  },
  {
    title: "Learn From Performance",
    body: "Every post feeds a learning loop that surfaces what resonates—so the next batch is sharper than the last.",
    Icon: IconChart,
  },
  {
    title: "Manage Multiple Brands",
    body: "One control center for every campaign, voice, and cadence—no more scattered docs or one-off tools.",
    Icon: IconLayers,
  },
  {
    title: "Turn Ideas Into Daily Posts",
    body: "Move from concept to ready-to-post output on a rhythm that matches how you actually operate.",
    Icon: IconZap,
  },
] as const;

const brands = [
  {
    name: "BeFamous",
    detail: "Flagship growth · creator-first storytelling",
  },
  {
    name: "MVA · legal marketing",
    detail: "Authority content · consult funnels",
  },
  {
    name: "NBA · sports jewelry",
    detail: "Hype drops · culture-led campaigns",
  },
  {
    name: "Personal brand",
    detail: "Deal flow · fitness · founder POV",
  },
] as const;

const workflow = [
  { step: "01", title: "Pick a brand", copy: "Choose the voice, offer, and guardrails that matter today." },
  { step: "02", title: "Choose an angle", copy: "Select a hook theme or campaign lane—tight, testable, on-brand." },
  { step: "03", title: "Generate hooks & copy", copy: "Get captions, CTAs, and variants built for the platforms you use." },
  { step: "04", title: "Review & post", copy: "Approve fast, tweak in plain English, publish with confidence." },
] as const;

export default function BeFamousAppScreen() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050508] text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(88,28,135,0.35),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(59,130,246,0.12),transparent),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(236,72,153,0.14),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,5,8,0)_0%,#050508_55%,#050508_100%)]"
        aria-hidden
      />

      <main className="relative z-0 mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 pt-14 sm:gap-20 sm:px-6 sm:pt-20 lg:gap-24 lg:px-8 lg:pt-24">
        {/* Hero */}
        <section className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="max-w-2xl flex-1">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 shadow-[0_0_40px_rgba(168,85,247,0.12)] backdrop-blur-sm sm:text-xs">
              <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Autonomous Growth Engine
              </span>
              <span className="text-white/25">·</span>
              <span>AI-powered viral content system</span>
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              <span className="bg-gradient-to-br from-white via-white to-white/75 bg-clip-text text-transparent">
                Viral growth, engineered.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                AI content that learns what works.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65 sm:text-xl">
              BeFamous helps your team generate scroll-stopping content, sharpen messaging in plain English,
              test hooks and angles quickly, and learn from real performance—so every cycle gets smarter, not
              noisier.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-8px_rgba(59,130,246,0.55),0_0_0_1px_rgba(255,255,255,0.08)_inset] transition hover:brightness-110 hover:shadow-[0_16px_48px_-8px_rgba(236,72,153,0.45)]"
              >
                Open operator dashboard
                <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="rounded-2xl border border-white/[0.14] bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                See how it works
              </a>
            </div>
            <p className="mt-6 text-xs text-white/40">
              Internal growth system first—built to scale toward a polished SaaS experience.
            </p>
          </div>
          <div className="w-full max-w-md flex-shrink-0 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-transparent p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md lg:mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300/90">
              At a glance
            </p>
            <ul className="mt-5 space-y-4 text-sm text-white/75">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                Built to amplify reach and repeat what performs
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-fuchsia-400 to-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.75)]" />
                Feedback loops that feel like a growth co-pilot
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-violet-400 to-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.75)]" />
                Posting workflows designed for speed and clarity
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />
                Multi-brand control from one disciplined stack
              </li>
            </ul>
          </div>
        </section>

        {/* Mode switch */}
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] px-4 py-12 shadow-[0_0_80px_-20px_rgba(139,92,246,0.25)] sm:px-8 sm:py-14">
          <HomeModeSwitch />
        </section>

        {/* Value cards */}
        <section id="how-it-works" className="scroll-mt-28">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              Multi-brand content control
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Built to learn what performs
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/55 sm:text-lg">
              Four pillars that make BeFamous feel like a serious growth engine—not another content toy.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {valueCards.map(({ title, body, Icon }) => (
              <article
                key={title}
                className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85)] transition hover:border-white/[0.14] hover:shadow-[0_24px_70px_-24px_rgba(59,130,246,0.2)]"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-fuchsia-500/15 to-pink-500/10 text-fuchsia-200 shadow-[0_0_24px_rgba(168,85,247,0.2)] transition group-hover:shadow-[0_0_32px_rgba(236,72,153,0.25)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Performance loop */}
        <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-[#0a0a12] to-fuchsia-950/35 px-6 py-12 sm:px-10 sm:py-16">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-3xl">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300/90">
              Performance loop
            </h2>
            <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              AI + feedback = smarter posting
            </p>
            <p className="mt-5 text-lg leading-relaxed text-white/65">
              The system tracks what performs best across your brands, spots stronger hooks and angles over time,
              and turns messy results into clear next moves—so you test faster, learn continuously, and move
              toward recommendations on what to post next.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/70">
              <li className="flex gap-3">
                <span className="text-fuchsia-400">→</span>
                Surfaces winning patterns from real scores—not guesswork
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400">→</span>
                Tightens messaging as you log performance and iterate
              </li>
              <li className="flex gap-3">
                <span className="text-pink-400">→</span>
                Sets the stage for “what should we ship tomorrow?” guidance
              </li>
            </ul>
          </div>
        </section>

        {/* Workflow */}
        <section>
          <div className="max-w-2xl">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-300/90">
              Easy posting workflow
            </h2>
            <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From pick to post—fast</p>
            <p className="mt-4 text-lg text-white/55">
              A simple path anyone on the team can follow—no engineering degree required.
            </p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map(({ step, title, copy }) => (
              <li
                key={step}
                className="relative rounded-2xl border border-white/[0.08] bg-black/30 p-6 backdrop-blur-sm"
              >
                <span className="font-mono text-xs font-medium text-white/35">{step}</span>
                <p className="mt-2 font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Multi-brand */}
        <section>
          <div className="max-w-2xl">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300/90">
              One engine, many lanes
            </h2>
            <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Multi-brand content control
            </p>
            <p className="mt-4 text-lg text-white/55">
              Run distinct growth campaigns from a single disciplined system—same rigor, different voices.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {brands.map(({ name, detail }) => (
              <div
                key={name}
                className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-6 transition hover:border-white/[0.15]"
              >
                <p className="font-semibold text-white">{name}</p>
                <p className="mt-2 text-sm text-white/50">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Demo CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-fuchsia-950/50 via-[#0c0a14] to-blue-950/50 px-6 py-12 sm:px-10 sm:py-14">
          <div
            className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-200/90">Demo ready</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              An internal autonomous growth engine—in motion
            </h2>
            <p className="mt-4 max-w-2xl text-white/60">
              Built for how we operate today, with a credible path to productized SaaS tomorrow.
            </p>
            <ul className="mt-8 grid gap-3 text-sm text-white/75 sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-emerald-400">✓</span>
                Daily content generation across brands
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-emerald-400">✓</span>
                Lead generation and conversion-aware tone
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-emerald-400">✓</span>
                Performance tracking and viral scoring
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-emerald-400">✓</span>
                Learning what goes viral—and doubling down
              </li>
              <li className="flex items-start gap-2 sm:col-span-2">
                <span className="mt-1 text-emerald-400">✓</span>
                Roadmap toward automation and assisted posting
              </li>
            </ul>
            <div className="mt-10">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.1]"
              >
                Enter the dashboard
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] pt-10 text-center text-xs text-white/35">
          <p>
            <Link
              href="/"
              className="text-fuchsia-300/90 underline-offset-4 transition hover:text-white hover:underline"
            >
              BeFamous home
            </Link>
            <span className="text-white/25"> · </span>
            internal growth engine · confidential partner preview
          </p>
        </footer>
      </main>
    </div>
  );
}
