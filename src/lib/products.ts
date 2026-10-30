import { createPublicClient } from "@/lib/supabase/public";
import type { Condition, Product } from "@/lib/types";
import { isUuid } from "@/lib/uuid";

export type SortKey = "newest" | "price_asc" | "price_desc";

export type ShopFilters = {
  condition?: Condition;
  model?: string;
  storage?: number;
  min?: number;
  max?: number;
  sort?: SortKey;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

const toNumber = (v: string | undefined) => {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

// Turns ?condition=used&min=100000 ... into a safe, validated filter object.
export function parseFilters(params: RawParams): ShopFilters {
  const condition = first(params.condition);
  const sort = first(params.sort);
  const model = first(params.model)?.trim();
  const storage = toNumber(first(params.storage));

  return {
    condition: condition === "new" || condition === "used" ? condition : undefined,
    model: model || undefined,
    storage: storage && storage > 0 ? storage : undefined,
    min: toNumber(first(params.min)),
    max: toNumber(first(params.max)),
    sort:
      sort === "price_asc" || sort === "price_desc" ? sort : "newest",
  };
}

// Sold phones are hidden from the shop; reserved ones stay visible with a badge.
const VISIBLE = ["available", "reserved"];

export async function listProducts(
  filters: ShopFilters = {},
  limit = 60
): Promise<{ products: Product[]; error?: string }> {
  const supabase = createPublicClient();
  let query = supabase.from("products").select("*").in("status", VISIBLE);

  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.model) query = query.eq("model", filters.model);
  if (filters.storage) query = query.eq("storage_gb", filters.storage);
  if (filters.min !== undefined) query = query.gte("price_lkr", filters.min);
  if (filters.max !== undefined) query = query.lte("price_lkr", filters.max);

  if (filters.sort === "price_asc") {
    query = query.order("price_lkr", { ascending: true });
  } else if (filters.sort === "price_desc") {
    query = query.order("price_lkr", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(limit);
  if (error) return { products: [], error: error.message };
  return { products: (data ?? []) as Product[] };
}

// Models and storage sizes that actually exist in stock, for the filter dropdowns.
export async function listFilterOptions(): Promise<{
  models: string[];
  storages: number[];
}> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("model, storage_gb")
    .in("status", VISIBLE);

  const rows = data ?? [];
  const models = [...new Set(rows.map((r) => r.model as string))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
  const storages = [...new Set(rows.map((r) => r.storage_gb as number))].sort(
    (a, b) => a - b
  );
  return { models, storages };
}

export async function getProduct(id: string): Promise<Product | null> {
  // Guard: Postgres errors on a malformed uuid, so reject bad ids early.
  if (!isUuid(id)) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .in("status", VISIBLE)
    .maybeSingle();
  return (data as Product | null) ?? null;
}

export async function listProductsForSitemap(): Promise<
  { id: string; created_at: string }[]
> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("id, created_at")
    .in("status", VISIBLE)
    .order("created_at", { ascending: false })
    .limit(1000);
  return (data ?? []) as { id: string; created_at: string }[];
}

// Used by the cart: the phones the shopper picked, with current price and status.
export async function listProductsByIds(ids: string[]): Promise<Product[]> {
  const valid = ids.filter(isUuid);
  if (valid.length === 0) return [];

  const supabase = createPublicClient();
  const { data } = await supabase.from("products").select("*").in("id", valid);
  return (data ?? []) as Product[];
}
