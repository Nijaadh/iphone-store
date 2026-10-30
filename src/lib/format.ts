export function formatLKR(amount: number) {
  return (
    "Rs. " +
    new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(amount)
  );
}
