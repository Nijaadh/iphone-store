export function formatLKR(amount: number) {
  return (
    "Rs. " +
    new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(amount)
  );
}

export function storageLabel(gb: number) {
  return gb >= 1024 ? `${gb / 1024}TB` : `${gb}GB`;
}
