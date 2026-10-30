import SiteHeader from "@/components/shop/SiteHeader";
import SiteFooter from "@/components/shop/SiteFooter";
import CheckoutForm from "@/components/shop/CheckoutForm";
import { fetchCartItems } from "../cart/actions";
import { placeOrder } from "./actions";

export const metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-5 text-2xl font-semibold">Checkout</h1>
        <CheckoutForm fetchItems={fetchCartItems} placeOrder={placeOrder} />
      </main>
      <SiteFooter />
    </div>
  );
}
