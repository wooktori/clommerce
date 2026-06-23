"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { useSellerProducts } from "@/hooks/useProducts";

export default function SellerProductList() {
  const { user } = useAuth();
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSellerProducts(user?.uid ?? "");

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = data?.pages.flatMap((p) => p.products) ?? [];
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">내 상품 목록</h1>
        <Link
          href="/seller/products/new"
          className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          + 상품 등록
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded mb-1" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-20">
          등록한 상품이 없습니다.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/seller/products/${product.id}/edit`}
            className="group"
          >
            <div className="relative aspect-square bg-gray-100 rounded overflow-hidden mb-2">
              {product.productImage[0] && (
                <Image
                  src={product.productImage[0]}
                  alt={product.productName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              )}
            </div>
            <p className="text-sm font-medium truncate">
              {product.productName}
            </p>
            <p className="text-sm text-gray-500">
              {product.productPrice.toLocaleString()}원
            </p>
            <p className="text-xs text-gray-400">
              재고 {product.productQuantity}개
            </p>
          </Link>
        ))}
      </div>

      <div ref={ref} className="h-10 flex items-center justify-center mt-4">
        {isFetchingNextPage && (
          <span className="text-sm text-gray-400">불러오는 중...</span>
        )}
      </div>
    </div>
  );
}
