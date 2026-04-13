import { NextResponse } from "next/server";
import { z } from "zod";
import { generateViralContent } from "@/lib/generate-content-core";

const BodySchema = z.object({
  niche: z.string().min(1).max(500),
  goal: z.string().min(1).max(500),
  tone: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = BodySchema.parse(json);
    const pack = await generateViralContent(input);
    return NextResponse.json(pack);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    const status = message.includes("parse") || message.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
