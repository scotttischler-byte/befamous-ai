import type { HookFormState } from "@/lib/hook-engine-types";

export type GeneratedHook = {
  id: string;
  /** Scroll-stopping opening line */
  hook: string;
  /** Strategic angle — why this pattern wins */
  angle: string;
  /** Ready-to-use CTA line */
  suggestedCta: string;
};

/** Punchy, emotional openers — platform-aware cadence */
const HOOK_FRAMES = [
  (o: HookFormState) =>
    `Nobody in ${o.niche} talks about this — but ${o.audience || "your audience"} feels it in their bones.`,
  (o: HookFormState) =>
    `If ${o.goal.toLowerCase()} is the goal, your ${o.platform} hook can't start with “Hey guys.”`,
  (o: HookFormState) =>
    `Hot take: ${o.offer || "your offer"} fails for one reason — and it’s not what you think.`,
  (o: HookFormState) =>
    `3 seconds. That’s how long you have before ${o.audience || "they"} scroll. Here’s the ${o.tone.toLowerCase()} opener that buys time.`,
  (o: HookFormState) =>
    `I’d be embarrassed to post this in ${o.niche}… if it didn’t print ${o.goal.toLowerCase()}.`,
  (o: HookFormState) =>
    `The ${o.niche} “best practice” that quietly tanks trust — and the line that fixes it.`,
  (o: HookFormState) =>
    `POV: You’re ${o.audience || "exhausted"} from content that doesn’t convert. This angle changes the game.`,
  (o: HookFormState) =>
    `Stop asking for ${o.goal.toLowerCase()}. Start with this emotional wedge — then deliver ${o.offer || "value"}.`,
  (o: HookFormState) =>
    `They told you to post more. Wrong. Post ${o.tone.toLowerCase()} — or don’t post.`,
  (o: HookFormState) =>
    `This is the ${o.platform} hook I wish someone handed me before I burned 40 hours on dead content.`,
];

/** Why the hook works — strategic, not generic */
const ANGLE_WHY_FRAMES = [
  (o: HookFormState) =>
    `Why it works: Opens with tension + specificity (${o.niche}) so the viewer feels “that’s me” before you sell.`,
  (o: HookFormState) =>
    `Why it works: Pattern-interrupt in the first beat — ${o.tone} tone signals authority without a lecture.`,
  (o: HookFormState) =>
    `Why it works: Stakes before solution — ${o.goal.toLowerCase()} lands because fear of loss beats vague hope.`,
  (o: HookFormState) =>
    `Why it works: Contrarian hook earns the save; you earn the follow-up with proof tied to ${o.offer || "your offer"}.`,
  (o: HookFormState) =>
    `Why it works: Speaks to ${o.audience || "one avatar"} only — narrow beats broad on ${o.platform}.`,
  (_o: HookFormState) =>
    `Why it works: Emotional hook → logical bridge → CTA; the brain needs both to move on short-form.`,
  (_o: HookFormState) =>
    `Why it works: “Unpopular opinion” triggers comments; comments feed the algo while you look fearless.`,
  (o: HookFormState) =>
    `Why it works: Time-boxed urgency (${o.goal}) without sleaze — urgency from clarity, not countdown spam.`,
];

const SUGGESTED_CTA_FRAMES = [
  (o: HookFormState) =>
    `→ ${o.cta || "Comment HOOKS"} — make the next step stupid obvious above the fold.`,
  (o: HookFormState) =>
    `→ Tap link / ${o.cta || "DM READY"} — pair with one proof line in the next slide.`,
  (o: HookFormState) =>
    `→ ${o.cta || "Save this"} + follow for the breakdown — build list while you teach.`,
  (o: HookFormState) =>
    `→ ${o.cta || "Book a call"} — only after you’ve named the villain (bad advice, bad habit, bad offer).`,
  (o: HookFormState) =>
    `→ ${o.cta || "Get the script"} — lead with curiosity, close with one frictionless action.`,
];

function mixIndex(seed: string, i: number, mod: number): number {
  let h = 0;
  const s = `${seed}|${i}`;
  for (let j = 0; j < s.length; j++) h = (h * 31 + s.charCodeAt(j)) >>> 0;
  return h % mod;
}

export function generateMockHooks(form: HookFormState): GeneratedHook[] {
  const seed = [
    form.platform,
    form.niche,
    form.goal,
    form.tone,
    form.audience,
    form.offer,
    form.cta,
  ].join("|");

  const n = form.outputCount;
  const out: GeneratedHook[] = [];

  for (let i = 0; i < n; i++) {
    const hi = mixIndex(seed, i, HOOK_FRAMES.length);
    const ai = mixIndex(seed + "a", i, ANGLE_WHY_FRAMES.length);
    const ci = mixIndex(seed + "c", i, SUGGESTED_CTA_FRAMES.length);

    const hook = HOOK_FRAMES[hi](form).replace(/\s+/g, " ").trim();
    const angle = ANGLE_WHY_FRAMES[ai](form).replace(/\s+/g, " ").trim();
    const suggestedCta = SUGGESTED_CTA_FRAMES[ci](form).replace(/\s+/g, " ").trim();

    out.push({
      id: `hook-${i}-${hi}-${ai}`,
      hook,
      angle,
      suggestedCta,
    });
  }

  return out;
}
