import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CampaignItem, CampaignPackage } from "@/lib/types";
import { randomUUID } from "crypto";

export async function persistCampaignPackage(
  brandId: string,
  pack: CampaignPackage
): Promise<{ batch_id: string; inserted: number }> {
  const supabase = getSupabaseAdmin();
  const batch_id = randomUUID();

  const rows = pack.items.map((item: CampaignItem) => ({
    brand_id: brandId,
    generation_batch_id: batch_id,
    content_bucket: item.content_bucket,
    platform: item.platform,
    hook: item.hook,
    body: item.body,
    caption: item.caption,
    cta: item.cta,
    video_idea: item.video_idea,
    lead_magnet_idea: item.lead_magnet_idea,
    item_kind: item.item_kind,
    status: "draft" as const,
  }));

  const { error } = await supabase.from("posts").insert(rows);
  if (error) throw error;

  return { batch_id, inserted: rows.length };
}
