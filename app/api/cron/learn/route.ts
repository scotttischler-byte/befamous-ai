import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { updateWinningPatternsAllBrands } from "@/lib/learning";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";

export async function GET(req: NextRequest) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const summary = await updateWinningPatternsAllBrands();
  logApi("cron:learn", { brands: summary.length });
  return NextResponse.json({ ok: true, summary });
}
