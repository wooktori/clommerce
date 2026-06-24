"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { getProduct } from "@/services/product";
import { Product } from "@/types/product";
import ProductForm from "./ProductForm";
import { ProductFormData } from "@/services/product";

function DeleteModal({
  productName,
  onConfirm,
  onCancel,
  isPending,
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-danger text-2xl font-bold leading-none">!</span>
        </div>
        <h2 className="text-lg font-bold text-heading mb-2">상품을 삭제할까요?</h2>
        <p className="text-sm text-ink mb-1">
          &apos;{productName}&apos; 상품이 영구 삭제됩니다.
        </p>
        <p className="text-xs text-ink-muted mb-8">
          연결된 이미지도 Cloud Storage에서 함께 삭제됩니다.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 h-12 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-fill transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-12 bg-danger text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPending ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditProductClient({ productId }: { productId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutateAsync: update, isPending: isUpdating } = useUpdateProduct();
  const { mutateAsync: remove, isPending: isDeleting } = useDeleteProduct();

  useEffect(() => {
    getProduct(productId).then((p) => {
      setProduct(p);
      setFetchLoading(false);
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

  if (fetchLoading) {
    return (
      <div className="animate-pulse flex flex-col gap-5">
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-24 h-24 bg-fill rounded" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-fill rounded w-16 mb-2" />
            <div className="h-11 bg-fill rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!product) {
    return <p className="text-sm text-ink-muted text-center py-20">상품을 찾을 수 없습니다.</p>;
  }

  return (
    <>
      <ProductForm
        title="상품 수정"
        submitLabel="수정 완료"
        initialData={product}
        onSubmit={handleSubmit}
        loading={isUpdating}
        headerExtra={
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 border border-danger text-danger text-sm font-medium rounded-lg hover:bg-danger-bg transition-colors"
          >
            삭제
          </button>
        }
      />

      {showDeleteModal && (
        <DeleteModal
          productName={product.productName}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}
