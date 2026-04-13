import Link from "next/link";
import { cookies } from "next/headers";
import { ACTIVE_BRAND_COOKIE } from "@/lib/cookies-brand";
import { listBrands } from "@/lib/brands-repo";
import { loadDashboardSnapshot } from "@/lib/dashboard-load";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Operator dashboard</h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Configure{" "}
          <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          (see <code className="font-mono">env.example</code>), apply{" "}
          <code className="font-mono">supabase/schema.sql</code>, then reload.
        </p>
        <Link href="/" className="mt-6 inline-block text-blue-600 underline">
          ← Home
        </Link>
      </div>
    );
  }

  const brands = await listBrands();
  const cookieStore = await cookies();
  let activeBrandId = cookieStore.get(ACTIVE_BRAND_COOKIE)?.value ?? null;
  if (!activeBrandId && brands[0]) {
    activeBrandId = brands[0].id;
  }

  const snapshot = activeBrandId
    ? await loadDashboardSnapshot(activeBrandId)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            BeFamous · internal
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Daily growth cockpit
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
            Run campaigns, ship drafts, log performance, and let the learning loop
            steer the next batch.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          Home
        </Link>
      </header>

      <div className="mt-10">
        <DashboardClient
          brands={brands}
          activeBrandId={activeBrandId}
          snapshot={snapshot}
        />
      </div>
    </div>
  );
}
