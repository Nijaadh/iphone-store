import { site } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-500">
        <p className="font-medium text-neutral-700">{site.name}</p>
        <p>{site.tagline}</p>
      </div>
    </footer>
  );
}
