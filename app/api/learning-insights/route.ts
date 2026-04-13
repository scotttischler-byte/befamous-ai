import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { payloadFromRow } from "@/lib/learning-format";
import { refreshLearningForBrand } from "@/lib/learning-pipeline";
import { logApi } from "@/lib/log";

const PostSchema = z.object({
  brand_id: z.string().uuid(),
  refresh: z.boolean().optional().default(false),
});

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured", winning_patterns: null },
      { status: 503 }
    );
  }
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brand_id");
  if (!brandId) {
    return NextResponse.json(
      { error: "brand_id query parameter required" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("learning_insights")
    .select("*")
    .eq("brand_id", brandId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      brand_id: brandId,
      winning_patterns: null,
      message: "No insights yet — add scores then POST refresh.",
    });
  }

  return NextResponse.json({
    brand_id: brandId,
    winning_patterns: payloadFromRow(data),
    raw: data,
  });
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = PostSchema.parse(await req.json());
    logApi("learning-insights:post", {
      brand_id: body.brand_id,
      refresh: body.refresh,
    });

    if (body.refresh) {
      await refreshLearningForBrand(body.brand_id);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("learning_insights")
      .select("*")
      .eq("brand_id", body.brand_id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      brand_id: body.brand_id,
      refreshed: body.refresh,
      winning_patterns: data ? payloadFromRow(data) : null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Learning failed";
    logApi("learning-insights:error", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
