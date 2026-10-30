import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { Product } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "../../../actions";

export const metadata = { title: "Edit iPhone | Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Edit iPhone</h1>
      <ProductForm
        action={updateProduct.bind(null, id)}
        product={data as Product}
        submitLabel="Save changes"
      />
    </div>
  );
}
