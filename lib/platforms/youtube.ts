import type { PlatformPostPayload, PlatformPostResult } from "./types";

const ENV_HINT = "GOOGLE_OAUTH / YouTube Data API v3 (future)";

export async function postYouTubeShortContent(
  _payload: PlatformPostPayload
): Promise<PlatformPostResult> {
  return {
    ok: false,
    notImplemented: true,
    message: `YouTube Shorts upload not wired. Configure ${ENV_HINT} later.`,
  };
}
