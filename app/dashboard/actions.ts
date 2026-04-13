"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ACTIVE_BRAND_COOKIE } from "@/lib/cookies-brand";
import {
  generateAndPersistBatch,
  generateDailyAndPersist,
} from "@/lib/content-engine";
import { updateWinningPatterns } from "@/lib/learning";
import { recordPerformance } from "@/lib/record-performance";
import { getBrand } from "@/lib/brands-repo";
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

export async function runDailyCampaignAction(
  brandId: string,
  generateForLeads: boolean
) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  try {
    const brand = await getBrand(brandId);
    if (!brand) return { ok: false as const, error: "Brand not found" };
    await generateDailyAndPersist(brand, generateForLeads);
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Campaign failed";
    return { ok: false as const, error: message };
  }
}

export async function generateTenAction(
  brandId: string,
  generateForLeads: boolean
) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  try {
    const brand = await getBrand(brandId);
    if (!brand) return { ok: false as const, error: "Brand not found" };
    await generateAndPersistBatch(brand, 10, generateForLeads);
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Batch failed";
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

export async function updatePostMediaAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  const id = String(formData.get("post_id") ?? "");
  const image_url = String(formData.get("image_url") ?? "");
  const video_url = String(formData.get("video_url") ?? "");
  if (!id) return { ok: false as const, error: "post_id required" };
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("posts")
    .update({ image_url, video_url })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
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
    await recordPerformance(post_id, {
      views: num("views"),
      likes: num("likes"),
      comments: num("comments"),
      shares: num("shares"),
      saves: num("saves"),
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
    await updateWinningPatterns(brandId);
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Learning failed";
    return { ok: false as const, error: message };
  }
}
