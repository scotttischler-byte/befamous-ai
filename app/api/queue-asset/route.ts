import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";
import type { AssetType } from "@/lib/types";

const BodySchema = z.object({
  brand_id: z.string().uuid(),
  asset_type: z.enum(["image", "video", "other"]),
  asset_url: z.string().min(1).max(2000),
  asset_name: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const input = BodySchema.parse(await req.json());
    logApi("queue-asset", {
      brand_id: input.brand_id,
      asset_type: input.asset_type,
    });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("queued_assets")
      .insert({
        brand_id: input.brand_id,
        asset_type: input.asset_type as AssetType,
        asset_url: input.asset_url,
        asset_name: input.asset_name,
        status: "queued",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, asset: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Queue failed";
    logApi("queue-asset:error", { message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
