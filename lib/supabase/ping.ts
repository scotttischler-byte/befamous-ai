import { createClient } from "@supabase/supabase-js";
import { isSupabaseEnvReady } from "@/lib/env-check";

export type SupabasePingResult =
  | { connected: true; message: string }
  | { connected: false; message: string };

/** Network check — does not use cached admin client. */
export async function pingSupabase(): Promise<SupabasePingResult> {
  if (!isSupabaseEnvReady()) {
    return {
      connected: false,
      message: "not configured (missing or placeholder env)",
    };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.from("brands").select("id").limit(1);
    if (error) {
      return {
        connected: false,
        message: `db error: ${error.message}`,
      };
    }
    return { connected: true, message: "connected" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return { connected: false, message: msg };
  }
}
