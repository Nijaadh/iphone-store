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

export type PaymentMethod = "cod" | "payhere";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  payment_method: PaymentMethod;
  payment_status: "pending" | "paid" | "failed";
  status: OrderStatus;
  total_lkr: number;
  created_at: string;
};
