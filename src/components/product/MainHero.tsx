"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useShopProducts } from "@/hooks/useProducts";

export default function MainHero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const { data, isLoading } = useShopProducts(null);
  const products = data?.pages[0]?.products?.slice(0, 9) ?? [];

  if (isLoading) {
    return (
      <div className="w-full flex overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-none basis-full sm:basis-1/2 lg:basis-1/3 h-84 sm:h-96 lg:h-120 skeleton" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="relative w-full bg-fill">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex-none basis-full sm:basis-1/2 lg:basis-1/3 group/card block"
            >
              <div className="relative h-84 sm:h-96 lg:h-120 overflow-hidden">
                {product.productImage[0] ? (
                  <Image
                    src={product.productImage[0]}
                    alt={product.productName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 3}
                  />
                ) : (
                  <div className="w-full h-full bg-fill flex items-center justify-center">
                    <span className="text-2xs text-ink-subtle tracking-widest uppercase">No Image</span>
                  </div>
                )}

                {/* 하단 텍스트 오버레이 — hover 시 표시 */}
                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/0 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <p className="text-white text-xs font-medium leading-snug line-clamp-2 mb-1.5">
                      {product.productName}
                    </p>
                    <p className="text-white/60 text-2xs tabular-nums tracking-wide">
                      ₩ {product.productPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Prev 버튼 */}
      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/85 hover:bg-white flex items-center justify-center shadow-md transition-colors"
        aria-label="이전 슬라이드"
      >
        <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Next 버튼 */}
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/85 hover:bg-white flex items-center justify-center shadow-md transition-colors"
        aria-label="다음 슬라이드"
      >
        <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </section>
  );
}
