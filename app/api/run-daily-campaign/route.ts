import { NextResponse } from "next/server";
import { z } from "zod";
import { executeRunDailyCampaign } from "@/lib/run-daily-campaign";
import { logApi } from "@/lib/log";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Platform } from "@/lib/types";

const BodySchema = z.object({
  brand_id: z.string().uuid(),
  platform: z.enum(["instagram", "tiktok", "youtube_shorts"]).optional(),
  offer: z.string().max(800).optional(),
  audience: z.string().max(800).optional(),
  tone: z.string().max(400).optional(),
  goal: z.string().max(400).optional(),
});

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = BodySchema.parse(await req.json());
    logApi("run-daily-campaign", { brand_id: body.brand_id });

    const result = await executeRunDailyCampaign({
      brandId: body.brand_id,
      platform: body.platform as Platform | undefined,
      offer: body.offer,
      audience: body.audience,
      tone: body.tone,
      goal: body.goal,
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Campaign failed";
    logApi("run-daily-campaign:error", { message });
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
