import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../../actions";

export const metadata = { title: "Add iPhone | Admin" };

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Add iPhone</h1>
      <ProductForm action={createProduct} submitLabel="Add iPhone" />
    </div>
  );
}
