"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

interface Props {
  product: Product;
  sellerName: string;
}

export default function ProductDetailClient({ product, sellerName }: Props) {
  const [mainIdx, setMainIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  const add = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.openCart);
  const inCart = useCartStore((s) => s.items.some((i) => i.productId === product.id));

  const images = product.productImage;
  const THUMB_LIMIT = 4;

  const dec = () => setQuantity((q) => Math.max(1, q - 1));
  const inc = () => setQuantity((q) => Math.min(product.productQuantity, q + 1));

  const handleAddToCart = () => {
    add({
      productId: product.id,
      name: product.productName,
      image: product.productImage[0] ?? "",
      price: product.productPrice,
      quantity,
      maxQuantity: product.productQuantity,
    });
  };

  return (
    <main className="w-full px-4 sm:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-10 mb-14">
        {/* 이미지 갤러리 */}
        <div className="md:w-[44%] shrink-0">
          {/* 메인 이미지 */}
          <div className="relative aspect-square bg-fill mb-2.5 overflow-hidden">
            {images[mainIdx] ? (
              <Image
                src={images[mainIdx]}
                alt={product.productName}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex w-full h-full items-center justify-center text-2xs text-ink-subtle tracking-widest uppercase">
                No Image
              </div>
            )}
          </div>

          {/* 썸네일 */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.slice(0, THUMB_LIMIT).map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMainIdx(i)}
                  className={`relative w-16 h-16 bg-fill shrink-0 border-2 transition-colors ${
                    mainIdx === i ? "border-brand" : "border-transparent hover:border-rule"
                  }`}
                >
                  <Image src={src} alt={`이미지 ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
              {images.length > THUMB_LIMIT && (
                <button
                  type="button"
                  onClick={() => setMainIdx(THUMB_LIMIT)}
                  className="w-16 h-16 bg-fill shrink-0 flex items-center justify-center text-2xs font-medium text-ink-muted hover:bg-fill-hover transition-colors"
                >
                  +{images.length - THUMB_LIMIT}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex-1 min-w-0">
          {sellerName && (
            <p className="text-2xs tracking-[0.15em] uppercase text-ink-muted mb-3">
              {sellerName}
            </p>
          )}

          <h1 className="text-xl font-bold text-heading leading-snug mb-4">
            {product.productName}
          </h1>

          <p className="text-2xl font-bold text-heading tabular-nums mb-6">
            ₩ {product.productPrice.toLocaleString()}
          </p>

          <hr className="border-rule mb-6" />

          {/* 수량 */}
          <div className="mb-8">
            <p className="text-2xs font-semibold tracking-[0.15em] uppercase text-ink-muted mb-3">
              수량
            </p>
            <div className="inline-flex items-center">
              <button
                type="button"
                onClick={dec}
                disabled={quantity <= 1}
                className="w-9 h-9 border border-rule flex items-center justify-center text-base text-ink hover:bg-fill transition-colors disabled:opacity-40"
              >
                −
              </button>
              <div className="w-11 h-9 border-t border-b border-rule flex items-center justify-center text-xs font-medium text-heading select-none tabular-nums">
                {quantity}
              </div>
              <button
                type="button"
                onClick={inc}
                disabled={quantity >= product.productQuantity}
                className="w-9 h-9 border border-rule flex items-center justify-center text-base text-ink hover:bg-fill transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLiked((prev) => !prev)}
              aria-label="찜하기"
              className={`w-11 h-11 border flex items-center justify-center text-base transition-colors shrink-0 ${
                liked
                  ? "border-heading text-heading"
                  : "border-rule text-ink-muted hover:border-ink-muted hover:text-ink"
              }`}
            >
              {liked ? "♥" : "♡"}
            </button>
            {inCart ? (
              <button
                type="button"
                onClick={openCart}
                className="flex-1 h-11 border border-brand text-xs font-semibold tracking-[0.08em] text-brand hover:bg-brand hover:text-white transition-colors"
              >
                장바구니 보기
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-11 border border-rule text-xs font-semibold tracking-[0.08em] text-heading hover:bg-fill transition-colors"
              >
                장바구니
              </button>
            )}
            <button
              type="button"
              className="flex-1 h-11 bg-brand text-white text-xs font-semibold tracking-[0.08em] hover:opacity-85 transition-opacity"
            >
              바로 구매
            </button>
          </div>
        </div>
      </div>

      {/* 상품 상세 설명 */}
      <div>
        <h2 className="text-2xs font-semibold tracking-[0.2em] uppercase text-ink-muted pb-4 mb-6 border-b border-rule">
          상품 상세 설명
        </h2>
        {product.productDescription ? (
          <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">
            {product.productDescription}
          </p>
        ) : (
          <p className="text-xs text-ink-muted">상세 설명이 없습니다.</p>
        )}
      </div>
    </main>
  );
}
