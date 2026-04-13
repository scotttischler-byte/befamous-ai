import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { listBrands } from "@/lib/brands-repo";
import { executeRunDailyCampaign } from "@/lib/run-daily-campaign";
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

  const results: { brand_id: string; ok: boolean; error?: string }[] = [];
  for (const b of targets) {
    try {
      await executeRunDailyCampaign({ brandId: b.id });
      results.push({ brand_id: b.id, ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "fail";
      results.push({ brand_id: b.id, ok: false, error: message });
    }
  }

  logApi("cron:daily-content", { ran: results.length });
  return NextResponse.json({ ok: true, results });
}
