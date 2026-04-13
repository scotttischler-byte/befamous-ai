/**
 * Map an MVA ad (hook, script, visual plan) into timed scenes for CapCut / manual edit.
 */

import { MVA_DEFAULT_VISUAL_PLAN } from "@/lib/mva-content";

export type MvaAdForVideo = {
  hook: string;
  script: string;
  caption: string;
  cta: string;
  visual_plan?: string[];
};

export type VideoScene = {
  text: string;
  duration: number;
  visual_hint: string;
};

export type CapCutManualExport = {
  format: "befamous_capcut_manual_v1";
  generated_at: string;
  title: string;
  scenes: VideoScene[];
  notes: string[];
};

function mergeVisualPlan(plan?: string[]): string[] {
  const p = plan ?? [];
  return MVA_DEFAULT_VISUAL_PLAN.map((def, i) => (p[i]?.trim() ? p[i]!.trim() : def));
}

/** Rough split of script into n segments on sentence boundaries. */
function splitScriptIntoSegments(script: string, n: number): string[] {
  const cleaned = script.replace(/\s+/g, " ").trim();
  if (!cleaned) return Array(n).fill("");
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= n) {
    const out = [...sentences];
    while (out.length < n) out.push(sentences[sentences.length - 1] ?? cleaned);
    return out.slice(0, n);
  }
  const per = Math.ceil(sentences.length / n);
  const chunks: string[] = [];
  for (let i = 0; i < n; i++) {
    const slice = sentences.slice(i * per, (i + 1) * per);
    chunks.push(slice.join(" ").trim());
  }
  return chunks;
}

const BASE_DURATIONS = [3.5, 8, 9, 10, 5.5];

/**
 * 1) Map script → scenes
 * 2) Per-scene on-screen caption text + duration + visual hint
 * 3) JSON suitable for CapCut planning / manual assembly
 */
export function generateVideoFromScript(ad: MvaAdForVideo): CapCutManualExport {
  const visuals = mergeVisualPlan(ad.visual_plan);
  const hookLine = ad.hook.trim();
  const bodyParts = splitScriptIntoSegments(ad.script, 5);

  const scenes: VideoScene[] = visuals.map((visual_hint, i) => {
    let text: string;
    if (i === 0) {
      text = hookLine || bodyParts[0] || ad.script.slice(0, 120);
    } else if (i === 4) {
      text = [bodyParts[4] || ad.cta, ad.cta].filter(Boolean).join(" — ");
    } else {
      text = bodyParts[i] || ad.script.slice(i * 40, (i + 1) * 40);
    }
    return {
      text: text.trim(),
      duration: BASE_DURATIONS[i] ?? 6,
      visual_hint,
    };
  });

  return {
    format: "befamous_capcut_manual_v1",
    generated_at: new Date().toISOString(),
    title: `MVA ad — ${hookLine.slice(0, 48)}`,
    scenes,
    notes: [
      "Import as reference: create one CapCut compound clip per scene; adjust durations to match VO.",
      "Optional: burn captions from scenes[].text; align cuts to script waveform.",
    ],
  };
}
