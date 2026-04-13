import { generateViralContent } from "@/lib/generate-content-core";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Platform } from "@/lib/types";

const DEFAULT_NICHE = process.env.BGE_DEFAULT_NICHE ?? "personal growth";
const DEFAULT_GOAL = process.env.BGE_DEFAULT_GOAL ?? "grow followers and saves";
const DEFAULT_TONE = process.env.BGE_DEFAULT_TONE ?? "bold, direct, witty";
const DEFAULT_PLATFORM = (process.env.BGE_DEFAULT_PLATFORM ??
  "tiktok") as Platform;

export async function runDailyContentJob(): Promise<{ created: number }> {
  const pack = await generateViralContent({
    niche: DEFAULT_NICHE,
    goal: DEFAULT_GOAL,
    tone: DEFAULT_TONE,
  });

  const supabase = getSupabaseAdmin();
  let created = 0;

  for (const hook of pack.hooks.slice(0, 5)) {
    const script =
      pack.scripts[created % pack.scripts.length] ?? pack.scripts[0] ?? "";
    const { error } = await supabase.from("posts").insert({
      hook,
      content_text: script,
      platform: DEFAULT_PLATFORM,
      status: "draft",
    });
    if (error) throw error;
    created++;
  }

  return { created };
}
