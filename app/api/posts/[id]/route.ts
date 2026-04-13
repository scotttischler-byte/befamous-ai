import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { logApi } from "@/lib/log";
import type { PostStatus } from "@/lib/types";

const PatchSchema = z.object({
  status: z.enum(["draft", "posted", "archived"]).optional(),
  queued_asset_id: z.string().uuid().nullable().optional(),
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
    logApi("posts:patch", { id, ...patch });

    const supabase = getSupabaseAdmin();
    const updates: Record<string, unknown> = {};
    if (patch.status !== undefined) updates.status = patch.status as PostStatus;
    if (patch.queued_asset_id !== undefined) {
      updates.queued_asset_id = patch.queued_asset_id;
    }

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
