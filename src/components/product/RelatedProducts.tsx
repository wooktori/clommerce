"use client";

import { useRelatedProducts } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";

interface Props {
  category: string;
  excludeId: string;
}

export default function RelatedProducts({ category, excludeId }: Props) {
  const { data: products, isLoading } = useRelatedProducts(category, excludeId);

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xs font-semibold tracking-[0.2em] uppercase text-ink-muted pb-4 mb-6 border-b border-rule">
        연관 상품
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square bg-fill animate-pulse" />
                <div className="h-2.5 w-2/3 bg-fill animate-pulse rounded-xs" />
                <div className="h-2.5 w-1/2 bg-fill animate-pulse rounded-xs" />
              </div>
            ))
          : products!.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}
