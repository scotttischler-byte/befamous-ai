import Link from "next/link";
import { IconArrowRight, IconChart, IconSparkles, IconZap } from "@/components/landing/landing-icons";
import { IntakeForm } from "@/components/intake/intake-form";

type FirmFunnelPageProps = {
  firmSlug: string;
  firmName: string;
  heroTitle: string;
  heroSubtitle: string;
  audience: string;
  valuePoints: string[];
  proofPoints: string[];
};

export function FirmFunnelPage({
  firmSlug,
  firmName,
  heroTitle,
  heroSubtitle,
  audience,
  valuePoints,
  proofPoints,
}: FirmFunnelPageProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050508] px-6 py-14 text-white sm:px-8 lg:px-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_95%_65%_at_50%_-20%,rgba(109,40,217,0.3),transparent_52%),radial-gradient(ellipse_70%_40%_at_100%_40%,rgba(37,99,235,0.16),transparent),radial-gradient(ellipse_55%_35%_at_0%_80%,rgba(236,72,153,0.15),transparent)]"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:gap-12">
        <section className="space-y-8 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-100">
              Intake
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Internal Funnel Route</p>
          </div>

          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{heroTitle}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-blue-100/60 sm:text-lg">{heroSubtitle}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Ideal audience</p>
            <p className="mt-3 text-sm text-white/85">{audience}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200">
                <IconSparkles className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold">What this funnel does</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {valuePoints.map((item) => (
                  <li key={item} className="leading-relaxed">• {item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-500/10 text-blue-200">
                <IconChart className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold">Performance signals</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {proofPoints.map((item) => (
                  <li key={item} className="leading-relaxed">• {item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/" className="inline-flex items-center gap-2 text-blue-300 transition hover:text-blue-200">
              Back to home
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-fuchsia-300 transition hover:text-fuchsia-200">
              Open dashboard
              <IconZap className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="lg:col-span-5">
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:p-7">
            <h2 className="text-lg font-semibold tracking-tight">Start intake</h2>
            <p className="mt-2 text-sm text-blue-100/55">
              Complete the form below to send a secure inquiry. A specialist will follow up if your situation
              qualifies.
            </p>
            <div className="mt-6">
              <IntakeForm firmSlug={firmSlug} firmName={firmName} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
