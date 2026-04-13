import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BrandRow } from "@/lib/types";

export async function listBrands(): Promise<BrandRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BrandRow[];
}

export async function getBrand(id: string): Promise<BrandRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as BrandRow) ?? null;
}
