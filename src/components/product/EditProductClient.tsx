"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { getProduct } from "@/services/product";
import { Product } from "@/types/product";
import ProductForm from "./ProductForm";
import { ProductFormData } from "@/services/product";

export default function EditProductClient({
  productId,
}: {
  productId: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { mutateAsync: update, isPending: isUpdating } = useUpdateProduct();
  const { mutateAsync: remove, isPending: isDeleting } = useDeleteProduct();

  useEffect(() => {
    getProduct(productId).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [productId]);

  async function handleSubmit(
    data: Partial<ProductFormData>,
    newImageFiles: File[],
    removedImageUrls: string[]
  ) {
    if (!user) return;
    await update({ id: productId, sellerId: user.uid, data, newImageFiles, removedImageUrls });
    router.push("/seller/products");
  }

  async function handleDelete() {
    if (!user) return;
    await remove({ id: productId, sellerId: user.uid });
    router.push("/seller/products");
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 rounded" />
      ))}
    </div>;
  }

  if (!product) {
    return <p className="text-gray-500 text-sm">상품을 찾을 수 없습니다.</p>;
  }

  return (
    <div>
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        loading={isUpdating}
      />

      <div className="mt-6 pt-6 border-t border-gray-200">
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            이 상품 삭제
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-700">정말 삭제하시겠습니까?</p>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
