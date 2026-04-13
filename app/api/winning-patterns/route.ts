import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const brandId = new URL(req.url).searchParams.get("brand_id");
  if (!brandId) {
    return NextResponse.json({ error: "brand_id required" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("winning_patterns")
    .select("*")
    .eq("brand_id", brandId)
    .order("avg_score", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ patterns: data });
}
