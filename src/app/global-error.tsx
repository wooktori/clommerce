"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f4f7fd" }}>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8b9ab1", marginBottom: "1rem" }}>
            오류 발생
          </p>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a2332", marginBottom: "0.75rem" }}>
            서비스에 문제가 생겼습니다
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#8b9ab1", marginBottom: "2rem", maxWidth: "20rem" }}>
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={unstable_retry}
            style={{
              height: "2.5rem",
              padding: "0 1.5rem",
              background: "#4570b2",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              border: "none",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
