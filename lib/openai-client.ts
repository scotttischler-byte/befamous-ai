import OpenAI from "openai";
import { bgeLog } from "@/lib/bge-log";
import { isOpenAIEnvReady } from "@/lib/env-check";

let client: OpenAI | null = null;
let warnedMissingOpenAI = false;

/** Safe: returns null if key missing or placeholder — logs once per process. */
export function getOpenAISafe(): OpenAI | null {
  if (!isOpenAIEnvReady()) {
    if (!warnedMissingOpenAI) {
      warnedMissingOpenAI = true;
      bgeLog("warn", "OpenAI client not initialized (missing or placeholder OPENAI_API_KEY)");
    }
    return null;
  }
  const key = process.env.OPENAI_API_KEY!.trim();
  if (!client) {
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

/** Strict: throws if OpenAI is not configured (for code paths that require the API). */
export function getOpenAI(): OpenAI {
  const c = getOpenAISafe();
  if (!c) {
    throw new Error("Missing or invalid OPENAI_API_KEY");
  }
  return c;
}
