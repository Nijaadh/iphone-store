"use server";

import { listProductsByIds } from "@/lib/products";
import type { Product } from "@/lib/types";

// The cart lives in the browser, so the server looks the phones up on demand.
export async function fetchCartItems(ids: string[]): Promise<Product[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const rows = await listProductsByIds(ids.slice(0, 20));
  // Keep the shopper's own order.
  return ids
    .map((id) => rows.find((r) => r.id === id))
    .filter((p): p is Product => !!p);
}
