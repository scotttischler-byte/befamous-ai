import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";
import type { PostStatus } from "@/lib/types";

const PatchSchema = z.object({
  status: z.enum(["draft", "posted"]).optional(),
  image_url: z.string().optional(),
  video_url: z.string().optional(),
  hook: z.string().optional(),
  caption: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.string().optional(),
  content: z.string().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { id } = await ctx.params;
  try {
    const patch = PatchSchema.parse(await req.json());
    logApi("posts:patch", { id, keys: Object.keys(patch) });

    const supabase = getSupabaseAdmin();
    const updates: Record<string, unknown> = {};
    if (patch.status !== undefined) updates.status = patch.status as PostStatus;
    if (patch.image_url !== undefined) updates.image_url = patch.image_url;
    if (patch.video_url !== undefined) updates.video_url = patch.video_url;
    if (patch.hook !== undefined) updates.hook = patch.hook;
    if (patch.caption !== undefined) updates.caption = patch.caption;
    if (patch.cta !== undefined) updates.cta = patch.cta;
    if (patch.hashtags !== undefined) updates.hashtags = patch.hashtags;
    if (patch.content !== undefined) updates.content = patch.content;

    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ post: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
