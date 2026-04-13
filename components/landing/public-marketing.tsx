import Link from "next/link";
import {
  IconArrowRight,
  IconChart,
  IconSparkles,
  IconZap,
} from "@/components/landing/landing-icons";

const BOOK_DEMO_HREF =
  "mailto:hello@befamous.ai?subject=Book%20a%20BeFamous%20demo&body=Hi%20%E2%80%94%20we%E2%80%99d%20love%20to%20see%20a%20walkthrough.";

function IconTemplate({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 12h6M9 16h6M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFunnel({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5h16l-6 6v8l-4 2v-10L4 5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9.5 2v2M14.5 2v2M7 8h10a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2v-9a2 2 0 012-2zM7 12h.01M17 12h.01M10 16h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const capabilities = [
  {
    title: "AI content generation",
    body: "Draft hooks, captions, and platform-ready variants in your brand voice—built for speed and consistency.",
    Icon: IconSparkles,
  },
  {
    title: "Viral hooks",
    body: "Test angles that grab attention in the first second—iterate until the feed rewards you.",
    Icon: IconZap,
  },
  {
    title: "Templates & guardrails",
    body: "Reusable structures so every post stays on-message while still feeling fresh.",
    Icon: IconTemplate,
  },
  {
    title: "Lead generation",
    body: "Conversion-aware CTAs and urgency modes when you need consults, applications, or orders.",
    Icon: IconFunnel,
  },
  {
    title: "Performance tracking",
    body: "Score what lands, compare batches, and feed the loop that steers the next wave of content.",
    Icon: IconChart,
  },
  {
    title: "Automation",
    body: "Hands-free posting and assisted scheduling are on the roadmap—built for scale without losing control.",
    Icon: IconBot,
    badge: "Coming soon",
  },
];

export function PublicMarketing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050508] text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-25%,rgba(147,51,234,0.32),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_30%,rgba(59,130,246,0.16),transparent),radial-gradient(ellipse_55%_45%_at_0%_70%,rgba(236,72,153,0.16),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,5,8,0)_0%,#050508_50%,#050508_100%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#050508]/75 backdrop-blur-xl">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-white sm:text-lg"
          >
            <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              BeFamous
            </span>
          </Link>
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={BOOK_DEMO_HREF}
              className="rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.06)] sm:px-4 sm:text-sm"
            >
              Book Demo
            </a>
            <Link
              href="/app"
              className="rounded-xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_28px_-6px_rgba(139,92,246,0.55)] transition duration-200 hover:brightness-110 hover:shadow-[0_0_28px_rgba(168,85,247,0.45)] sm:px-5 sm:text-sm"
            >
              Enter App
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-pink-500/20 bg-gradient-to-r from-pink-500/10 via-fuchsia-500/10 to-blue-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-pink-200/90 sm:text-xs">
              Viral AI · internal growth engine
            </p>
            <h1 className="mt-8 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-br from-white via-white to-white/75 bg-clip-text text-transparent">
                Content that wins the feed.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Built to learn what performs.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              BeFamous is an AI-powered engine for hooks, captions, CTAs, and angles—across brands and
              campaigns—so your team ships daily, tracks what works, and compounds growth without the chaos.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/app"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_14px_44px_-10px_rgba(139,92,246,0.55),inset_0_1px_0_rgba(255,255,255,0.1)] transition duration-200 hover:brightness-110 hover:shadow-[0_14px_44px_-10px_rgba(139,92,246,0.55),inset_0_1px_0_rgba(255,255,255,0.1),0_0_42px_rgba(168,85,247,0.35)]"
              >
                Enter App
                <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href={BOOK_DEMO_HREF}
                className="inline-flex items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.04] px-8 py-4 text-sm font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-200 hover:border-white/25 hover:bg-white/[0.07] hover:shadow-[0_0_28px_rgba(255,255,255,0.07)]"
              >
                Book Demo
              </a>
            </div>
            <p className="mt-8 text-xs text-white/35">
              Partner & investor ready · mobile-first · built for serious growth teams
            </p>
          </div>
        </section>

        {/* Capabilities */}
        <section
          id="capabilities"
          className="scroll-mt-24 border-t border-white/[0.06] bg-black/20 py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300/90">
                Platform capabilities
              </h2>
              <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Everything you need to run a modern content engine
              </p>
              <p className="mt-4 text-base text-white/55 sm:text-lg">
                From ideation to performance—designed for operators who care about velocity and signal.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({ title, body, Icon, badge }) => (
                <article
                  key={title}
                  className="relative flex flex-col rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.9)] transition hover:border-white/[0.12]"
                >
                  {badge !== undefined ? (
                    <span className="absolute right-4 top-4 rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200">
                      {badge}
                    </span>
                  ) : null}
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/25 via-fuchsia-500/15 to-pink-500/10 text-fuchsia-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/52">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Bridge */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-fuchsia-950/40 via-[#0c0a14] to-blue-950/45 px-6 py-12 text-center sm:px-12 sm:py-14 sm:text-left">
            <div
              className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  See the full internal experience
                </h2>
                <p className="mt-3 text-sm text-white/55 sm:text-base">
                  Deep product story, mode preview, and operator paths—then jump into the live dashboard when
                  you’re ready.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_36px_-8px_rgba(59,130,246,0.45)] transition duration-200 hover:brightness-110 hover:shadow-[0_12px_36px_-8px_rgba(59,130,246,0.45),0_0_38px_rgba(168,85,247,0.32)]"
                >
                  Enter App
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/[0.05] px-8 py-3.5 text-sm font-semibold text-white/95 transition duration-200 hover:bg-white/[0.09] hover:shadow-[0_0_24px_rgba(255,255,255,0.06)]"
                >
                  Operator dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="border-t border-white/[0.06] bg-black/30 py-12 sm:py-14"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold text-white">BeFamous</p>
              <p className="mt-2 max-w-sm text-sm text-white/45">
                Autonomous growth engine for teams who treat content like a system—not a side project.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-end">
              <a
                href={BOOK_DEMO_HREF}
                className="text-sm font-medium text-fuchsia-300/90 transition hover:text-white"
              >
                Book a demo
              </a>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-white/35 sm:justify-end">
                <Link href="/app" className="transition hover:text-white/70">
                  App
                </Link>
                <span className="text-white/20">·</span>
                <Link href="/dashboard" className="transition hover:text-white/70">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-10 text-center text-xs text-white/25">
            © {new Date().getFullYear()} BeFamous · Internal & partner preview
          </p>
        </footer>
      </main>
    </div>
  );
}
