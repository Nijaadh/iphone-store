import Image from "next/image";
import Link from "next/link";
import { formatLKR, storageLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product: p }: { product: Product }) {
  const details = [storageLabel(p.storage_gb), p.color].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/phones/${p.id}`}
      className="block overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-neutral-400 hover:shadow-sm"
    >
      <div className="relative aspect-square bg-neutral-100">
        {p.images[0] ? (
          <Image
            src={p.images[0]}
            alt={p.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            No photo
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium">
          {p.condition === "new" ? "Brand new" : "Used"}
        </span>
        {p.status === "reserved" && (
          <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
            Reserved
          </span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium">{p.title}</h3>
        <p className="text-xs text-neutral-500">
          {p.model}
          {details ? ` · ${details}` : ""}
        </p>
        {p.condition === "used" && p.battery_health ? (
          <p className="text-xs text-neutral-500">Battery {p.battery_health}%</p>
        ) : null}
        <p className="pt-1 text-base font-semibold">{formatLKR(p.price_lkr)}</p>
      </div>
    </Link>
  );
}
