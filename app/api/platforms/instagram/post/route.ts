import { NextResponse } from "next/server";
import { z } from "zod";
import { postInstagramContent } from "@/lib/platforms/instagram";
import type { PlatformPostPayload } from "@/lib/platforms/types";

const BodySchema = z.object({
  hook: z.string().optional(),
  body: z.string().optional(),
  caption: z.string().optional(),
  cta: z.string().optional(),
  video_idea: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const parsed = BodySchema.parse(await req.json());
    const payload: PlatformPostPayload = {
      post: {
        hook: parsed.hook ?? "",
        body: parsed.body ?? "",
        caption: parsed.caption ?? "",
        cta: parsed.cta ?? "",
        video_idea: parsed.video_idea ?? "",
        platform: "instagram",
      },
    };
    const result = await postInstagramContent(payload);
    return NextResponse.json(result, { status: result.notImplemented ? 501 : 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid body";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
