import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { recalculateScoresForAllPosts } from "@/lib/batch-scoring";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";

export async function GET(req: NextRequest) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const result = await recalculateScoresForAllPosts();
    logApi("cron:score-calculation", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cron failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
