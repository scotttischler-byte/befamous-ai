import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";
import type {
  ContentBucket,
  Platform,
  PostItemKind,
  PostStatus,
} from "@/lib/types";

const CreateSchema = z.object({
  brand_id: z.string().uuid(),
  content_bucket: z.enum([
    "authority",
    "story",
    "education",
    "controversy",
    "conversion",
  ]),
  platform: z.enum(["instagram", "tiktok", "youtube_shorts"]),
  hook: z.string().optional().default(""),
  body: z.string().optional().default(""),
  caption: z.string().optional().default(""),
  cta: z.string().optional().default(""),
  video_idea: z.string().optional().default(""),
  lead_magnet_idea: z.string().optional().default(""),
  item_kind: z
    .enum([
      "hook",
      "caption",
      "cta",
      "video_idea",
      "lead_post",
      "conversion_post",
      "ad_script",
      "lead_magnet",
      "post",
    ])
    .optional()
    .default("post"),
  queued_asset_id: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "posted", "archived"]).optional().default("draft"),
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
  if (status && ["draft", "posted", "archived"].includes(status)) {
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
    const { data, error } = await supabase
      .from("posts")
      .insert({
        brand_id: input.brand_id,
        content_bucket: input.content_bucket as ContentBucket,
        platform: input.platform as Platform,
        hook: input.hook,
        body: input.body,
        caption: input.caption,
        cta: input.cta,
        video_idea: input.video_idea,
        lead_magnet_idea: input.lead_magnet_idea,
        item_kind: input.item_kind as PostItemKind,
        queued_asset_id: input.queued_asset_id,
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
