import { NextResponse } from "next/server";
import { recalculateAllScores } from "@/lib/score-jobs";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const result = await recalculateAllScores();
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Scoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
