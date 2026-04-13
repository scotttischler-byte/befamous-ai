import { NextResponse } from "next/server";
import { z } from "zod";
import { buildAdHocBrand } from "@/lib/adhoc-brand";
import { generateCampaignPackage } from "@/lib/campaign-engine";
import { persistCampaignPackage } from "@/lib/campaign-persist";
import { getBrand } from "@/lib/brands-repo";
import { logApi } from "@/lib/log";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import type { BrandRow, Platform } from "@/lib/types";

const BodySchema = z
  .object({
    brand_id: z.string().uuid().optional(),
    niche: z.string().min(1).max(500).optional(),
    offer: z.string().min(1).max(800),
    audience: z.string().min(1).max(800),
    tone: z.string().min(1).max(400),
    goal: z.string().min(1).max(400),
    platform: z.enum(["instagram", "tiktok", "youtube_shorts"]),
    persist: z.boolean().optional().default(false),
  })
  .refine((d) => d.brand_id || d.niche, {
    message: "Provide brand_id or niche",
  })
  .refine((d) => !d.persist || !!d.brand_id, {
    message: "persist=true requires a real brand_id",
  });

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = BodySchema.parse(json);
    logApi("generate-content", {
      brand_id: input.brand_id,
      persist: input.persist,
      platform: input.platform,
    });

    let brand: BrandRow;
    if (input.brand_id) {
      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          { error: "Supabase required when using brand_id" },
          { status: 503 }
        );
      }
      const row = await getBrand(input.brand_id);
      if (!row) {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 });
      }
      brand = {
        ...row,
        offer: input.offer,
        audience: input.audience,
        tone: input.tone,
        primary_goal: input.goal,
      };
    } else {
      brand = buildAdHocBrand({
        niche: input.niche!,
        offer: input.offer,
        audience: input.audience,
        tone: input.tone,
        goal: input.goal,
      });
    }

    const pack = await generateCampaignPackage({
      brand,
      platform: input.platform as Platform,
      offer: input.offer,
      audience: input.audience,
      tone: input.tone,
      goal: input.goal,
    });

    let saved: { batch_id: string; inserted: number } | null = null;
    if (input.persist && input.brand_id) {
      saved = await persistCampaignPackage(input.brand_id, pack);
    }

    return NextResponse.json({ package: pack, saved });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    logApi("generate-content:error", { message });
    const status =
      message.toLowerCase().includes("invalid") ||
      message.includes("Provide ") ||
      message.includes("requires")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
