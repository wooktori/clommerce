"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/types/product";

export default function ShopProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group">
      {/* 이미지 */}
      <div className="relative aspect-3/4 bg-fill overflow-hidden mb-3">
        {product.productImage[0] ? (
          <Link href={`/products/${product.id}`} className="block w-full h-full">
            <Image
              src={product.productImage[0]}
              alt={product.productName}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            />
          </Link>
        ) : (
          <Link
            href={`/products/${product.id}`}
            className="flex w-full h-full items-center justify-center text-2xs text-ink-subtle tracking-widest uppercase"
          >
            No Image
          </Link>
        )}
        <button
          type="button"
          onClick={() => setLiked((prev) => !prev)}
          aria-label="찜하기"
          className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/85 flex items-center justify-center hover:bg-white transition-colors"
        >
          <span className={`text-sm leading-none ${liked ? "text-heading" : "text-ink-subtle"}`}>
            {liked ? "♥" : "♡"}
          </span>
        </button>
      </div>

      {/* 텍스트 */}
      <Link href={`/products/${product.id}`} className="block space-y-1">
        <p className="text-xs font-medium text-ink line-clamp-2 leading-snug group-hover:underline underline-offset-2">
          {product.productName}
        </p>
        <p className="text-sm font-bold text-heading tabular-nums">
          {product.productPrice.toLocaleString()}원
        </p>
        <p className="text-2xs tracking-[0.12em] uppercase text-ink-muted">
          {product.productCategory}
        </p>
      </Link>
    </div>
  );
}
