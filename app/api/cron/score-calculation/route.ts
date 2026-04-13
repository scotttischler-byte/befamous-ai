import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { recalculateAllScores } from "@/lib/score-jobs";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const result = await recalculateAllScores();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cron failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
