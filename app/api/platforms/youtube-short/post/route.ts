import { NextResponse } from "next/server";

/** Phase 8 stub — YouTube Data API Shorts upload not wired yet. */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      stub: true,
      message:
        "YouTube Shorts posting is not implemented. Use YouTube Data API resumable upload here.",
    },
    { status: 501 }
  );
}
