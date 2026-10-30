// Admin pages are private and always rendered per request (they read the
// login session), so they opt out of prerendering instead of using Suspense.
export const instant = false;

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
