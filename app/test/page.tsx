import Link from "next/link";

export const dynamic = "force-dynamic";

export default function TestPage() {
  const supabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabaseService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const openai = Boolean(process.env.OPENAI_API_KEY);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 font-mono text-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
        BeFamous · env check
      </p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">/test</h1>
      <p className="mt-6 whitespace-pre-line text-neutral-800 dark:text-neutral-200">
        {`Status: OK
SUPABASE_URL: ${supabaseUrl}
SUPABASE_ANON: ${supabaseAnon}
SUPABASE_SERVICE: ${supabaseService}
OPENAI: ${openai}`}
      </p>
      <Link
        href="/"
        className="mt-10 inline-block text-blue-600 underline dark:text-blue-400"
      >
        ← Home
      </Link>
    </main>
  );
}
