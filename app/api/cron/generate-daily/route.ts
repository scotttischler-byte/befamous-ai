import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { listBrands } from "@/lib/brands-repo";
import { generateDailyAndPersist } from "@/lib/content-engine";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";

export async function GET(req: NextRequest) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const filter = process.env.BGE_CRON_BRAND_IDS?.split(",").map((s) => s.trim()).filter(Boolean);
  const brands = await listBrands();
  const targets = filter?.length
    ? brands.filter((b) => filter.includes(b.id))
    : brands;

  const leadMode = process.env.BGE_CRON_LEAD_MODE === "true";

  const results: { brand_id: string; ok: boolean; error?: string; inserted?: number }[] = [];
  for (const b of targets) {
    try {
      const r = await generateDailyAndPersist(b, leadMode);
      results.push({ brand_id: b.id, ok: true, inserted: r.inserted });
    } catch (e) {
      const message = e instanceof Error ? e.message : "fail";
      results.push({ brand_id: b.id, ok: false, error: message });
    }
  }

  logApi("cron:generate-daily", { ran: results.length, leadMode });
  return NextResponse.json({ ok: true, results });
}
