import Link from "next/link";
import SiteHeader from "@/components/shop/SiteHeader";
import SiteFooter from "@/components/shop/SiteFooter";
import ProductCard from "@/components/shop/ProductCard";
import FilterForm from "@/components/shop/FilterForm";
import { listFilterOptions, listProducts, parseFilters } from "@/lib/products";

export const instant = false;
export const metadata = {
  title: "Shop iPhones",
  description: "Browse brand new and used iPhones in Sri Lanka.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const [{ products, error }, options] = await Promise.all([
    listProducts(filters),
    listFilterOptions(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-semibold">
          {filters.condition === "new"
            ? "Brand new iPhones"
            : filters.condition === "used"
              ? "Used iPhones"
              : "All iPhones"}
        </h1>
        <p className="mb-5 text-sm text-neutral-500">
          {products.length} {products.length === 1 ? "iPhone" : "iPhones"} found
        </p>

        <FilterForm
          filters={filters}
          models={options.models}
          storages={options.storages}
        />

        <div className="mt-6">
          {error && (
            <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              Could not load iPhones right now. Please try again shortly.
            </p>
          )}

          {products.length === 0 && !error ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
              <p>No iPhones match these filters.</p>
              <Link href="/shop" className="mt-2 inline-block underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
