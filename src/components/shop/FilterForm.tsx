import Link from "next/link";
import { storageLabel } from "@/lib/format";
import type { ShopFilters } from "@/lib/products";

const field =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900";
const label = "mb-1 block text-xs font-medium text-neutral-600";

// A plain GET form: filters live in the URL, so pages are shareable and SEO friendly.
export default function FilterForm({
  filters,
  models,
  storages,
}: {
  filters: ShopFilters;
  models: string[];
  storages: number[];
}) {
  return (
    <form
      method="get"
      action="/shop"
      className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <div>
        <label htmlFor="condition" className={label}>Condition</label>
        <select id="condition" name="condition" defaultValue={filters.condition ?? ""} className={field}>
          <option value="">All</option>
          <option value="new">Brand new</option>
          <option value="used">Used</option>
        </select>
      </div>

      <div>
        <label htmlFor="model" className={label}>Model</label>
        <select id="model" name="model" defaultValue={filters.model ?? ""} className={field}>
          <option value="">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="storage" className={label}>Storage</label>
        <select id="storage" name="storage" defaultValue={filters.storage ? String(filters.storage) : ""} className={field}>
          <option value="">Any</option>
          {storages.map((s) => (
            <option key={s} value={s}>{storageLabel(s)}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="min" className={label}>Min price (Rs.)</label>
        <input id="min" name="min" type="number" min={0} step="1000" defaultValue={filters.min ?? ""} className={field} />
      </div>

      <div>
        <label htmlFor="max" className={label}>Max price (Rs.)</label>
        <input id="max" name="max" type="number" min={0} step="1000" defaultValue={filters.max ?? ""} className={field} />
      </div>

      <div>
        <label htmlFor="sort" className={label}>Sort by</label>
        <select id="sort" name="sort" defaultValue={filters.sort ?? "newest"} className={field}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-6">
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Apply filters
        </button>
        <Link href="/shop" className="text-sm text-neutral-600 underline">
          Reset
        </Link>
      </div>
    </form>
  );
}
