"use client";

import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import ShopProductCard from "./ShopProductCard";
import { useShopProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";

const PRICE_OPTIONS = [
  { label: "기본순", value: "none" },
  { label: "낮은 가격순", value: "asc" },
  { label: "높은 가격순", value: "desc" },
] as const;
type PriceSort = "none" | "asc" | "desc";

interface ShopPageProps {
  category: string | null;
}

export default function ShopPage({ category }: ShopPageProps) {
  const [search, setSearch] = useState("");
  const [priceSort, setPriceSort] = useState<PriceSort>("none");
  const [priceMenuOpen, setPriceMenuOpen] = useState(false);
  const { ref, inView } = useInView();

  const queryCategory = category && category !== "전체" ? category : null;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useShopProducts(queryCategory);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts: Product[] = useMemo(
    () => data?.pages.flatMap((p) => p.products) ?? [],
    [data]
  );

  const displayed = useMemo(() => {
    let list = allProducts;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.productName.toLowerCase().includes(q));
    }
    if (priceSort === "asc") list = [...list].sort((a, b) => a.productPrice - b.productPrice);
    if (priceSort === "desc") list = [...list].sort((a, b) => b.productPrice - a.productPrice);
    return list;
  }, [allProducts, search, priceSort]);

  const currentPriceLabel =
    PRICE_OPTIONS.find((o) => o.value === priceSort)?.label ?? "기본순";

  return (
    <main className="w-full py-6">
      {/* 검색 + 정렬 — 한 줄 */}
      <div className="flex items-center gap-3 mb-6 border-b border-rule pb-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-subtle"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="어떤 상품을 찾으세요?"
            className="w-full bg-fill rounded-xs pl-9 pr-4 py-2.5 text-xs text-ink focus:outline-none focus:bg-canvas focus:ring-1 focus:ring-rule transition-colors placeholder:text-ink-subtle"
          />
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setPriceMenuOpen((prev) => !prev)}
            className="flex items-center gap-1 text-2xs font-medium text-ink-muted hover:text-ink transition-colors tracking-wide whitespace-nowrap"
          >
            {currentPriceLabel}
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 10 6" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M1 1l4 4 4-4" />
            </svg>
          </button>
          {priceMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-canvas border border-rule shadow-md py-1 z-10">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setPriceSort(opt.value as PriceSort);
                    setPriceMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-2xs tracking-wide hover:bg-fill transition-colors ${
                    priceSort === opt.value ? "font-bold text-heading" : "text-ink"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 상품 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-3/4 bg-fill mb-3 skeleton" />
              <div className="h-3 bg-fill rounded-xs mb-1.5 w-3/4 skeleton" />
              <div className="h-3 bg-fill rounded-xs w-1/2 skeleton" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-32 text-center">
          <p className="text-xs text-ink-muted">
            {search ? `"${search}"에 해당하는 상품이 없습니다.` : "상품이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
          {displayed.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div ref={ref} className="h-10 mt-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <span className="text-2xs text-ink-muted tracking-widest uppercase">Loading</span>
        )}
      </div>
    </main>
  );
}
