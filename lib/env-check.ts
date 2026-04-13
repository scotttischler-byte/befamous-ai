/**
 * Central env validation — avoids treating example values as "configured".
 */

function trim(s: string | undefined): string {
  return (s ?? "").trim();
}

export function isPlaceholderSupabaseUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (!u) return true;
  if (u.includes("your_project")) return true;
  if (u.includes("placeholder")) return true;
  if (!u.startsWith("http")) return true;
  return false;
}

export function isPlaceholderServiceRoleKey(key: string): boolean {
  const k = key.trim();
  if (!k) return true;
  if (k === "your_service_role_key") return true;
  if (k.includes("...")) return true;
  /** Real service_role JWTs are typically 100+ chars */
  if (k.length < 40) return true;
  return false;
}

export function isPlaceholderAnonKey(key: string): boolean {
  const k = key.trim();
  if (!k) return true;
  if (k === "your_anon_key") return true;
  if (k.includes("...")) return true;
  if (k.length < 40) return true;
  return false;
}

export function isPlaceholderOpenAIKey(key: string): boolean {
  const k = key.trim();
  if (!k) return true;
  if (k === "sk-..." || k.startsWith("sk-...")) return true;
  if (!k.startsWith("sk-")) return true;
  if (k.length < 20) return true;
  return false;
}

export type SupabaseEnvIssue = "missing_url" | "missing_service_key" | "placeholder";

export function getSupabaseEnvIssues(): SupabaseEnvIssue[] {
  const url = trim(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = trim(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const issues: SupabaseEnvIssue[] = [];
  if (!url) issues.push("missing_url");
  if (!key) issues.push("missing_service_key");
  if (url && key && (isPlaceholderSupabaseUrl(url) || isPlaceholderServiceRoleKey(key))) {
    issues.push("placeholder");
  }
  return issues;
}

export function isSupabaseEnvReady(): boolean {
  return getSupabaseEnvIssues().length === 0;
}

export type OpenAIEnvIssue = "missing" | "placeholder";

export function getOpenAIEnvIssues(): OpenAIEnvIssue[] {
  const k = trim(process.env.OPENAI_API_KEY);
  const issues: OpenAIEnvIssue[] = [];
  if (!k) issues.push("missing");
  else if (isPlaceholderOpenAIKey(k)) issues.push("placeholder");
  return issues;
}

export function isOpenAIEnvReady(): boolean {
  return getOpenAIEnvIssues().length === 0;
}

export type AnonEnvIssue = "missing" | "placeholder";

export function getAnonEnvIssues(): AnonEnvIssue[] {
  const k = trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const issues: AnonEnvIssue[] = [];
  if (!k) issues.push("missing");
  else if (isPlaceholderAnonKey(k)) issues.push("placeholder");
  return issues;
}

/** Anon key is optional for server-only flows; "ready" when usable for browser client. */
export function isAnonEnvReady(): boolean {
  return getAnonEnvIssues().length === 0;
}

export type EnvDashboardStatus = {
  supabase: {
    ready: boolean;
    issues: SupabaseEnvIssue[];
    labels: string[];
  };
  openai: {
    ready: boolean;
    issues: OpenAIEnvIssue[];
    labels: string[];
  };
  anon: {
    ready: boolean;
    issues: AnonEnvIssue[];
    labels: string[];
  };
};

function issueLabels(): EnvDashboardStatus {
  const sIssues = getSupabaseEnvIssues();
  const oIssues = getOpenAIEnvIssues();
  const aIssues = getAnonEnvIssues();

  const sLabels = sIssues.map((i) => {
    if (i === "missing_url") return "NEXT_PUBLIC_SUPABASE_URL is empty";
    if (i === "missing_service_key") return "SUPABASE_SERVICE_ROLE_KEY is empty";
    return "Replace placeholder Supabase URL or service role key in .env.local";
  });

  const oLabels = oIssues.map((i) =>
    i === "missing"
      ? "OPENAI_API_KEY is empty"
      : "Replace placeholder OPENAI_API_KEY (must start with sk- and be a real key)"
  );

  const aLabels = aIssues.map((i) =>
    i === "missing"
      ? "NEXT_PUBLIC_SUPABASE_ANON_KEY is empty (optional for server; needed for browser client)"
      : "Replace placeholder NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );

  return {
    supabase: { ready: sIssues.length === 0, issues: sIssues, labels: sLabels },
    openai: { ready: oIssues.length === 0, issues: oIssues, labels: oLabels },
    anon: { ready: aIssues.length === 0, issues: aIssues, labels: aLabels },
  };
}

export function getEnvDashboardStatus(): EnvDashboardStatus {
  return issueLabels();
}
