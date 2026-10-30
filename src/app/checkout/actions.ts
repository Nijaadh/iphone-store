"use server";

import { z } from "zod";
import { createSecretClient } from "@/lib/supabase/admin";
import { UUID_RE } from "@/lib/uuid";

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your name"),
  // Sri Lankan mobile/landline, with or without +94.
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+?94|0)?[1-9]\d{8}$/,
      "Please enter a valid phone number, e.g. 0771234567"
    ),
  email: z.union([z.literal(""), z.string().email("Please check your email")]),
  address: z.string().trim().min(5, "Please enter your delivery address"),
  city: z.string().trim().min(2, "Please enter your city"),
  payment_method: z.enum(["cod"], {
    message: "Only cash on delivery is available right now",
  }),
  ids: z.array(z.string().regex(UUID_RE, "Invalid item in cart")).min(1, "Your cart is empty").max(20),
});

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string; unavailable?: string[] };

export async function placeOrder(formData: FormData): Promise<CheckoutResult> {
  let ids: unknown = [];
  try {
    ids = JSON.parse(String(formData.get("ids") ?? "[]"));
  } catch {
    ids = [];
  }

  const parsed = checkoutSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    ids,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const input = parsed.data;

  const supabase = createSecretClient();

  // Prices and availability are re-read here: never trust what the browser sent.
  const { data: rows, error: readError } = await supabase
    .from("products")
    .select("id, price_lkr, status")
    .in("id", input.ids);
  if (readError) {
    return { ok: false, error: "Could not reach the store. Please try again." };
  }

  const products = rows ?? [];
  const unavailable = input.ids.filter(
    (id) => !products.some((p) => p.id === id && p.status === "available")
  );
  if (unavailable.length > 0) {
    return {
      ok: false,
      error:
        unavailable.length === input.ids.length
          ? "Those iPhones have just been taken. Please pick another one."
          : "One of the iPhones in your cart has just been taken. Please remove it and try again.",
      unavailable,
    };
  }

  const total = products.reduce((sum, p) => sum + Number(p.price_lkr), 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customer_name,
      phone: input.phone,
      email: input.email || null,
      address: input.address,
      city: input.city,
      payment_method: input.payment_method,
      total_lkr: total,
    })
    .select("id")
    .single();
  if (orderError || !order) {
    return { ok: false, error: "Could not save your order. Please try again." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    products.map((p) => ({
      order_id: order.id,
      product_id: p.id,
      price_lkr: p.price_lkr,
    }))
  );
  if (itemsError) {
    // Don't leave a half-written order behind.
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "Could not save your order. Please try again." };
  }

  // Hold the phones so nobody else can order the same unit. Only flip rows that
  // are still available, so two shoppers can't both reserve one phone.
  await supabase
    .from("products")
    .update({ status: "reserved" })
    .in("id", input.ids)
    .eq("status", "available");

  return { ok: true, orderId: order.id };
}
