"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink() {
  const { ids, ready } = useCart();
  const count = ready ? ids.length : 0;

  return (
    <Link href="/cart" className="relative hover:underline">
      Cart
      {count > 0 && (
        <span className="ml-1 rounded-full bg-neutral-900 px-1.5 py-0.5 text-xs font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
