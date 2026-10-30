import Link from "next/link";
import SiteHeader from "@/components/shop/SiteHeader";
import SiteFooter from "@/components/shop/SiteFooter";
import ProductCard from "@/components/shop/ProductCard";
import { listProducts } from "@/lib/products";
import { site } from "@/lib/site";

// Shop pages read live stock from Supabase on every request.
export const instant = false;

export default async function Home() {
  const { products, error } = await listProducts({ sort: "newest" }, 8);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            {site.tagline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600">
            Checked and ready iPhones at honest prices. Browse what is in stock
            right now.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop?condition=new"
              className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Brand new iPhones
            </Link>
            <Link
              href="/shop?condition=used"
              className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-100"
            >
              Used iPhones
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Latest arrivals</h2>
          <Link href="/shop" className="text-sm underline">
            View all
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Could not load iPhones right now. Please try again shortly.
          </p>
        )}

        {products.length === 0 && !error ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
            New stock is coming soon. Please check back later.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
