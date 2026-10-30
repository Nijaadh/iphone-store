import SiteHeader from "@/components/shop/SiteHeader";
import SiteFooter from "@/components/shop/SiteFooter";
import CartView from "@/components/shop/CartView";
import { fetchCartItems } from "./actions";

export const metadata = {
  title: "Your cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-5 text-2xl font-semibold">Your cart</h1>
        <CartView fetchItems={fetchCartItems} />
      </main>
      <SiteFooter />
    </div>
  );
}
