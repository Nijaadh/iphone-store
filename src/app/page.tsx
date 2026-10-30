import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">{site.name}</h1>
      <p className="text-lg text-neutral-600">{site.tagline}</p>
      <p className="text-sm text-neutral-500">Setup complete. Shop pages coming soon.</p>
    </main>
  );
}
