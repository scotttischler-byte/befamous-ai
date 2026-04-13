import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateBatchContent,
  persistContentDrafts,
} from "@/lib/content-engine";
import { getBrand } from "@/lib/brands-repo";
import { logApi } from "@/lib/log";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

const BodySchema = z.object({
  brand_id: z.string().uuid(),
  count: z.number().int().min(1).max(25).optional().default(10),
  generate_for_leads: z.boolean().optional().default(false),
  persist: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const input = BodySchema.parse(await req.json());
    logApi("generate-content", input);

    const brand = await getBrand(input.brand_id);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const drafts = await generateBatchContent(brand, input.count, {
      generateForLeads: input.generate_for_leads,
    });

    let saved: { inserted: number; ids: string[] } | null = null;
    if (input.persist) {
      saved = await persistContentDrafts(
        brand,
        drafts,
        input.generate_for_leads
      );
    }

    return NextResponse.json({ drafts, saved });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    logApi("generate-content:error", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
