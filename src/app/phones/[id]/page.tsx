import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/shop/SiteHeader";
import SiteFooter from "@/components/shop/SiteFooter";
import Gallery from "@/components/shop/Gallery";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { getProduct } from "@/lib/products";
import { formatLKR, storageLabel } from "@/lib/format";
import { site, siteUrl } from "@/lib/site";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "iPhone not found" };

  const condition = product.condition === "new" ? "Brand new" : "Used";
  const title = product.title;
  const description =
    product.description?.slice(0, 160) ??
    `${condition} ${product.model} ${storageLabel(product.storage_gb)} for ${formatLKR(
      product.price_lkr
    )} in Sri Lanka.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl()}/phones/${product.id}` },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      type: "website",
      url: `${siteUrl()}/phones/${product.id}`,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const specs: [string, string][] = [
    ["Model", product.model],
    ["Storage", storageLabel(product.storage_gb)],
    ...(product.color ? ([["Color", product.color]] as [string, string][]) : []),
    ["Condition", product.condition === "new" ? "Brand new" : "Used"],
    ...(product.condition === "used" && product.battery_health
      ? ([["Battery health", `${product.battery_health}%`]] as [string, string][])
      : []),
  ];

  const waText = encodeURIComponent(
    `Hi, I'm interested in the ${product.title} (${formatLKR(product.price_lkr)}).`
  );

  // Helps Google show the price and availability in search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.images.length ? product.images : undefined,
    itemCondition:
      product.condition === "new"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    brand: { "@type": "Brand", name: "Apple" },
    offers: {
      "@type": "Offer",
      price: product.price_lkr,
      priceCurrency: site.currency,
      availability:
        product.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/LimitedAvailability",
      url: `${siteUrl()}/phones/${product.id}`,
    },
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-500">
          <Link href="/shop" className="hover:underline">
            All iPhones
          </Link>
          <span aria-hidden> / </span>
          <span className="text-neutral-700">{product.model}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <Gallery images={product.images} alt={product.title} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-medium">
                {product.condition === "new" ? "Brand new" : "Used"}
              </span>
              {product.status === "reserved" && (
                <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-medium text-white">
                  Reserved
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
              {product.title}
            </h1>
            <p className="mt-2 text-2xl font-bold">
              {formatLKR(product.price_lkr)}
            </p>

            <dl className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200 text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            {product.description && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold">Details</h2>
                <p className="whitespace-pre-line text-sm text-neutral-700">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {product.status === "available" ? (
                <AddToCartButton id={product.id} />
              ) : (
                <span className="rounded-md border border-amber-300 bg-amber-50 px-6 py-3 text-sm font-medium text-amber-800">
                  Reserved — ask us about it
                </span>
              )}
              {site.whatsapp ? (
                <a
                  href={`https://wa.me/${site.whatsapp}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700"
                >
                  Ask on WhatsApp
                </a>
              ) : null}
              <Link
                href="/shop"
                className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-100"
              >
                Keep browsing
              </Link>
            </div>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
