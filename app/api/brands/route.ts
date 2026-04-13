import { NextResponse } from "next/server";
import { listBrands } from "@/lib/brands-repo";
import { logApi } from "@/lib/log";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const brands = await listBrands();
    logApi("brands:list", { count: brands.length });
    return NextResponse.json({ brands });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list brands";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
