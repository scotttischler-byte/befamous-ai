import type { BrandRow } from "@/lib/types";

export const AD_HOC_BRAND_ID = "00000000-0000-0000-0000-000000000000";

export function buildAdHocBrand(input: {
  niche: string;
  offer: string;
  audience: string;
  tone: string;
  goal: string;
  preferred_platforms?: string[];
  call_to_action_style?: string;
}): BrandRow {
  return {
    id: AD_HOC_BRAND_ID,
    name: "Ad hoc",
    niche: input.niche,
    offer: input.offer,
    audience: input.audience,
    tone: input.tone,
    primary_goal: input.goal,
    preferred_platforms: input.preferred_platforms ?? ["tiktok"],
    call_to_action_style:
      input.call_to_action_style ?? "DM, comment, or link in bio",
    created_at: new Date().toISOString(),
  };
}
