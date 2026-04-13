import { NextResponse } from "next/server";

/** Phase 8 stub — TikTok Content Posting API not wired yet. */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      stub: true,
      message:
        "TikTok posting is not implemented. Wire TikTok developer Content Posting API here.",
    },
    { status: 501 }
  );
}
