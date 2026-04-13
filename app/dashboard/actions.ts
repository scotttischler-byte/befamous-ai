"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { bgeLog } from "@/lib/bge-log";
import { ACTIVE_BRAND_COOKIE } from "@/lib/cookies-brand";
import {
  generateAndPersistBatch,
  generateAndPersistMvaDaily,
  generateBatchContent,
  generateDailyAndPersist,
} from "@/lib/content-engine";
import type { BrandTag } from "@/lib/types";
import { analyzeTopPosts, updateWinningPatterns } from "@/lib/learning";
import { generateVideoFromScript } from "@/lib/video-engine";
import { getBrand, getBrandByTag } from "@/lib/brands-repo";
import { recordPerformance } from "@/lib/record-performance";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

/** Temp test: 5 MVA ads in-memory only (no persist). */
export async function generateFiveMvaTestAction() {
  try {
    const drafts = await generateBatchContent("MVA", 5, {});
    return { ok: true as const, drafts };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return { ok: false as const, error: message };
  }
}

/** 10 demo posts for a vertical — no DB required; mock if OpenAI missing. */
export async function generateDemoVerticalAction(tag: BrandTag) {
  try {
    const drafts = await generateBatchContent(tag, 10, {});
    bgeLog("info", "Dashboard instant generate finished", {
      tag,
      count: drafts.length,
    });
    return { ok: true as const, drafts };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    bgeLog("error", "Dashboard instant generate failed", { tag, message, e });
    return { ok: false as const, error: message };
  }
}

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

/** Persist 10 MVA ads (autonomous pipeline). */
export async function generateTenMvaAdsPersistAction() {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  try {
    const r = await generateAndPersistMvaDaily(true);
    revalidatePath("/dashboard");
    return { ok: true as const, inserted: r.inserted };
  } catch (e) {
    const message = e instanceof Error ? e.message : "MVA batch failed";
    return { ok: false as const, error: message };
  }
}

/** Latest MVA drafts → CapCut-oriented JSON (manual assembly). */
export async function exportLatestMvaVideoPlanAction() {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  try {
    const supabase = getSupabaseAdmin();
    const brand = await getBrandByTag("MVA");
    if (!brand) return { ok: false as const, error: "MVA brand not found" };
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    const exports = (posts ?? []).map((row) => {
      const script = String(row.script || row.content || "");
      const vp = row.visual_plan as string[] | null;
      const visual_plan = Array.isArray(vp) ? vp : [];
      return generateVideoFromScript({
        hook: String(row.hook || ""),
        script,
        caption: String(row.caption || ""),
        cta: String(row.cta || ""),
        visual_plan,
      });
    });
    return { ok: true as const, exports };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    return { ok: false as const, error: message };
  }
}

export async function listTopPerformersAction(brandId: string) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }
  try {
    const analyzed = await analyzeTopPosts(brandId);
    const items = analyzed.slice(0, 15).map((a) => ({
      id: a.post.id,
      hook: a.post.hook,
      score: Math.round(a.score * 100) / 100,
      captionPreview: a.post.caption.slice(0, 100),
    }));
    return { ok: true as const, items };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load";
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
      conversion_estimate: num("conversion_estimate"),
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
