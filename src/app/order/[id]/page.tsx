import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/shop/SiteHeader";
import SiteFooter from "@/components/shop/SiteFooter";
import { createSecretClient } from "@/lib/supabase/admin";
import { formatLKR } from "@/lib/format";
import { site } from "@/lib/site";
import type { Order, Product } from "@/lib/types";
import { isUuid } from "@/lib/uuid";

export const instant = false;
export const metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = createSecretClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();

  const { data: itemRows } = await supabase
    .from("order_items")
    .select("price_lkr, products(id, title)")
    .eq("order_id", id);

  const items = (itemRows ?? []) as unknown as {
    price_lkr: number;
    products: Pick<Product, "id" | "title"> | null;
  }[];
  const o = order as Order;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm font-medium text-green-700">Order placed</p>
          <h1 className="mt-1 text-2xl font-semibold">
            Thank you, {o.customer_name.split(" ")[0]}!
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            We will call you on {o.phone} to confirm delivery. Keep this page
            link if you want to check your order again.
          </p>

          <dl className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200 text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-neutral-500">Order number</dt>
              <dd className="font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-neutral-500">Payment</dt>
              <dd className="font-medium">
                {o.payment_method === "cod" ? "Cash on delivery" : "Card / wallet"}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-neutral-500">Deliver to</dt>
              <dd className="max-w-[60%] text-right font-medium">
                {o.address}, {o.city}
              </dd>
            </div>
          </dl>

          <ul className="mt-5 space-y-2 text-sm">
            {items.map((item, i) => (
              <li key={item.products?.id ?? i} className="flex justify-between gap-3">
                <span>{item.products?.title ?? "iPhone"}</span>
                <span className="shrink-0 font-medium">
                  {formatLKR(Number(item.price_lkr))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatLKR(Number(o.total_lkr))}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {site.whatsapp ? (
              <a
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
                  `Hi, I placed order ${o.id.slice(0, 8).toUpperCase()}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
              >
                Message us on WhatsApp
              </a>
            ) : null}
            <Link
              href="/shop"
              className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-100"
            >
              Keep browsing
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
