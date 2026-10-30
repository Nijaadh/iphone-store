export type Condition = "new" | "used";
export type ProductStatus = "available" | "reserved" | "sold";

export type Product = {
  id: string;
  title: string;
  model: string;
  storage_gb: number;
  color: string | null;
  condition: Condition;
  battery_health: number | null;
  imei: string | null;
  price_lkr: number;
  description: string | null;
  images: string[];
  status: ProductStatus;
  created_at: string;
};

export type FormState = { error?: string };
