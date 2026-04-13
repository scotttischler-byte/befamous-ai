import { z } from "zod";
import { mergeBrandForEngine } from "@/lib/brands";
import { getOpenAI } from "@/lib/openai-client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BrandRow, ContentPostRow, Platform, PlatformVariants } from "@/lib/types";

const PlatformEnum = z.enum(["instagram", "tiktok", "youtube_shorts"]);

const VariantSchema = z.object({
  caption: z.string().optional(),
  hashtags: z.string().optional(),
  hook: z.string().optional(),
  cta: z.string().optional(),
});

const RawDraftSchema = z.object({
  platform: PlatformEnum,
  hook: z.string(),
  caption: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
  content: z.string(),
  platform_variants: z
    .object({
      instagram: VariantSchema.optional(),
      tiktok: VariantSchema.optional(),
      youtube_shorts: VariantSchema.optional(),
    })
    .optional(),
});

export type ContentDraft = {
  platform: Platform;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  content: string;
  platform_variants: PlatformVariants;
};

async function fetchWinningPatternsBlock(brandId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("winning_patterns")
    .select("*")
    .eq("brand_id", brandId)
    .order("avg_score", { ascending: false })
    .limit(12);
  if (error || !data?.length) {
    return "WINNING_PATTERNS: (empty) — still use strong hooks and clear CTAs.";
  }
  const lines = data.map(
    (r) =>
      `- hook:${r.hook_pattern.slice(0, 80)} | cta:${r.cta_pattern.slice(0, 60)} | topic:${r.topic} | avg:${r.avg_score}`
  );
  return `WINNING_PATTERNS (bias new posts toward these structures):\n${lines.join("\n")}`;
}

/** Normalize hook / caption / CTA / hashtags string fields. */
export function attachHooksCaptionsCTA(raw: z.infer<typeof RawDraftSchema>): Omit<
  ContentDraft,
  "platform_variants"
> & { hashtagsArray: string[] } {
  const hook = raw.hook.trim();
  const caption = raw.caption.trim();
  const cta = raw.cta.trim();
  const content = raw.content.trim();
  const hashtagsArray = raw.hashtags.map((h) => {
    const t = h.trim();
    return t.startsWith("#") ? t : `#${t}`;
  });
  const hashtags = hashtagsArray.join(" ");
  return { platform: raw.platform, hook, caption, cta, content, hashtagsArray, hashtags };
}

/** Ensure per-platform variant objects exist (fallback from primary). */
export function attachPlatformVariants(
  base: Pick<ContentDraft, "hook" | "caption" | "cta" | "hashtags">,
  rawVariants: PlatformVariants | undefined,
  primary: Platform
): PlatformVariants {
  const def = {
    caption: base.caption,
    hashtags: base.hashtags,
    hook: base.hook,
    cta: base.cta,
  };
  const out: PlatformVariants = { ...(rawVariants ?? {}) };
  const platforms: Platform[] = ["instagram", "tiktok", "youtube_shorts"];
  for (const p of platforms) {
    if (!out[p] || Object.keys(out[p]!).length === 0) {
      if (p === primary) {
        out[p] = { ...def };
      } else {
        out[p] = {
          caption: base.caption,
          hashtags: base.hashtags,
          hook: base.hook,
          cta: base.cta,
        };
      }
    }
  }
  return out;
}

function finalizeDraft(
  raw: z.infer<typeof RawDraftSchema>
): ContentDraft {
  const step = attachHooksCaptionsCTA(raw);
  const { hashtagsArray: _, ...rest } = step;
  const variants = attachPlatformVariants(
    {
      hook: rest.hook,
      caption: rest.caption,
      cta: rest.cta,
      hashtags: rest.hashtags,
    },
    raw.platform_variants as PlatformVariants | undefined,
    rest.platform
  );
  return {
    platform: rest.platform,
    hook: rest.hook,
    caption: rest.caption,
    cta: rest.cta,
    hashtags: rest.hashtags,
    content: rest.content,
    platform_variants: variants,
  };
}

/** Prompt snippet for vision / future asset-to-copy pipelines. */
export function generateMediaPrompt(post: Pick<
  ContentPostRow,
  "hook" | "caption" | "cta" | "brand_tag" | "platform"
> & { image_url?: string; video_url?: string }): string {
  return [
    `Brand: ${post.brand_tag}`,
    `Platform: ${post.platform}`,
    `Hook: ${post.hook}`,
    `Caption: ${post.caption}`,
    `CTA: ${post.cta}`,
    post.image_url ? `Image: ${post.image_url}` : "",
    post.video_url ? `Video: ${post.video_url}` : "",
    "",
    "Generate shot list + on-screen text + VO beats that match the hook and CTA.",
  ]
    .filter(Boolean)
    .join("\n");
}

const BatchSchema = z.object({
  posts: z.array(RawDraftSchema),
});

export type GenerateOptions = {
  generateForLeads?: boolean;
  count?: number;
};

export async function generateBatchContent(
  brand: BrandRow,
  count: number = 10,
  options: GenerateOptions = {}
): Promise<ContentDraft[]> {
  const b = mergeBrandForEngine(brand);
  const learning = await fetchWinningPatternsBlock(b.id);
  const leadMode = options.generateForLeads === true;

  const openai = getOpenAI();
  const system = `
You are BeFamous — an autonomous multi-brand short-form growth engine.
Output ONLY valid JSON: { "posts": [ ... exactly ${count} objects ... ] }.

Each post object:
- platform: "instagram" | "tiktok" | "youtube_shorts" (vary across the batch)
- hook: scroll-stopping opener (short)
- caption: full post body, platform-native line breaks
- cta: single strong call-to-action line
- hashtags: string array (5–14 tags, include #)
- content: spoken script or long-form notes editors can trim
- platform_variants: object with keys instagram, tiktok, youtube_shorts — each may have caption, hashtags, hook, cta tailored to that platform (can shorten for TikTok, slightly longer for YT Shorts, emoji policy for IG).

Brand profile:
- Tag: ${b.brand_tag}
- Name: ${b.name}
- Audience: ${b.audience}
- Tone: ${b.tone}
- Goal: ${b.primary_goal}
- CTA style: ${b.cta_style}
- Offer: ${b.offer}
- Niche: ${b.nicheDirective}

${learning}

${leadMode ? `
LEAD MODE ON:
- Pain-first hooks, urgency, consequence of waiting, authority proof.
- CTAs must be direct: DM keyword, call now, book, apply, claim spot.
` : ""}

Rules: no generic AI filler; concrete scenarios; pattern interrupts; respect brand_tag ${b.brand_tag}.
`.trim();

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Generate ${count} posts for brand_tag=${b.brand_tag}. Preferred platforms to include: ${b.preferred_platforms.join(", ")}.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty OpenAI response");

  const parsed = BatchSchema.parse(JSON.parse(raw));
  if (parsed.posts.length !== count) {
    throw new Error(`Expected ${count} posts, got ${parsed.posts.length}`);
  }

  return parsed.posts.map(finalizeDraft);
}

/** Default “daily” batch size for cron + operators. */
export async function generateDailyContent(
  brand: BrandRow,
  options: GenerateOptions = {}
): Promise<ContentDraft[]> {
  const n = options.count ?? 8;
  return generateBatchContent(brand, n, options);
}

export async function generateAndPersistBatch(
  brand: BrandRow,
  count: number,
  generateForLeads: boolean
): Promise<{ inserted: number; ids: string[] }> {
  const drafts = await generateBatchContent(brand, count, { generateForLeads });
  return persistContentDrafts(brand, drafts, generateForLeads);
}

export async function generateDailyAndPersist(
  brand: BrandRow,
  generateForLeads: boolean
): Promise<{ inserted: number; ids: string[] }> {
  const drafts = await generateDailyContent(brand, { generateForLeads });
  return persistContentDrafts(brand, drafts, generateForLeads);
}

export async function persistContentDrafts(
  brand: BrandRow,
  drafts: ContentDraft[],
  generateForLeads: boolean
): Promise<{ inserted: number; ids: string[] }> {
  const supabase = getSupabaseAdmin();
  const rows = drafts.map((d) => ({
    brand_id: brand.id,
    brand_tag: brand.brand_tag,
    platform: d.platform,
    content: d.content,
    hook: d.hook,
    caption: d.caption,
    cta: d.cta,
    hashtags: d.hashtags,
    platform_variants: d.platform_variants,
    image_url: "",
    video_url: "",
    generate_for_leads: generateForLeads,
    status: "draft" as const,
  }));

  const { data, error } = await supabase.from("posts").insert(rows).select("id");
  if (error) throw error;
  return {
    inserted: data?.length ?? 0,
    ids: (data ?? []).map((r) => r.id as string),
  };
}
