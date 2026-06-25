"use client";

import { useEffect } from "react";

export default function ErrorPage({
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
        문제가 발생했습니다
      </h1>
      <p className="text-xs text-ink-muted mb-8 max-w-sm leading-relaxed">
        예기치 않은 오류입니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={unstable_retry}
        className="h-10 px-6 bg-brand text-white text-xs font-semibold tracking-[0.08em] hover:opacity-85 transition-opacity"
      >
        다시 시도
      </button>
    </main>
  );
}
