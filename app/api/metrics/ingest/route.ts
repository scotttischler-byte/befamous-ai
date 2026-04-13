import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

const BodySchema = z.object({
  post_id: z.string().uuid(),
  views: z.number().int().min(0).optional().default(0),
  likes: z.number().int().min(0).optional().default(0),
  comments: z.number().int().min(0).optional().default(0),
  shares: z.number().int().min(0).optional().default(0),
  saves: z.number().int().min(0).optional().default(0),
  followers_gained: z.number().int().min(0).optional().default(0),
});

/** Manual metrics row (Phase 7 — replace with platform APIs later). */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = BodySchema.parse(await req.json());
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("post_metrics")
      .insert({
        post_id: body.post_id,
        views: body.views,
        likes: body.likes,
        comments: body.comments,
        shares: body.shares,
        saves: body.saves,
        followers_gained: body.followers_gained,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ metric: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid body";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
