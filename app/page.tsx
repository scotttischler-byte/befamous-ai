import Link from "next/link";
import { IconArrowRight, IconChart, IconLayers, IconZap } from "@/components/landing/landing-icons";

const steps = [
  {
    n: "01",
    title: "Align the brand & angle",
    copy: "Choose the campaign, voice, and hook lane you want to test—hooks, captions, and CTAs stay on-message.",
  },
  {
    n: "02",
    title: "Generate in seconds",
    copy: "BeFamous drafts hooks, captions, CTAs, and content angles tuned for short-form—ready to review, not rewrite from scratch.",
  },
  {
    n: "03",
    title: "Post daily & learn",
    copy: "Log what lands, watch the loop surface winners, and make tomorrow’s batch sharper than today’s—without extra tooling.",
  },
] as const;

const pillars = [
  {
    title: "Generate content faster",
    body: "Move from blank page to scroll-stopping drafts in minutes—so your team ships consistently, not sporadically.",
    Icon: IconZap,
  },
  {
    title: "Learn what goes viral",
    body: "Performance feeds a learning loop that highlights stronger hooks and angles over time—test fast, double down on what works.",
    Icon: IconChart,
  },
  {
    title: "Scale multiple brands",
    body: "Run separate campaigns and voices from one disciplined engine—built for operators juggling more than one growth lane.",
    Icon: IconLayers,
  },
] as const;

const lanes = [
  { name: "BeFamous", tag: "Flagship · creator-first" },
  { name: "Authority & consult", tag: "Legal · professional services" },
  { name: "Culture & drops", tag: "Sports · jewelry · hype" },
  { name: "Founder & personal", tag: "Deal flow · fitness · POV" },
] as const;

export default function MarketingHome() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#08080c] text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,rgba(147,51,234,0.28),transparent_50%),radial-gradient(ellipse_50%_45%_at_100%_20%,rgba(59,130,246,0.18),transparent),radial-gradient(ellipse_45%_40%_at_0%_60%,rgba(236,72,153,0.2),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,#0c0c12_0%,#08080c_45%,#060609_100%)]"
        aria-hidden
      />

      <main className="relative mx-auto flex max-w-5xl flex-col gap-20 px-4 pb-24 pt-16 sm:gap-24 sm:px-6 sm:pt-20 lg:gap-28 lg:px-8 lg:pt-24">
        {/* Hero */}
        <section className="text-center lg:text-left">
          <div className="mx-auto inline-flex max-w-3xl flex-col items-center lg:mx-0 lg:items-start">
            <p className="rounded-full border border-pink-500/25 bg-gradient-to-r from-pink-500/10 via-fuchsia-500/10 to-blue-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-pink-200/90 shadow-[0_0_40px_rgba(236,72,153,0.15)] sm:text-xs">
              AI-powered viral content engine
            </p>
            <h1 className="mt-7 text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.35rem]">
              <span className="bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-transparent">
                BeFamous turns ideas into
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                posts that perform.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">
              Generate hooks, captions, CTAs, and angles across brands—then learn what resonates so daily posting
              gets easier, smarter, and more consistent.
            </p>
            <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center lg:justify-start">
              <Link
                href="/app"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_14px_44px_-10px_rgba(139,92,246,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:brightness-110 hover:shadow-[0_18px_50px_-8px_rgba(236,72,153,0.4)]"
              >
                Open Internal Engine
                <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.04] px-8 py-4 text-sm font-medium text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-sm transition hover:border-pink-400/35 hover:bg-white/[0.07]"
              >
                See how it works
              </a>
            </div>
            <p className="mt-8 text-xs text-white/38">
              Built for internal teams first—sharp, fast, and operator-grade.
            </p>
          </div>
        </section>

        {/* How it works — 3 steps */}
        <section id="how-it-works" className="scroll-mt-24">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300/85">How it works</h2>
            <p className="mx-auto mt-3 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Three moves. One growth rhythm.
            </p>
          </div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-3">
            {steps.map(({ n, title, copy }) => (
              <li
                key={n}
                className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-6 text-left shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
              >
                <span className="font-mono text-xs font-medium text-fuchsia-400/90">{n}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/52">{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Pillars */}
        <section aria-labelledby="pillars-heading">
          <div className="text-center">
            <h2 id="pillars-heading" className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/85">
              Why operators use BeFamous
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Speed, signal, and scale—without the chaos
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {pillars.map(({ title, body, Icon }) => (
              <article
                key={title}
                className="flex flex-col rounded-2xl border border-white/[0.07] bg-[#0e0e14]/80 p-6 backdrop-blur-sm transition hover:border-pink-500/25 hover:shadow-[0_0_48px_-12px_rgba(236,72,153,0.18)]"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/25 to-pink-500/15 text-pink-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/52">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Performance loop */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-950/35 via-[#0a0a10] to-blue-950/35 px-6 py-12 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" aria-hidden />
          <div className="relative max-w-2xl">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300/90">Performance loop</h2>
            <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Built to learn what performs—like machine learning for your feed
            </p>
            <p className="mt-5 text-base leading-relaxed text-white/58 sm:text-lg">
              The system tracks outcomes, surfaces stronger hooks and angles over time, and turns results into
              clearer next steps—so you test ideas quickly, learn continuously, and move toward “what should we post
              next?” with confidence.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/68">
              <li className="flex gap-2">
                <span className="text-pink-400">●</span>
                Spots patterns from real performance—not vibes
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">●</span>
                Improves messaging as you log and iterate
              </li>
              <li className="flex gap-2">
                <span className="text-fuchsia-400">●</span>
                Supports multiple brands and campaigns in one stack
              </li>
            </ul>
          </div>
        </section>

        {/* Multi-brand */}
        <section>
          <div className="text-center sm:text-left">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-300/85">Multi-brand growth</h2>
            <p className="mx-auto mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:mx-0 sm:text-3xl">
              One engine. Every lane you run.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-white/55 sm:mx-0">
              From flagship to niche—run parallel growth stories without parallel chaos.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {lanes.map(({ name, tag }) => (
              <div
                key={name}
                className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition hover:border-white/[0.14]"
              >
                <p className="font-semibold text-white">{name}</p>
                <p className="mt-1.5 text-sm text-white/45">{tag}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-pink-950/40 via-[#0d0a12] to-blue-950/45 px-6 py-12 text-center sm:px-10 sm:py-14 sm:text-left">
          <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-pink-500/25 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-2xl sm:mx-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-200/90">Ready when you are</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Step into the internal engine
            </h2>
            <p className="mt-4 text-white/58">
              Explore the full BeFamous experience—deep dive, mode switch, and operator dashboard from one place.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:justify-start">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-8px_rgba(59,130,246,0.45)] transition hover:brightness-110"
              >
                Open Internal Engine
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/[0.05] px-8 py-3.5 text-sm font-semibold text-white/95 transition hover:bg-white/[0.09]"
              >
                Operator dashboard
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] pt-10 text-center text-xs text-white/32">
          <p>BeFamous · autonomous growth · internal use</p>
        </footer>
      </main>
    </div>
  );
}
