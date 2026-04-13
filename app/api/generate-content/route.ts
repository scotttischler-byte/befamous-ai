import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateBatchContent,
  persistContentDrafts,
} from "@/lib/content-engine";
import { syntheticBrandRow } from "@/lib/brands";
import { getBrand } from "@/lib/brands-repo";
import { logApi } from "@/lib/log";
import type { BrandTag } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

const BodySchema = z
  .object({
    brand_id: z.string().uuid().optional(),
    brand_tag: z
      .enum([
        "MVA",
        "LAW_FIRM",
        "FITNESS",
        "NBA_DOG_TAGS",
        "GAMEDAY_RINGS",
        "PERSONAL_BRAND",
      ])
      .optional(),
    count: z.number().int().min(1).max(25).optional().default(10),
    generate_for_leads: z.boolean().optional().default(false),
    persist: z.boolean().optional().default(false),
  })
  .refine((d) => d.brand_id || d.brand_tag, {
    message: "brand_id or brand_tag required",
  });

export async function POST(req: Request) {
  try {
    const input = BodySchema.parse(await req.json());
    logApi("generate-content", input);

    let brand;
    if (input.brand_id) {
      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          { error: "Supabase not configured (needed for brand_id)" },
          { status: 503 }
        );
      }
      const row = await getBrand(input.brand_id);
      if (!row) {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 });
      }
      brand = row;
    } else {
      brand = syntheticBrandRow(input.brand_tag as BrandTag);
    }

    const drafts = await generateBatchContent(brand, input.count, {
      generateForLeads: input.generate_for_leads,
    });

    let saved: { inserted: number; ids: string[] } | null = null;
    if (input.persist) {
      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          { error: "Supabase not configured (cannot persist)" },
          { status: 503 }
        );
      }
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
