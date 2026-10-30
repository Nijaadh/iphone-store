import Link from "next/link";
import { site } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {site.name}
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/shop" className="hover:underline">
            All iPhones
          </Link>
          <Link href="/shop?condition=new" className="hover:underline">
            Brand new
          </Link>
          <Link href="/shop?condition=used" className="hover:underline">
            Used
          </Link>
        </nav>
      </div>
    </header>
  );
}
