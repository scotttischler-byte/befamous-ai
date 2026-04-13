import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Platform, PostStatus } from "@/lib/types";

const PostBody = z.object({
  content_text: z.string().default(""),
  hook: z.string().default(""),
  platform: z.enum(["instagram", "tiktok", "youtube_shorts"]),
  status: z.enum(["draft", "posted"]).default("draft"),
});

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = PostBody.parse(await req.json());
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        content_text: body.content_text,
        hook: body.hook,
        platform: body.platform as Platform,
        status: body.status as PostStatus,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid body";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
