import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";

/**
 * Reserved for TikTok / Meta / YouTube analytics pulls.
 * Today: metrics enter via dashboard / POST /api/score-post (manual snapshot).
 */
export async function GET(req: NextRequest) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    mode: "manual_until_platform_apis",
    hint: "Use dashboard metrics form or POST /api/score-post per post.",
  });
}
