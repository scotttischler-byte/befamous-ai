import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { getWinningPatterns } from "@/lib/insights-service";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

/** Recompute learning snapshot (for future edge cache / workers). */
export async function GET(req: NextRequest) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, refreshed: false, reason: "no_supabase" });
  }
  try {
    const patterns = await getWinningPatterns();
    return NextResponse.json({
      ok: true,
      refreshed: true,
      pattern_count: patterns.common_hook_patterns.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Refresh failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
