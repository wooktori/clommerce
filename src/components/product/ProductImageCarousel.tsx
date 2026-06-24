"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface Props {
  images: string[];
  productId: string;
}

export default function ProductImageCarousel({ images, productId }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  if (images.length === 0) {
    return (
      <Link href={`/products/${productId}`}>
        <div className="aspect-square bg-fill rounded" />
      </Link>
    );
  }

  if (images.length === 1) {
    return (
      <Link href={`/products/${productId}`} className="relative aspect-square block">
        <Image src={images[0]} alt="상품 이미지" fill className="object-cover rounded" />
      </Link>
    );
  }

  return (
    <div className="relative aspect-square group">
      <div ref={emblaRef} className="overflow-hidden rounded h-full">
        <div className="flex h-full">
          {images.map((src, i) => (
            <Link
              key={src}
              href={`/products/${productId}`}
              className="relative flex-[0_0_100%] h-full block"
            >
              <Image src={src} alt={`상품 이미지 ${i + 1}`} fill className="object-cover" />
            </Link>
          ))}
        </div>
      </div>

      <button
        aria-label="이전 이미지"
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
      >
        ‹
      </button>
      <button
        aria-label="다음 이미지"
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
      >
        ›
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((src, i) => (
          <button
            key={src}
            aria-label={`${i + 1}번 이미지로 이동`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`w-1 h-1 rounded-full transition-colors ${
              i === selectedIndex ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
