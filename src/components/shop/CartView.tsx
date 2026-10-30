"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatLKR, storageLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function CartView({
  fetchItems,
}: {
  fetchItems: (ids: string[]) => Promise<Product[]>;
}) {
  const { ids, ready, remove } = useCart();
  const [items, setItems] = useState<Product[] | null>(null);

  // Prices and availability always come fresh from the database, never from
  // whatever was stored in the browser.
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
    return <p className="text-sm text-neutral-500">Loading your cart...</p>;
  }

  // Keep the list in step with the cart while a refetch is in flight.
  const rows = (items ?? []).filter((p) => ids.includes(p.id));

  if (ids.length > 0 && rows.length === 0) {
    return <p className="text-sm text-neutral-500">Loading your cart...</p>;
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

  const available = rows.filter((p) => p.status === "available");
  const unavailable = rows.filter((p) => p.status !== "available");
  const total = available.reduce((sum, p) => sum + Number(p.price_lkr), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ul className="space-y-3 lg:col-span-2">
        {rows.map((p) => {
          const gone = p.status !== "available";
          return (
            <li
              key={p.id}
              className={`flex gap-3 rounded-xl border bg-white p-3 ${
                gone ? "border-amber-300" : "border-neutral-200"
              }`}
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {p.images[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/phones/${p.id}`}
                  className="line-clamp-2 text-sm font-medium hover:underline"
                >
                  {p.title}
                </Link>
                <p className="text-xs text-neutral-500">
                  {p.model} · {storageLabel(p.storage_gb)} ·{" "}
                  {p.condition === "new" ? "Brand new" : "Used"}
                </p>
                {gone && (
                  <p className="mt-1 text-xs font-medium text-amber-700">
                    No longer available — remove it to continue
                  </p>
                )}
                <p className="mt-1 text-sm font-semibold">
                  {formatLKR(p.price_lkr)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="self-start text-xs text-red-600 underline"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>

      <div className="h-fit rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">Order summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">
              {available.length} {available.length === 1 ? "iPhone" : "iPhones"}
            </dt>
            <dd className="font-medium">{formatLKR(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Delivery</dt>
            <dd className="text-neutral-500">Confirmed after order</dd>
          </div>
        </dl>
        <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatLKR(total)}</span>
        </div>

        {unavailable.length > 0 ? (
          <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
            Remove the unavailable {unavailable.length === 1 ? "item" : "items"}{" "}
            above to continue to checkout.
          </p>
        ) : (
          <Link
            href="/checkout"
            className="mt-4 block rounded-md bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
          >
            Continue to checkout
          </Link>
        )}
        <Link
          href="/shop"
          className="mt-3 block text-center text-sm text-neutral-600 underline"
        >
          Keep browsing
        </Link>
      </div>
    </div>
  );
}
