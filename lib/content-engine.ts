import { z } from "zod";
import { bgeLog } from "@/lib/bge-log";
import { mergeBrandForEngine, syntheticBrandRow } from "@/lib/brands";
import { getOpenAISafe } from "@/lib/openai-client";
import { isSupabaseEnvReady } from "@/lib/env-check";
import { getWinningPatternsPromptBlock } from "@/lib/learning-engine";
import {
  buildMvaSystemPromptSection,
  buildMvaUserAssignmentLines,
  MVA_DEFAULT_VISUAL_PLAN,
  mvaVariationForIndex,
} from "@/lib/mva-content";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  BrandRow,
  BrandTag,
  ContentPostRow,
  Platform,
  PlatformVariants,
} from "@/lib/types";

const PlatformEnum = z.enum(["instagram", "tiktok", "youtube_shorts"]);

const VariantSchema = z.object({
  caption: z.string().optional(),
  hashtags: z.string().optional(),
  hook: z.string().optional(),
  cta: z.string().optional(),
});

const RawDraftInputSchema = z
  .object({
    platform: PlatformEnum,
    hook: z.string(),
    script: z.string().optional(),
    caption: z.string(),
    cta: z.string(),
    hashtags: z.array(z.string()),
    content: z.string().optional(),
    mva_variation: z.string().optional(),
    visual_plan: z.array(z.string()).optional(),
    platform_variants: z
      .object({
        instagram: VariantSchema.optional(),
        tiktok: VariantSchema.optional(),
        youtube_shorts: VariantSchema.optional(),
      })
      .optional(),
  })
  .refine(
    (d) => {
      const s = (d.script ?? "").trim();
      const c = (d.content ?? "").trim();
      return s.length > 0 || c.length > 0;
    },
    { message: "script or content required", path: ["script"] }
  );

const RawDraftSchema = RawDraftInputSchema.transform((d) => {
  const script = (d.script ?? d.content ?? "").trim();
  const content = (d.content ?? script).trim();
  return { ...d, script, content };
}).refine((d) => d.script.length >= 8, {
  message: "script too short",
  path: ["script"],
});

export type ContentDraft = {
  platform: Platform;
  hook: string;
  script: string;
  caption: string;
  cta: string;
  /** Space-separated tags for DB `hashtags` text column. */
  hashtags: string;
  /** Same as `hashtags` split for API consumers. */
  hashtags_list: string[];
  content: string;
  mva_variation?: string;
  /** MVA only: five scene directions (hook / problem / mistake / solution / CTA). */
  visual_plan: string[];
  platform_variants: PlatformVariants;
};

/** Canonical MVA payload shape for APIs / video pipeline. */
export type MvaAdOutput = {
  hook: string;
  script: string;
  caption: string;
  cta: string;
  visual_plan: string[];
  hashtags: string[];
};

export function toMvaAdOutput(d: ContentDraft): MvaAdOutput {
  return {
    hook: d.hook,
    script: d.script,
    caption: d.caption,
    cta: d.cta,
    visual_plan: d.visual_plan,
    hashtags: d.hashtags_list,
  };
}

function normalizeVisualPlan(
  plan: string[] | undefined,
  isMva: boolean
): string[] {
  if (!isMva) return [];
  const p = plan ?? [];
  return MVA_DEFAULT_VISUAL_PLAN.map((def, i) => {
    const custom = p[i]?.trim();
    return custom && custom.length > 4 ? custom : def;
  });
}

function applyMvaVisualFallback(
  drafts: ContentDraft[],
  isMva: boolean
): ContentDraft[] {
  if (!isMva) return drafts;
  return drafts.map((d) => ({
    ...d,
    visual_plan: normalizeVisualPlan(
      d.visual_plan.length ? d.visual_plan : undefined,
      true
    ),
  }));
}

async function fetchWinningPatternsBlock(brandId: string): Promise<string> {
  if (!isSupabaseEnvReady()) {
    bgeLog("warn", "fetchWinningPatternsBlock: Supabase not configured, using empty patterns");
    return "LEARNING_SIGNALS: (empty) — still use strong hooks and clear CTAs.";
  }
  try {
    return await getWinningPatternsPromptBlock(brandId);
  } catch (e) {
    bgeLog("error", "fetchWinningPatternsBlock: learning engine error", e);
    return "LEARNING_SIGNALS: (empty) — still use strong hooks and clear CTAs.";
  }
}

function mockMvaDrafts(
  b: BrandRow & { nicheDirective: string },
  count: number
): ContentDraft[] {
  const platforms: Platform[] = ["tiktok", "instagram", "youtube_shorts"];
  const out: ContentDraft[] = [];
  const mistakes: Record<string, string> = {
    "Soft tissue cases":
      "The adjuster says soft tissue means a small check — while they run out the clock on your documentation.",
    "Truck accidents":
      "The trucking insurer already has a rapid-response team; every day you wait, evidence and logs get harder to lock down.",
    "Uber/Lyft accidents":
      "Rideshare coverage fights are a maze — saying the wrong thing to the wrong carrier can kill your claim before it starts.",
    "Motorcycle accidents":
      "Bias starts the second they see two wheels — if you don’t document and push back fast, they’ll paint you as ‘at fault.’",
    "High payout cases":
      "Serious injury cases get lowballed early on purpose — if you sign or stall, you can leave six figures on the table.",
  };
  for (let i = 0; i < count; i++) {
    const variation = mvaVariationForIndex(i);
    const platform = platforms[i % 3];
    const mistake = mistakes[variation] ?? mistakes["Soft tissue cases"];
    const hook = `Stop — if you were in a crash, this is the ${variation.toLowerCase()} mistake that costs people their case.`;
    const script = [
      `${hook}`,
      `I’m not here to scare you for no reason — I’m here because I’ve watched people lose leverage they didn’t know they had.`,
      `Here’s the emotional truth: every week you guess instead of getting clarity, the other side builds a file against you.`,
      `Specific mistake people make: ${mistake}`,
      `You’re not looking for drama — you’re looking for a straight answer before you answer another recorded call or sign anything.`,
      `That’s why we do a free case check — not legal advice, just: do you have a real path forward or not.`,
    ].join(" ");
    const caption = [
      `🚨 ${variation}`,
      "",
      hook,
      "",
      `The mistake: ${mistake}`,
      "",
      `Not legal advice. ${b.offer}.`,
    ].join("\n");
    const cta =
      "DM “CASE” or tap — free case check. We’ll tell you if you’re sitting on a claim worth fighting for.";
    const visual_plan = MVA_DEFAULT_VISUAL_PLAN.map((scene, si) => {
      if (si === 2) return `${scene} ${mistake.slice(0, 120)}`;
      if (si === 0) return `${scene} Hook on-screen: "${hook.slice(0, 80)}…"`;
      return scene;
    });
    const raw = {
      platform,
      hook,
      script,
      content: script,
      caption,
      cta,
      hashtags: [
        "#caraccident",
        "#injurylaw",
        "#mvalawyer",
        "#insurance",
        "#softtissue",
        `#${String(b.brand_tag).toLowerCase()}`,
      ],
      mva_variation: variation,
      visual_plan,
      platform_variants: undefined as undefined,
    };
    out.push(finalizeDraft(RawDraftSchema.parse(raw)));
  }
  return out;
}

function mockContentDrafts(
  b: BrandRow & { nicheDirective: string },
  count: number
): ContentDraft[] {
  if (b.brand_tag === "MVA") {
    return mockMvaDrafts(b, count);
  }
  const platforms: Platform[] = ["instagram", "tiktok", "youtube_shorts"];
  const out: ContentDraft[] = [];
  for (let i = 0; i < count; i++) {
    const platform = platforms[i % 3];
    const script = `Offline fallback voice-over #${i + 1}: keep under 45s; swap keys for real scripts. ${b.nicheDirective.slice(0, 120)}`;
    const raw = {
      platform,
      hook: `[Offline mock] ${b.brand_tag} #${i + 1}: ${b.audience.slice(0, 48)}…`,
      caption: `Demo post — add OPENAI_API_KEY for live AI copy.\n\n${b.offer}\n\n${b.nicheDirective.slice(0, 180)}`,
      cta: `${b.cta_style}`,
      hashtags: ["#shorts", "#fyp", `#${String(b.brand_tag).toLowerCase()}`],
      script,
      content: script,
      visual_plan: [] as string[],
      platform_variants: undefined as undefined,
    };
    out.push(finalizeDraft(RawDraftSchema.parse(raw)));
  }
  return out;
}

function resolveBrandInput(brand: BrandRow | BrandTag): BrandRow {
  if (typeof brand === "string") {
    return syntheticBrandRow(brand);
  }
  return brand;
}

/** Normalize hook / script / caption / CTA / hashtags string fields. */
export function attachHooksCaptionsCTA(raw: z.infer<typeof RawDraftSchema>): Omit<
  ContentDraft,
  "platform_variants" | "mva_variation" | "visual_plan" | "hashtags_list"
> & { hashtagsArray: string[] } {
  const hook = raw.hook.trim();
  const script = raw.script.trim();
  const content = (raw.content.trim() || script).trim();
  const caption = raw.caption.trim();
  const cta = raw.cta.trim();
  const hashtagsArray = raw.hashtags.map((h) => {
    const t = h.trim();
    return t.startsWith("#") ? t : `#${t}`;
  });
  const hashtags = hashtagsArray.join(" ");
  return {
    platform: raw.platform,
    hook,
    script,
    caption,
    cta,
    content,
    hashtagsArray,
    hashtags,
  };
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

function finalizeDraft(raw: z.infer<typeof RawDraftSchema>): ContentDraft {
  const step = attachHooksCaptionsCTA(raw);
  const { hashtagsArray, ...rest } = step;
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
  const mv = raw.mva_variation?.trim();
  if (mv) {
    variants.mva_variation = mv;
  }
  const isMva = Boolean(mv) || (raw.visual_plan?.length ?? 0) > 0;
  const visual_plan = normalizeVisualPlan(raw.visual_plan, isMva);
  return {
    platform: rest.platform,
    hook: rest.hook,
    script: rest.script,
    caption: rest.caption,
    cta: rest.cta,
    hashtags: rest.hashtags,
    hashtags_list: hashtagsArray,
    content: rest.content,
    mva_variation: mv,
    visual_plan,
    platform_variants: variants,
  };
}

/** Prompt snippet for vision / future asset-to-copy pipelines. */
export function generateMediaPrompt(post: Pick<
  ContentPostRow,
  "hook" | "caption" | "cta" | "brand_tag" | "platform" | "content"
> & { image_url?: string; video_url?: string }): string {
  const vp = (post as ContentPostRow).visual_plan;
  const vpBlock =
    Array.isArray(vp) && vp.length ? `\nVisual plan:\n${vp.join("\n")}` : "";
  return [
    `Brand: ${post.brand_tag}`,
    `Platform: ${post.platform}`,
    `Hook: ${post.hook}`,
    `Script / VO: ${post.content}`,
    `Caption: ${post.caption}`,
    `CTA: ${post.cta}`,
    vpBlock,
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

/**
 * Generate `count` drafts. Pass a DB `BrandRow` or a vertical tag e.g. `"MVA"`, `"LAW_FIRM"`, `"FITNESS"`.
 * Uses OpenAI when configured; otherwise returns mock posts (no crash).
 */
export async function generateBatchContent(
  brand: BrandRow | BrandTag,
  count: number = 10,
  options: GenerateOptions = {}
): Promise<ContentDraft[]> {
  const row = resolveBrandInput(brand);
  const b = mergeBrandForEngine(row);
  const learning = await fetchWinningPatternsBlock(b.id);
  const leadMode = options.generateForLeads === true;

  const openai = getOpenAISafe();
  if (!openai) {
    bgeLog("warn", "generateBatchContent: fallback mock posts (OpenAI not ready)", {
      brand_tag: b.brand_tag,
      count,
    });
    return applyMvaVisualFallback(mockContentDrafts(b, count), b.brand_tag === "MVA");
  }

  const isMva = b.brand_tag === "MVA";

  const genericShape = `
Each post object:
- platform: "instagram" | "tiktok" | "youtube_shorts" (vary across the batch)
- hook: scroll-stopping opener (short)
- script: full spoken voiceover (required). Set "content" to the same string as "script".
- caption: full post body, platform-native line breaks
- cta: single strong call-to-action line
- hashtags: string array (5–14 tags, include #)
- visual_plan: string array (use [] for non-MVA brands)
- platform_variants: object with keys instagram, tiktok, youtube_shorts — optional per-platform caption/hook/cta/hashtags.
`.trim();

  const mvaBlock = isMva ? `\n\n${buildMvaSystemPromptSection(count)}` : "";

  const system = `
You are BeFamous — an autonomous multi-brand short-form growth engine.
Output ONLY valid JSON: { "posts": [ ... exactly ${count} objects ... ] }.

${genericShape}
${mvaBlock}

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

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: isMva
            ? `${buildMvaUserAssignmentLines(count)}\n\nPreferred platforms to include: ${b.preferred_platforms.join(", ")}.`
            : `Generate ${count} posts for brand_tag=${b.brand_tag}. Preferred platforms to include: ${b.preferred_platforms.join(", ")}. For each post set visual_plan to [].`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty OpenAI response");

    const parsed = BatchSchema.parse(JSON.parse(raw));
    if (parsed.posts.length !== count) {
      throw new Error(`Expected ${count} posts, got ${parsed.posts.length}`);
    }

    bgeLog("info", "generateBatchContent: OpenAI generation complete", {
      brand_tag: b.brand_tag,
      count,
      model,
    });
    return applyMvaVisualFallback(parsed.posts.map(finalizeDraft), isMva);
  } catch (e) {
    bgeLog("error", "generateBatchContent: OpenAI failed, using mock fallback", e);
    bgeLog("warn", "generateBatchContent: fallback mock posts after error", {
      brand_tag: b.brand_tag,
      count,
    });
    return applyMvaVisualFallback(mockContentDrafts(b, count), isMva);
  }
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

/** Daily autonomous run: 10 MVA ads → posts (requires MVA brand row in DB). */
export async function generateAndPersistMvaDaily(
  generateForLeads: boolean = true
): Promise<{ inserted: number; ids: string[] }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("brand_tag", "MVA")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("MVA brand not found in database (run schema seed)");
  const brand = data as BrandRow;
  return generateAndPersistBatch(brand, 10, generateForLeads);
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
    content: d.script || d.content,
    script: d.script,
    hook: d.hook,
    caption: d.caption,
    cta: d.cta,
    hashtags: d.hashtags,
    visual_plan: d.visual_plan,
    score: 0,
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
