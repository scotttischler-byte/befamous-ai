import type { PlatformPostPayload, PlatformPostResult } from "./types";

const ENV_HINT = "META_ACCESS_TOKEN / IG_USER_ID (future)";

export async function postInstagramContent(
  _payload: PlatformPostPayload
): Promise<PlatformPostResult> {
  return {
    ok: false,
    notImplemented: true,
    message: `Instagram Graph API not wired. Configure ${ENV_HINT} in a future iteration.`,
  };
}
