"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import type { FormState, ProductStatus } from "@/lib/types";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const productSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  model: z.string().trim().min(2, "Model is required"),
  storage_gb: z.coerce.number().int().positive("Pick the storage size"),
  color: z.string().trim().optional(),
  condition: z.enum(["new", "used"]),
  battery_health: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(100).optional()
  ),
  imei: z.string().trim().optional(),
  price_lkr: z.coerce.number().min(0, "Price must be 0 or more"),
  description: z.string().trim().optional(),
  status: z.enum(["available", "reserved", "sold"]),
  images: z.array(z.string().url()).max(10, "Maximum 10 photos"),
});

function parseProductForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  let images: unknown = [];
  try {
    images = JSON.parse(String(raw.images ?? "[]"));
  } catch {
    images = [];
  }
  return productSchema.safeParse({ ...raw, images });
}

function toRow(data: z.infer<typeof productSchema>) {
  return {
    title: data.title,
    model: data.model,
    storage_gb: data.storage_gb,
    color: data.color || null,
    condition: data.condition,
    battery_health:
      data.condition === "used" ? (data.battery_health ?? null) : null,
    imei: data.imei || null,
    price_lkr: data.price_lkr,
    description: data.description || null,
    images: data.images,
    status: data.status,
  };
}

function firstError(error: z.ZodError) {
  const issue = error.issues[0];
  const field = issue.path.length ? `${issue.path.join(".")}: ` : "";
  return `${field}${issue.message}`;
}

export async function createProduct(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase.from("products").insert(toRow(parsed.data));
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateProduct(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase
    .from("products")
    .update(toRow(parsed.data))
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function setStatus(id: string, status: ProductStatus) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireAdmin();

  const { data: product } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // Best effort: remove the photos from storage too.
  const marker = "/phone-images/";
  const paths = ((product?.images as string[] | undefined) ?? [])
    .map((url) => {
      const i = url.indexOf(marker);
      return i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : null;
    })
    .filter((p): p is string => !!p);
  if (paths.length) {
    await supabase.storage.from("phone-images").remove(paths);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}
