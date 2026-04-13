import { type NextRequest } from "next/server";

export function assertCronAuthorized(req: NextRequest): Response | null {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.CRON_STRICT !== "true"
  ) {
    return null;
  }
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("CRON_SECRET not configured", { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
