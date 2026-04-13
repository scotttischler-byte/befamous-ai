import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";
import type { Platform, PostStatus } from "@/lib/types";

const CreateSchema = z.object({
  brand_id: z.string().uuid(),
  platform: z.enum(["instagram", "tiktok", "youtube_shorts"]),
  content: z.string().optional().default(""),
  hook: z.string().optional().default(""),
  caption: z.string().optional().default(""),
  cta: z.string().optional().default(""),
  hashtags: z.string().optional().default(""),
  platform_variants: z.record(z.string(), z.unknown()).optional(),
  image_url: z.string().optional().default(""),
  video_url: z.string().optional().default(""),
  generate_for_leads: z.boolean().optional().default(false),
  status: z.enum(["draft", "posted"]).optional().default("draft"),
});

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brand_id");
  const status = searchParams.get("status");

  const supabase = getSupabaseAdmin();
  let q = supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (brandId) q = q.eq("brand_id", brandId);
  if (status && ["draft", "posted"].includes(status)) {
    q = q.eq("status", status as PostStatus);
  }
  const { data, error } = await q.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const input = CreateSchema.parse(await req.json());
    logApi("posts:create", { brand_id: input.brand_id });

    const supabase = getSupabaseAdmin();
    const { data: brand, error: bErr } = await supabase
      .from("brands")
      .select("brand_tag")
      .eq("id", input.brand_id)
      .single();
    if (bErr || !brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        brand_id: input.brand_id,
        brand_tag: brand.brand_tag as string,
        platform: input.platform as Platform,
        content: input.content,
        hook: input.hook,
        caption: input.caption,
        cta: input.cta,
        hashtags: input.hashtags,
        platform_variants: input.platform_variants ?? {},
        image_url: input.image_url,
        video_url: input.video_url,
        generate_for_leads: input.generate_for_leads,
        status: input.status as PostStatus,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ post: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid body";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
