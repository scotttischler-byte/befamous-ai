/** MVA (motor vehicle accident / PI) vertical — hooks, scripts, variation mix. */

/** Default 5-scene visual plan when the model omits or shortens `visual_plan`. */
export const MVA_DEFAULT_VISUAL_PLAN: readonly string[] = [
  "Scene 1 (hook visual): Tight talking-head, bold kinetic hook text; interrupt pattern in first 2 seconds.",
  "Scene 2 (problem): Emotional stakes — timer, bills, or crash aftermath b-roll; voice ramps urgency or loss.",
  "Scene 3 (mistake): Split-screen or callout graphics — one concrete insurance / delay / carrier mistake.",
  "Scene 4 (solution): Calmer authority; free case check framing; micro disclaimer (not legal advice).",
  "Scene 5 (CTA): Face cam + end card; DM keyword / tap link / call — mirrors final spoken CTA.",
];

export const MVA_VARIATION_LABELS = [
  "Soft tissue cases",
  "Truck accidents",
  "Uber/Lyft accidents",
  "Motorcycle accidents",
  "High payout cases",
] as const;

export type MvaVariationLabel = (typeof MVA_VARIATION_LABELS)[number];

export function mvaVariationForIndex(i: number): MvaVariationLabel {
  return MVA_VARIATION_LABELS[i % MVA_VARIATION_LABELS.length];
}

/** Extra system prompt for OpenAI when brand_tag is MVA. */
export function buildMvaSystemPromptSection(count: number): string {
  return `
BRAND VERTICAL: MVA — motor vehicle accident / personal injury leads (NOT generic legal content).

Every post MUST satisfy ALL of the following in the JSON fields:

1) hook — Aggressive pattern-interrupt for the FIRST ~2 SECONDS on camera (short; say it out loud; zero generic filler).
2) script — Full spoken voiceover (about 30–55 seconds when read aloud). Inside the script you MUST clearly include:
   • ONE dominant emotional trigger: fear, loss, OR urgency (pick one per post; make it visceral and specific).
   • ONE specific mistake victims make, tied to the assigned variation type (examples: trusting the adjuster alone, delaying care, signing a release too early, gaps in treatment, soft tissue “minor” dismissals, truck company rapid response teams, Uber/Lyft coverage denials, motorcycle bias, undervaluing serious injury, etc.).
   • Empathy + authority tone — you get what they’re going through; never claim to give legal advice; no medical diagnosis.
3) caption — Platform-native body copy (line breaks, scannable). Specific scenario language; NOT generic motivational spam.
4) cta — MUST be an explicit “check your case” CTA (e.g. free case review, DM a keyword, tap to see if you qualify, call now to find out if you have a case). No vague “learn more” only.

VARIATION TYPES — each post MUST include string field "mva_variation" set to EXACTLY one of:
- "Soft tissue cases"
- "Truck accidents"
- "Uber/Lyft accidents"
- "Motorcycle accidents"
- "High payout cases"

Across this batch of ${count} posts, use all five variation types at least once (rotate/cycle as needed if count > 5).

Also set "content" to the SAME full text as "script" (for downstream tools that still read content).

VISUAL_PLAN (required): array "visual_plan" with EXACTLY 5 strings, in order:
1) Scene 1 (hook visual): …
2) Scene 2 (problem): …
3) Scene 3 (mistake): …
4) Scene 4 (solution): …
5) Scene 5 (CTA): …
Each line must be a concrete shot / graphic / b-roll direction (not generic "film b-roll").

HASHTAGS: array of strings (5–14), each tag with #.

Tone: direct response, urgent, empathetic, concrete. BANNED: generic AI platitudes, “in today’s world”, “here’s the thing”, “content is king”, vague injury statements, anything that could be any niche.

Output shape per post (in addition to platform, platform_variants):
- hook, script, caption, cta, content (duplicate of script), mva_variation, visual_plan (string[5]), hashtags (string[])
`.trim();
}

export function buildMvaUserAssignmentLines(count: number): string {
  const lines = Array.from({ length: count }, (_, i) => {
    const v = mvaVariationForIndex(i);
    return `Post ${i + 1}: required mva_variation = "${v}"`;
  });
  return [
    `Generate exactly ${count} MVA posts following the assignments below (variation label must match exactly).`,
    ...lines,
  ].join("\n");
}
