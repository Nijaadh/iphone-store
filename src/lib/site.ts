// Change the shop name and details here; they are used across the site.
export const site = {
  name: "Phone Store",
  tagline: "Brand new and used iPhones in Sri Lanka",
  currency: "LKR",
  // Put your shop's WhatsApp number here in international form, no spaces
  // or "+" (e.g. "94771234567"). Leave it empty to hide the WhatsApp button.
  whatsapp: "",
};

// Absolute site URL, needed for SEO tags and the sitemap.
// Set NEXT_PUBLIC_SITE_URL once you connect your own domain.
export function siteUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);
  return (fromEnv ?? "http://localhost:3000").replace(/\/$/, "");
}
