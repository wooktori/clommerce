"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProductErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center">
      <p className="text-2xs tracking-[0.2em] uppercase text-ink-muted mb-4">
        오류 발생
      </p>
      <h1 className="text-xl font-bold text-heading mb-3">
        상품 정보를 불러오지 못했습니다
      </h1>
      <p className="text-xs text-ink-muted mb-8 max-w-sm leading-relaxed">
        일시적인 오류입니다. 다시 시도하거나 목록으로 돌아가 주세요.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={unstable_retry}
          className="h-10 px-6 bg-brand text-white text-xs font-semibold tracking-[0.08em] hover:opacity-85 transition-opacity"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="h-10 px-6 border border-rule flex items-center text-xs font-semibold tracking-[0.08em] text-heading hover:bg-fill transition-colors"
        >
          목록으로
        </Link>
      </div>
    </main>
  );
}
