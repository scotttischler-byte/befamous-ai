import Link from "next/link";
import { cookies } from "next/headers";
import { ACTIVE_BRAND_COOKIE } from "@/lib/cookies-brand";
import { listBrands } from "@/lib/brands-repo";
import { loadDashboardSnapshot } from "@/lib/dashboard-load";
import { getEnvDashboardStatus } from "@/lib/env-check";
import type { BrandRow } from "@/lib/types";
import { DashboardClient } from "./dashboard-client";
import { MvaTestPanel } from "./mva-test-panel";

export const dynamic = "force-dynamic";

function EnvSetupPanel({
  status,
}: {
  status: ReturnType<typeof getEnvDashboardStatus>;
}) {
  const rows: { label: string; items: string[] }[] = [];
  if (!status.supabase.ready) {
    rows.push({
      label: "Supabase (server)",
      items: status.supabase.labels,
    });
  }
  if (!status.openai.ready) {
    rows.push({ label: "OpenAI", items: status.openai.labels });
  }
  if (!status.anon.ready) {
    rows.push({
      label: "Supabase anon (browser client only)",
      items: status.anon.labels,
    });
  }

  if (rows.length === 0) return null;

  return (
    <div
      className="mb-8 rounded-xl border border-amber-400 bg-amber-50 p-5 text-sm dark:border-amber-700 dark:bg-amber-950/50"
      role="alert"
    >
      <h2 className="text-base font-semibold text-amber-950 dark:text-amber-100">
        Missing environment variables
      </h2>
      <p className="mt-2 text-amber-900/90 dark:text-amber-200/90">
        Copy <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900/80">env.example</code>{" "}
        to <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900/80">.env.local</code>{" "}
        and replace placeholders with real values.
      </p>
      <ul className="mt-4 space-y-4">
        {rows.map((block) => (
          <li key={block.label}>
            <p className="font-medium text-amber-950 dark:text-amber-100">{block.label}</p>
            <ul className="mt-1 list-inside list-disc text-amber-900 dark:text-amber-200">
              {block.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function DashboardPage() {
  const envStatus = getEnvDashboardStatus();

  let brands: BrandRow[] = [];
  let brandsError: string | null = null;
  if (envStatus.supabase.ready) {
    try {
      brands = await listBrands();
    } catch (e) {
      brandsError = e instanceof Error ? e.message : "Could not load brands";
    }
  }

  const cookieStore = await cookies();
  let activeBrandId = cookieStore.get(ACTIVE_BRAND_COOKIE)?.value ?? null;
  if (!activeBrandId && brands[0]) {
    activeBrandId = brands[0].id;
  }

  const brandIds = new Set(brands.map((b) => b.id));
  if (activeBrandId && !brandIds.has(activeBrandId)) {
    activeBrandId = brands[0]?.id ?? null;
  }

  let snapshot = null;
  let snapshotError: string | null = null;
  if (activeBrandId && envStatus.supabase.ready && !brandsError) {
    try {
      snapshot = await loadDashboardSnapshot(activeBrandId);
    } catch (e) {
      snapshotError =
        e instanceof Error ? e.message : "Could not load dashboard data";
    }
  }

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
        <MvaTestPanel />
        <EnvSetupPanel status={envStatus} />

        {brandsError && (
          <div
            className="mb-8 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
            role="alert"
          >
            <strong className="font-semibold">Database</strong>
            <p className="mt-1">{brandsError}</p>
            <p className="mt-2 text-red-800/90 dark:text-red-200/90">
              Check the project URL and service role key, run{" "}
              <code className="font-mono">supabase/schema.sql</code>, and confirm the network can reach Supabase.
            </p>
          </div>
        )}

        {snapshotError && (
          <div
            className="mb-8 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
            role="alert"
          >
            <strong className="font-semibold">Dashboard data</strong>
            <p className="mt-1">{snapshotError}</p>
          </div>
        )}

        <DashboardClient
          brands={brands}
          activeBrandId={activeBrandId}
          snapshot={snapshot}
          envStatus={envStatus}
          brandsError={brandsError}
        />
      </div>
    </div>
  );
}
