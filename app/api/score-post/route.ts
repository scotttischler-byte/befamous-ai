import { NextResponse } from "next/server";
import { z } from "zod";
import { recordMetricsAndScore } from "@/lib/score-single-post";
import { logApi } from "@/lib/log";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

const BodySchema = z.object({
  post_id: z.string().uuid(),
  views: z.number().int().min(0),
  likes: z.number().int().min(0),
  comments: z.number().int().min(0),
  shares: z.number().int().min(0),
  saves: z.number().int().min(0),
  followers_gained: z.number().int().min(0),
  leads_generated: z.number().int().min(0).optional().default(0),
  posted_at: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const input = BodySchema.parse(await req.json());
    logApi("score-post", { post_id: input.post_id });

    const result = await recordMetricsAndScore({
      post_id: input.post_id,
      views: input.views,
      likes: input.likes,
      comments: input.comments,
      shares: input.shares,
      saves: input.saves,
      followers_gained: input.followers_gained,
      leads_generated: input.leads_generated,
      posted_at: input.posted_at,
    });

    return NextResponse.json({
      ok: true,
      scores: result.scores,
      metric_id: result.metric.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Scoring failed";
    logApi("score-post:error", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
