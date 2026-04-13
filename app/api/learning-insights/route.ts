import { NextResponse } from "next/server";
import { analyzeWinningPatterns } from "@/lib/learning-engine";
import { fetchTopPostsForLearning } from "@/lib/insights-service";
import { tryPythonWinningPatterns } from "@/lib/python-bridge";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        winning_patterns: analyzeWinningPatterns([]),
        ml_engine: "none",
        note: "Configure Supabase env vars to load real insights.",
      },
      { status: 200 }
    );
  }

  try {
    const posts = await fetchTopPostsForLearning(0.2);
    const tsPatterns = analyzeWinningPatterns(posts);
    const pyPatterns = tryPythonWinningPatterns(posts);

    return NextResponse.json({
      winning_patterns: pyPatterns ?? tsPatterns,
      typescript_patterns: tsPatterns,
      python_patterns: pyPatterns,
      ml_engine: pyPatterns ? "python+typescript" : "typescript",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Insights failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
