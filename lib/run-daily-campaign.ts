import { generateCampaignPackage } from "@/lib/campaign-engine";
import { persistCampaignPackage } from "@/lib/campaign-persist";
import { getBrand } from "@/lib/brands-repo";
import type { Platform } from "@/lib/types";

export type RunDailyInput = {
  brandId: string;
  platform?: Platform;
  offer?: string;
  audience?: string;
  tone?: string;
  goal?: string;
};

export async function executeRunDailyCampaign(input: RunDailyInput) {
  const brand = await getBrand(input.brandId);
  if (!brand) throw new Error("Brand not found");

  const platform =
    input.platform ??
    (brand.preferred_platforms[0] as Platform | undefined) ??
    "tiktok";

  const pack = await generateCampaignPackage({
    brand,
    platform,
    offer: input.offer ?? brand.offer,
    audience: input.audience ?? brand.audience,
    tone: input.tone ?? brand.tone,
    goal: input.goal ?? brand.primary_goal,
  });

  const saved = await persistCampaignPackage(brand.id, pack);
  return { package: pack, ...saved };
}
