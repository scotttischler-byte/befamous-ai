import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";

/**
 * Placeholder cron — wire TikTok / IG analytics APIs here.
 * For now returns a heartbeat so schedules stay valid.
 */
export async function GET(req: NextRequest) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    mode: "manual_placeholder",
    message:
      "Metrics are ingested via POST /api/metrics/ingest until platform APIs are connected.",
  });
}
