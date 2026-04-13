import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
return NextResponse.json({
status: "OK",
supabase_url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
supabase_anon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
supabase_service: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
openai: Boolean(process.env.OPENAI_API_KEY),
});
}
