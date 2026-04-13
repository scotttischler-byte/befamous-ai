import { NextResponse } from "next/server";

/** Phase 8 stub — Meta Graph API posting not wired yet. */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      stub: true,
      message:
        "Instagram posting is not implemented. Connect Meta Graph API + media containers here.",
    },
    { status: 501 }
  );
}
