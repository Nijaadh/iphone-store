"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useCart } from "@/lib/cart";
import { formatLKR } from "@/lib/format";
import type { Product } from "@/lib/types";
import type { CheckoutResult } from "@/app/checkout/actions";

const field =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900";
const label = "mb-1 block text-sm font-medium";

export default function CheckoutForm({
  fetchItems,
  placeOrder,
}: {
  fetchItems: (ids: string[]) => Promise<Product[]>;
  placeOrder: (formData: FormData) => Promise<CheckoutResult>;
}) {
  const { ids, ready, remove, clear } = useCart();
  const router = useRouter();
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!ready || ids.length === 0) return;
    let active = true;
    fetchItems(ids).then((rows) => {
      if (active) setItems(rows);
    });
    return () => {
      active = false;
    };
  }, [ids, ready, fetchItems]);

  if (!ready) {
    return <p className="text-sm text-neutral-500">Loading...</p>;
  }

  const rows = (items ?? []).filter((p) => ids.includes(p.id));

  if (ids.length > 0 && rows.length === 0) {
    return <p className="text-sm text-neutral-500">Loading...</p>;
  }

  if (ids.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
        <p className="text-sm text-neutral-500">Your cart is empty.</p>
        <Link href="/shop" className="mt-2 inline-block text-sm underline">
          Browse iPhones
        </Link>
      </div>
    );
  }

  const total = rows
    .filter((p) => p.status === "available")
    .reduce((sum, p) => sum + Number(p.price_lkr), 0);

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("ids", JSON.stringify(ids));
    startTransition(async () => {
      const result = await placeOrder(formData);
      if (result.ok) {
        clear();
        router.push(`/order/${result.orderId}`);
        return;
      }
      setError(result.error);
      result.unavailable?.forEach((id) => remove(id));
    });
  }

  return (
    <form action={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
        <h2 className="font-semibold">Delivery details</h2>

        <div>
          <label htmlFor="customer_name" className={label}>Full name</label>
          <input id="customer_name" name="customer_name" required autoComplete="name" className={field} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={label}>Phone number</label>
            <input
              id="phone"
              name="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="0771234567"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="email" className={label}>
              Email <span className="text-neutral-400">(optional)</span>
            </label>
            <input id="email" name="email" type="email" autoComplete="email" className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="address" className={label}>Delivery address</label>
          <textarea id="address" name="address" rows={3} required autoComplete="street-address" className={field} />
        </div>

        <div>
          <label htmlFor="city" className={label}>City</label>
          <input id="city" name="city" required autoComplete="address-level2" className={field} />
        </div>

        <fieldset>
          <legend className={label}>Payment</legend>
          <label className="flex items-start gap-3 rounded-md border border-neutral-300 p-3 text-sm">
            <input type="radio" name="payment_method" value="cod" defaultChecked className="mt-0.5" />
            <span>
              <span className="font-medium">Cash on delivery</span>
              <span className="block text-xs text-neutral-500">
                Pay when your iPhone is delivered.
              </span>
            </span>
          </label>
          <p className="mt-2 text-xs text-neutral-500">
            Card and wallet payments are coming soon.
          </p>
        </fieldset>
      </div>

      <div className="h-fit rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">Your order</h2>
        <ul className="space-y-2 text-sm">
          {rows.map((p) => (
            <li key={p.id} className="flex justify-between gap-3">
              <span className="min-w-0">
                <span className="line-clamp-2">{p.title}</span>
                {p.status !== "available" && (
                  <span className="block text-xs font-medium text-amber-700">
                    No longer available
                  </span>
                )}
              </span>
              <span className="shrink-0 font-medium">{formatLKR(p.price_lkr)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatLKR(total)}</span>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Placing order..." : "Place order"}
        </button>
        <Link href="/cart" className="mt-3 block text-center text-sm text-neutral-600 underline">
          Back to cart
        </Link>
      </div>
    </form>
  );
}
