import { z } from "zod";
import type { BrandRow, CampaignItem, CampaignPackage, Platform } from "@/lib/types";
import { loadLearningPromptBlock } from "@/lib/learning-format";
import { getNichePlaybook } from "@/lib/niche-playbook";
import { getOpenAI } from "@/lib/openai-client";

const Bucket = z.enum([
  "authority",
  "story",
  "education",
  "controversy",
  "conversion",
]);

const Kind = z.enum([
  "hook",
  "caption",
  "cta",
  "video_idea",
  "lead_post",
  "conversion_post",
  "ad_script",
  "lead_magnet",
]);

const ItemSchema = z.object({
  content_bucket: Bucket,
  item_kind: Kind,
  platform: z.enum(["instagram", "tiktok", "youtube_shorts"]),
  hook: z.string(),
  body: z.string(),
  caption: z.string(),
  cta: z.string(),
  video_idea: z.string(),
  lead_magnet_idea: z.string(),
});

const PackageSchema = z.object({
  batch_label: z.string().min(1),
  items: z.array(ItemSchema),
});

function countKind(items: CampaignItem[], k: string) {
  return items.filter((i) => i.item_kind === k).length;
}

function validateDistribution(items: CampaignItem[]) {
  const checks: [string, number, number][] = [
    ["hook", countKind(items, "hook"), 10],
    ["caption", countKind(items, "caption"), 5],
    ["cta", countKind(items, "cta"), 3],
    ["video_idea", countKind(items, "video_idea"), 3],
    ["lead_post", countKind(items, "lead_post"), 2],
    ["conversion_post", countKind(items, "conversion_post"), 1],
    ["ad_script", countKind(items, "ad_script"), 1],
    ["lead_magnet", countKind(items, "lead_magnet"), 1],
  ];
  for (const [name, got, want] of checks) {
    if (got !== want) {
      throw new Error(`Campaign package invalid: expected ${want} ${name}, got ${got}`);
    }
  }
  const buckets = new Set(items.map((i) => i.content_bucket));
  if (buckets.size < 4) {
    throw new Error(
      "Campaign package must use at least 4 distinct content buckets across items"
    );
  }
}

export type GenerateCampaignInput = {
  brand: BrandRow;
  platform: Platform;
  /** Overrides brand profile for this run */
  offer: string;
  audience: string;
  tone: string;
  goal: string;
};

export async function generateCampaignPackage(
  input: GenerateCampaignInput
): Promise<CampaignPackage> {
  const learning = await loadLearningPromptBlock(input.brand.id);
  const playbook = getNichePlaybook(input.brand.name, input.brand.niche);

  const brandBlock = `
BRAND PROFILE:
- Name: ${input.brand.name}
- Niche: ${input.brand.niche}
- Audience: ${input.audience}
- Offer (first-class): ${input.offer}
- Tone: ${input.tone}
- Primary goal: ${input.goal}
- Preferred platforms (brand default): ${input.brand.preferred_platforms.join(", ")}
- CTA style: ${input.brand.call_to_action_style}
- Target platform for this run: ${input.platform}
`.trim();

  const system = `
You are BeFamous Growth Engine — an internal multi-brand direct-response campaign system.
You generate daily short-form social packages for organic reach, followers, and leads.

${playbook}

CONTENT BUCKETS (every package must rotate styles — do not lean on one bucket):
- authority: credibility, experience, results, proof
- story: BTS, wins, losses, lessons, human moments
- education: practical advice, mistakes to avoid, how-to
- controversy: contrarian takes, pattern interrupts, myth-busting
- conversion: direct offer, CTA, lead gen, next step

OUTPUT RULES:
- No generic AI fluff. Concrete, specific, platform-native.
- Hooks: scroll-stopping, pattern interrupts, short and punchy.
- Captions: ready to paste; use line breaks where helpful.
- CTA items: distinct angles testing ${input.brand.call_to_action_style}
- Video ideas: 15–45s short-form beats (hook, beat, payoff, CTA).
- Lead posts: soft bridge to offer + DM/comment CTA.
- Conversion post: hard offer clear.
- Ad script: 20–35s spoken script, punchy.
- Lead magnet: one specific magnet idea tied to the offer.

${learning}

Return JSON only with shape:
{
  "batch_label": "short string",
  "items": [ ... exactly 26 objects ... ]
}

The 26 items MUST be exactly:
- 10 where item_kind is "hook"
- 5 where item_kind is "caption" (full post body in "body" or "caption" — fill both if split makes sense)
- 3 where item_kind is "cta"
- 3 where item_kind is "video_idea" (put idea in "video_idea")
- 2 where item_kind is "lead_post"
- 1 where item_kind is "conversion_post"
- 1 where item_kind is "ad_script" (script in "body")
- 1 where item_kind is "lead_magnet" (idea in "lead_magnet_idea")

Each item:
- content_bucket: one of authority|story|education|controversy|conversion
- item_kind: as above
- platform: "${input.platform}" for all items unless you intentionally vary (prefer single platform per run: ${input.platform})
- hook, body, caption, cta, video_idea, lead_magnet_idea: strings (use empty string if not applicable)

Spread buckets across items: include at least one conversion item that is NOT only in hooks — mix buckets across hooks and captions too.
`.trim();

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.9,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: brandBlock },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty OpenAI response");

  const parsed = PackageSchema.parse(JSON.parse(raw));
  const items = parsed.items as CampaignItem[];
  validateDistribution(items);

  return {
    batch_label: parsed.batch_label,
    brand_id: input.brand.id,
    items,
  };
}
