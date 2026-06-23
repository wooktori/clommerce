"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useCreateProduct } from "@/hooks/useProducts";
import ProductForm from "./ProductForm";
import { ProductFormData } from "@/services/product";

export default function NewProductClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateProduct();

  async function handleSubmit(data: ProductFormData, imageFiles: File[]) {
    if (!user) return;
    await mutateAsync({ sellerId: user.uid, data, imageFiles });
    router.push("/seller/products");
  }

  return <ProductForm onSubmit={handleSubmit} loading={isPending} />;
}
