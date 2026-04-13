import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { bgeLog } from "@/lib/bge-log";
import { isSupabaseEnvReady } from "@/lib/env-check";

let cached: SupabaseClient | null = null;
let warnedMissingSupabase = false;

/** Safe: null + warning when env is not usable (no throw). */
export function tryGetSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseEnvReady()) {
    if (!warnedMissingSupabase) {
      warnedMissingSupabase = true;
      bgeLog(
        "warn",
        "Supabase admin not initialized (missing URL or SUPABASE_SERVICE_ROLE_KEY, or placeholders in .env.local)"
      );
    }
    return null;
  }
  try {
    return getSupabaseAdmin();
  } catch (e) {
    bgeLog("error", "Supabase admin client failed to initialize", e);
    return null;
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseEnvReady()) {
    throw new Error(
      "Supabase env not ready: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (real values, not placeholders)"
    );
  }
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** True only when URL + service role are present and not example placeholders. */
export function isSupabaseConfigured(): boolean {
  return isSupabaseEnvReady();
}
