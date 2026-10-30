"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function AddToCartButton({ id }: { id: string }) {
  const { has, add, ready } = useCart();

  if (ready && has(id)) {
    return (
      <Link
        href="/cart"
        className="rounded-md border border-neutral-900 px-6 py-3 text-sm font-medium hover:bg-neutral-100"
      >
        In cart — view cart
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => add(id)}
      disabled={!ready}
      className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
    >
      Add to cart
    </button>
  );
}
