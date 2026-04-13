"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ACTIVE_BRAND_COOKIE } from "@/lib/cookies-brand";
import { executeRunDailyCampaign } from "@/lib/run-daily-campaign";
import { recordMetricsAndScore } from "@/lib/score-single-post";
import { refreshLearningForBrand } from "@/lib/learning-pipeline";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function setActiveBrandAction(brandId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_BRAND_COOKIE, brandId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  revalidatePath("/dashboard");
}

export async function runDailyCampaignAction(brandId: string) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  try {
    await executeRunDailyCampaign({ brandId });
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Campaign failed";
    return { ok: false as const, error: message };
  }
}

export async function markPostedAction(postId: string) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("posts")
    .update({ status: "posted" })
    .eq("id", postId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function attachAssetToPostAction(
  postId: string,
  assetId: string | null
) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("posts")
    .update({ queued_asset_id: assetId })
    .eq("id", postId);
  if (error) return { ok: false as const, error: error.message };
  if (assetId) {
    await supabase
      .from("queued_assets")
      .update({ status: "attached" })
      .eq("id", assetId);
  }
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function submitMetricsAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  const post_id = String(formData.get("post_id") ?? "");
  if (!post_id) return { ok: false as const, error: "post_id required" };
  const num = (k: string) => Number(formData.get(k) ?? 0);
  try {
    await recordMetricsAndScore({
      post_id,
      views: num("views"),
      likes: num("likes"),
      comments: num("comments"),
      shares: num("shares"),
      saves: num("saves"),
      followers_gained: num("followers_gained"),
      leads_generated: num("leads_generated"),
      posted_at: (formData.get("posted_at") as string) || null,
    });
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Metrics failed";
    return { ok: false as const, error: message };
  }
}

export async function refreshLearningAction(brandId: string) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  try {
    await refreshLearningForBrand(brandId);
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Learning failed";
    return { ok: false as const, error: message };
  }
}

export async function queueAssetAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  const brand_id = String(formData.get("brand_id") ?? "");
  const asset_url = String(formData.get("asset_url") ?? "");
  const asset_name = String(formData.get("asset_name") ?? "");
  const asset_type = String(formData.get("asset_type") ?? "image");
  if (!brand_id || !asset_url || !asset_name) {
    return { ok: false as const, error: "brand, url, and name required" };
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("queued_assets").insert({
    brand_id,
    asset_type: asset_type as "image" | "video" | "other",
    asset_url,
    asset_name,
    status: "queued",
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}
