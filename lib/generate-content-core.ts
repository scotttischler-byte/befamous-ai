import { z } from "zod";
import { formatPatternsForPrompt, getWinningPatterns } from "@/lib/insights-service";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getOpenAI } from "@/lib/openai-client";

const OutputSchema = z.object({
  hooks: z.array(z.string()).length(10),
  scripts: z.array(z.string()).length(5),
  captions: z.array(z.string()).min(2).max(10),
  hashtags: z.array(z.string()).min(5).max(35),
});

export type GeneratedContent = z.infer<typeof OutputSchema>;

export async function generateViralContent(input: {
  niche: string;
  goal: string;
  tone: string;
}): Promise<GeneratedContent> {
  let learningBlock =
    "No database patterns yet — maximize pattern interrupts and ruthless hook strength.";
  if (isSupabaseConfigured()) {
    try {
      const patterns = await getWinningPatterns();
      learningBlock = formatPatternsForPrompt(patterns);
    } catch {
      learningBlock =
        "Could not load learning insights; still prioritize aggressive hooks.";
    }
  }

  const openai = getOpenAI();
  const userPayload = JSON.stringify(input);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.85,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are the BeFamous Growth Engine (BGE) head writer for short-form viral video (TikTok, Reels, YouTube Shorts).

Rules:
- Pattern interrupts first line always.
- Hooks must feel aggressive, specific, and scroll-stopping — zero fluff.
- Scripts: spoken-word, tight pacing, strong open + payoff + optional CTA.
- Captions: platform-native, concise; include line breaks where useful.
- Hashtags: mix broad + niche; no spammy repetition.

${learningBlock}

Return ONLY valid JSON with keys:
- "hooks": string[10]
- "scripts": string[5]
- "captions": string array (2-10 items)
- "hashtags": string array (5-35 items; use "#tag" format)`,
      },
      {
        role: "user",
        content: `Generate content pack for: ${userPayload}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty OpenAI response");

  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const rawTags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];
  const hashtags = rawTags.map((h) => {
    const s = String(h).trim();
    return s.startsWith("#") ? s : `#${s}`;
  });
  const normalized = { ...parsed, hashtags };
  return OutputSchema.parse(normalized);
}
