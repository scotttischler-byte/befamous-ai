import type { PlatformPostPayload, PlatformPostResult } from "./types";

const ENV_HINT = "TIKTOK_CLIENT_KEY / OAuth (future)";

export async function postTikTokContent(
  _payload: PlatformPostPayload
): Promise<PlatformPostResult> {
  return {
    ok: false,
    notImplemented: true,
    message: `TikTok Content Posting API not wired. Configure ${ENV_HINT} later.`,
  };
}
