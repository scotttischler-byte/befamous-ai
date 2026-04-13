import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ACTIVE_BRAND_COOKIE } from "@/lib/cookies-brand";
import { logApi } from "@/lib/log";

const BodySchema = z.object({
  brand_id: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const { brand_id } = BodySchema.parse(await req.json());
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_BRAND_COOKIE, brand_id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
    logApi("brands:active", { brand_id });
    return NextResponse.json({ ok: true, brand_id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid body";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
