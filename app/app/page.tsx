import Link from "next/link";

export default function AppEntryPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050508] text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(88,28,135,0.35),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_40%,rgba(59,130,246,0.12),transparent)]"
        aria-hidden
      />
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">BeFamous App</h1>
        <p className="mt-4 text-base text-white/55">Internal growth engine dashboard</p>
        <Link
          href="/"
          className="mt-12 text-sm text-white/40 underline-offset-4 transition hover:text-white/70 hover:underline"
        >
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
