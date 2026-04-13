import { NextResponse } from "next/server";
import { z } from "zod";
import { generateDailyAndPersist, generateAndPersistBatch } from "@/lib/content-engine";
import { getBrand } from "@/lib/brands-repo";
import { logApi } from "@/lib/log";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

const BodySchema = z.object({
  brand_id: z.string().uuid(),
  generate_for_leads: z.boolean().optional().default(false),
  /** If set, overrides default daily size */
  count: z.number().int().min(1).max(25).optional(),
});

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = BodySchema.parse(await req.json());
    logApi("run-daily-campaign", body);

    const brand = await getBrand(body.brand_id);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const result = body.count
      ? await generateAndPersistBatch(
          brand,
          body.count,
          body.generate_for_leads
        )
      : await generateDailyAndPersist(brand, body.generate_for_leads);

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Campaign failed";
    logApi("run-daily-campaign:error", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
