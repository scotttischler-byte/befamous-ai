import type { HookFormState } from "@/lib/hook-engine-types";

export type GeneratedHook = {
  id: string;
  hook: string;
  angle: string;
  starterCaption: string;
};

const HOOK_FRAMES = [
  (o: HookFormState, i: number) =>
    `${o.tone} truth: ${o.offer || "this topic"} is costing ${o.audience || "your audience"} more than they think.`,
  (o: HookFormState, i: number) =>
    `Stop scrolling if you're in ${o.niche} — ${o.goal.toLowerCase()} starts with one shift.`,
  (o: HookFormState, i: number) =>
    `The ${o.niche} playbook everyone copies… and why it quietly fails ${o.audience || "most people"}.`,
  (o: HookFormState, i: number) =>
    `3 signals ${o.audience || "your audience"} sends before they ${o.cta || "take action"} — most brands miss #2.`,
  (o: HookFormState, i: number) =>
    `I studied 200 ${o.platform} posts in ${o.niche}. The top 1% share this ${o.tone.toLowerCase()} pattern.`,
  (o: HookFormState, i: number) =>
    `Unpopular opinion: ${o.offer || "your offer"} isn't the problem — your angle is.`,
  (o: HookFormState, i: number) =>
    `If ${o.goal.toLowerCase()} matters this quarter, start here — not with more content, with clearer stakes.`,
  (o: HookFormState, i: number) =>
    `POV: You're ${o.audience || "the audience"} drowning in tips. Here's the ${o.tone.toLowerCase()} line that actually converts.`,
];

const ANGLE_FRAMES = [
  (o: HookFormState, i: number) =>
    `Contrast “typical ${o.niche} advice” vs. a contrarian move tied to ${o.offer || "your core offer"}, framed for ${o.goal.toLowerCase()}.`,
  (o: HookFormState, i: number) =>
    `Lead with a tension: what ${o.audience || "people"} believe vs. what the data/outcomes show — ${o.tone} delivery.`,
  (o: HookFormState, i: number) =>
    `Micro-story arc: mistake → realization → ${o.cta || "next step"}; keep ${o.platform} pacing tight.`,
  (o: HookFormState, i: number) =>
    `Authority stack: one proof point, one pattern interrupt, one ${o.tone.toLowerCase()} CTA toward ${o.goal.toLowerCase()}.`,
  (o: HookFormState, i: number) =>
    `Pattern interrupt in first 1.2s: pattern name + bold claim about ${o.offer || "the topic"}, then payoff.`,
  (o: HookFormState, i: number) =>
    `Teach a “rule you break” in ${o.niche}: who it’s for, who it’s not, why ${o.audience || "your viewer"} should care now.`,
];

const CAPTION_FRAMES = [
  (o: HookFormState, i: number) =>
    `${o.offer ? `${o.offer} — ` : ""}Here's the ${o.tone.toLowerCase()} reframe ${o.audience || "your audience"} needs before another ${o.goal.toLowerCase()} push. ${o.cta ? `(${o.cta})` : ""}`,
  (o: HookFormState, i: number) =>
    `Saving this for ${o.niche} creators who want ${o.goal.toLowerCase()} without burning out. Drop a 🔥 if you want part 2.`,
  (o: HookFormState, i: number) =>
    `Hot take for ${o.platform}: clarity beats clever. If ${o.offer || "your message"} isn't landing, swap the angle—not the hustle.`,
  (o: HookFormState, i: number) =>
    `If you're speaking to ${o.audience || "this audience"}, lead with stakes, then proof, then ${o.cta || "your CTA"}.`,
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
    const ai = mixIndex(seed + "a", i, ANGLE_FRAMES.length);
    const ci = mixIndex(seed + "c", i, CAPTION_FRAMES.length);

    const hook = HOOK_FRAMES[hi](form, i).replace(/\s+/g, " ").trim();
    const angle = ANGLE_FRAMES[ai](form, i).replace(/\s+/g, " ").trim();
    const starterCaption = CAPTION_FRAMES[ci](form, i).replace(/\s+/g, " ").trim();

    out.push({
      id: `hook-${i}-${hi}-${ai}`,
      hook,
      angle,
      starterCaption,
    });
  }

  return out;
}
