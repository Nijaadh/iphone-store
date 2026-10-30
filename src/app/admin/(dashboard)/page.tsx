import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatLKR } from "@/lib/format";
import type { Product, ProductStatus } from "@/lib/types";
import DeleteButton from "@/components/admin/DeleteButton";
import { setStatus } from "./actions";

export const metadata = { title: "iPhones | Admin" };

const statusStyles: Record<ProductStatus, string> = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-amber-100 text-amber-800",
  sold: "bg-neutral-200 text-neutral-700",
};

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">iPhones</h1>
          <p className="text-sm text-neutral-500">
            {products.length} in stock list
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Add iPhone
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          Could not load products: {error.message}
        </p>
      )}

      {products.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          No iPhones yet. Click “Add iPhone” to add your first one.
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                    No photo
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-medium">{p.title}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  {p.model} · {p.storage_gb >= 1024 ? "1TB" : `${p.storage_gb}GB`}
                  {p.color ? ` · ${p.color}` : ""} ·{" "}
                  {p.condition === "new"
                    ? "Brand new"
                    : `Used${p.battery_health ? ` · battery ${p.battery_health}%` : ""}`}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatLKR(p.price_lkr)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {p.status === "sold" ? (
                  <form action={setStatus.bind(null, p.id, "available")}>
                    <button className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:bg-neutral-100">
                      Mark available
                    </button>
                  </form>
                ) : (
                  <form action={setStatus.bind(null, p.id, "sold")}>
                    <button className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:bg-neutral-100">
                      Mark sold
                    </button>
                  </form>
                )}
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:bg-neutral-100"
                >
                  Edit
                </Link>
                <DeleteButton id={p.id} title={p.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
