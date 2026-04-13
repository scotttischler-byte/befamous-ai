import { createBrowserClient } from "@supabase/ssr";
import {
  isAnonEnvReady,
  isSupabaseEnvReady,
} from "@/lib/env-check";

export function createSupabaseBrowserClient():
  | ReturnType<typeof createBrowserClient>
  | null {
  if (!isSupabaseEnvReady() || !isAnonEnvReady()) {
    return null;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
  );
}

export function isBrowserSupabaseConfigured(): boolean {
  return isSupabaseEnvReady() && isAnonEnvReady();
}
