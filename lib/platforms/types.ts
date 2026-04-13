import type { Platform, PostRow } from "@/lib/types";

export type PlatformPostPayload = {
  post: Pick<
    PostRow,
    "hook" | "body" | "caption" | "cta" | "video_idea" | "platform"
  >;
  /** Future: media URLs from queued_assets */
  mediaUrls?: string[];
};

export type PlatformPostResult = {
  ok: boolean;
  notImplemented: boolean;
  message: string;
  externalId?: string;
};

export type PlatformPoster = (
  payload: PlatformPostPayload
) => Promise<PlatformPostResult>;

export function assertPlatform(p: string): p is Platform {
  return p === "instagram" || p === "tiktok" || p === "youtube_shorts";
}
