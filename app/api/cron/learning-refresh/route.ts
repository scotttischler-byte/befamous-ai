import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { listBrands } from "@/lib/brands-repo";
import { refreshLearningForBrand } from "@/lib/learning-pipeline";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";

export async function GET(req: NextRequest) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const brands = await listBrands();
  for (const b of brands) {
    await refreshLearningForBrand(b.id);
  }
  logApi("cron:learning-refresh", { brands: brands.length });
  return NextResponse.json({ ok: true, refreshed: brands.length });
}
