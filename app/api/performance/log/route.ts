import { NextResponse } from "next/server";
import { z } from "zod";
import { logApi } from "@/lib/log";
import { recordPerformanceLog } from "@/lib/record-performance-log";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

const BodySchema = z.object({
  post_id: z.string().uuid(),
  views: z.number().int().min(0),
  likes: z.number().int().min(0),
  comments: z.number().int().min(0),
  shares: z.number().int().min(0),
  conversion_estimate: z.number().min(0).default(0),
});

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const input = BodySchema.parse(await req.json());
    logApi("performance:log", { post_id: input.post_id });
    const { score } = await recordPerformanceLog(input);
    return NextResponse.json({ ok: true, score });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    logApi("performance:log:error", { message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
