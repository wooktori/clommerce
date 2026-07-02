"use client";

import { useEffect, useState } from "react";
import { useToastStore } from "@/store/toastStore";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { useSellerProducts, useDeleteProduct } from "@/hooks/useProducts";
import { formatShortDate } from "@/lib/date";
import Spinner from "@/components/ui/Spinner";

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-12 h-12 bg-fill shrink-0">
      {src ? (
        <>
          {!loaded && <div className="absolute inset-0 skeleton" />}
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onLoad={() => setLoaded(true)}
          />
        </>
      ) : (
        <div className="flex w-full h-full items-center justify-center text-2xs text-ink-subtle">
          없음
        </div>
      )}
    </div>
  );
}

export default function SellerProductList() {
  const { user } = useAuth();
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSellerProducts(user?.uid ?? "");
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const showToast = useToastStore((s) => s.show);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = data?.pages.flatMap((p) => p.products) ?? [];
  const totalCount = products.length;

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteId || !user?.uid) return;
    deleteProduct(
      { id: pendingDeleteId, sellerId: user.uid },
      {
        onSuccess: () => {
          setPendingDeleteId(null);
          showToast("상품이 삭제되었습니다.", "success");
        },
        onError: () => {
          setPendingDeleteId(null);
          showToast("삭제에 실패했습니다.", "error");
        },
      }
    );
  };

  return (
    <>
      <div className="bg-canvas border border-rule overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div>
            <h1 className="text-base font-bold text-heading">상품 관리</h1>
            {!isLoading && (
              <p className="text-2xs text-ink-muted mt-0.5 tracking-wide">
                최신순 · {totalCount}개
              </p>
            )}
          </div>
          <Link
            href="/seller/products/new"
            className="bg-brand text-white text-2xs font-semibold tracking-widest uppercase px-4 py-2.5 hover:opacity-85 transition-opacity whitespace-nowrap"
          >
            + 등록
          </Link>
        </div>

        {/* 컬럼 헤더 */}
        <div className="grid grid-cols-[1fr_88px_96px] sm:grid-cols-[1fr_120px_72px_96px] px-6 py-2.5 border-t border-b border-rule bg-fill">
          <span className="text-2xs tracking-widest uppercase text-ink-muted">상품</span>
          <span className="text-2xs tracking-widest uppercase text-ink-muted">가격</span>
          <span className="hidden sm:block text-2xs tracking-widest uppercase text-ink-muted">등록일</span>
          <span className="text-2xs tracking-widest uppercase text-ink-muted">관리</span>
        </div>

        {/* 로딩 스켈레톤 */}
        {isLoading && (
          <ul>
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="grid grid-cols-[1fr_88px_96px] sm:grid-cols-[1fr_120px_72px_96px] items-center px-6 py-4 border-b border-rule"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-fill shrink-0 skeleton" />
                  <div className="h-3 bg-fill rounded-xs w-32 skeleton" />
                </div>
                <div className="h-3 bg-fill rounded-xs w-20 skeleton" />
                <div className="hidden sm:block h-3 bg-fill rounded-xs w-10 skeleton" />
                <div className="flex gap-2">
                  <div className="h-7 w-12 bg-fill rounded-xs skeleton" />
                  <div className="h-7 w-12 bg-fill rounded-xs skeleton" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 빈 상태 */}
        {!isLoading && products.length === 0 && (
          <p className="text-xs text-ink-muted text-center py-20">
            등록한 상품이 없습니다.
          </p>
        )}

        {/* 상품 목록 */}
        {!isLoading && products.length > 0 && (
          <ul>
            {products.map((product) => {
              const date = formatShortDate(product.createdAt);

              return (
                <li
                  key={product.id}
                  className="grid grid-cols-[1fr_88px_96px] sm:grid-cols-[1fr_120px_72px_96px] items-center px-6 py-4 border-b border-rule last:border-b-0 hover:bg-fill/60 transition-colors"
                >
                  {/* 상품명 + 썸네일 */}
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductThumbnail src={product.productImage[0]} alt={product.productName} />
                    <Link
                      href={`/products/${product.id}`}
                      className="text-xs font-medium text-brand hover:underline truncate"
                    >
                      {product.productName}
                    </Link>
                  </div>

                  {/* 가격 */}
                  <p className="text-xs font-bold text-heading tabular-nums">
                    ₩ {product.productPrice.toLocaleString()}
                  </p>

                  {/* 등록일 */}
                  <p className="hidden sm:block text-2xs text-ink-muted tabular-nums">{date}</p>

                  {/* 관리 버튼 */}
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="px-2.5 py-1.5 text-2xs font-medium border border-rule text-ink hover:bg-fill transition-colors"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(product.id)}
                      disabled={isDeleting}
                      className="px-2.5 py-1.5 text-2xs font-medium border border-rule text-danger hover:bg-danger-bg transition-colors disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* 무한 스크롤 트리거 */}
        <div ref={ref} className="h-10 flex items-center justify-center">
          {isFetchingNextPage && <Spinner size="sm" />}
        </div>
      </div>

      {/* 삭제 확인 토스트 */}
      {pendingDeleteId && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-5 bg-heading text-white shadow-xl px-6 py-3.5">
          <span className="text-xs">이 상품을 삭제하시겠습니까?</span>
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-2 hover:no-underline disabled:opacity-50 transition-all"
          >
            {isDeleting ? <Spinner size="sm" /> : "삭제"}
          </button>
          <button
            onClick={() => setPendingDeleteId(null)}
            className="text-2xs text-white/50 hover:text-white transition-colors"
          >
            취소
          </button>
        </div>
      )}

    </>
  );
}
