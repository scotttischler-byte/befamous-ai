import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { listBrands } from "@/lib/brands-repo";
import {
  generateAndPersistMvaDaily,
  generateDailyAndPersist,
} from "@/lib/content-engine";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";

/**
 * Autonomous daily generation:
 * - Always: persist 10 new MVA ads (hook, script, caption, cta, visual_plan, hashtags → posts).
 * - Optional BGE_CRON_ALL_BRANDS=true: also run legacy daily batch for every other brand.
 */
export async function GET(req: NextRequest) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const leadMode = process.env.BGE_CRON_LEAD_MODE === "true";
  const allBrands = process.env.BGE_CRON_ALL_BRANDS === "true";

  const out: {
    mva: { ok: boolean; inserted?: number; error?: string };
    other_brands?: { brand_id: string; ok: boolean; error?: string; inserted?: number }[];
  } = { mva: { ok: false } };

  try {
    const mvaR = await generateAndPersistMvaDaily(leadMode);
    out.mva = { ok: true, inserted: mvaR.inserted };
  } catch (e) {
    out.mva = {
      ok: false,
      error: e instanceof Error ? e.message : "MVA daily failed",
    };
  }

  if (allBrands) {
    const filter = process.env.BGE_CRON_BRAND_IDS?.split(",").map((s) => s.trim()).filter(Boolean);
    const brands = await listBrands();
    const targets = (filter?.length ? brands.filter((b) => filter.includes(b.id)) : brands).filter(
      (b) => b.brand_tag !== "MVA"
    );
    const results: { brand_id: string; ok: boolean; error?: string; inserted?: number }[] = [];
    for (const b of targets) {
      try {
        const r = await generateDailyAndPersist(b, leadMode);
        results.push({ brand_id: b.id, ok: true, inserted: r.inserted });
      } catch (e) {
        results.push({
          brand_id: b.id,
          ok: false,
          error: e instanceof Error ? e.message : "fail",
        });
      }
    }
    out.other_brands = results;
  }

  logApi("cron:generate-daily", {
    mva_ok: out.mva.ok,
    mva_inserted: out.mva.inserted,
    allBrands,
    leadMode,
  });

  return NextResponse.json({ ok: true, ...out });
}
