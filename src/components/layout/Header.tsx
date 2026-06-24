"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/services/auth";

const CATEGORIES = ["전체", "의류", "리빙", "가전"];

export default function Header() {
  const { user, profile, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSeller = profile?.isSeller;

  return (
    <>
      {/* 브랜드 바 */}
      <header className="sticky top-0 z-50 bg-brand border-b border-white/10">
        <div className="w-full px-6 h-11 flex items-center justify-between">
          <Link
            href="/"
            className="text-white text-xs font-bold tracking-[0.25em] uppercase hover:opacity-80 transition-opacity"
          >
            CLOMMERCE
          </Link>

          <div className="flex items-center gap-5">
            {loading ? (
              <div className="h-2 w-14 bg-white/20 rounded-xs animate-pulse" />
            ) : (
              <>
                {!isSeller && (
                  <Link href="/buyer/cart" aria-label="장바구니">
                    <CartIcon />
                  </Link>
                )}

                {user ? (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen((prev) => !prev)}
                      className="text-2xs text-white/70 hover:text-white transition-colors tracking-wide"
                    >
                      {profile?.nickname ?? user.email}
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-36 bg-white text-ink border border-rule shadow-lg py-1 text-2xs">
                        {isSeller ? (
                          <Link
                            href="/seller/products"
                            className="block px-4 py-2.5 hover:bg-fill transition-colors tracking-wide"
                            onClick={() => setMenuOpen(false)}
                          >
                            상품 관리
                          </Link>
                        ) : (
                          <Link
                            href="/buyer/orders"
                            className="block px-4 py-2.5 hover:bg-fill transition-colors tracking-wide"
                            onClick={() => setMenuOpen(false)}
                          >
                            구매 내역
                          </Link>
                        )}
                        <hr className="my-1 border-rule" />
                        <button
                          onClick={async () => {
                            setMenuOpen(false);
                            await logout();
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-fill text-danger transition-colors tracking-wide"
                        >
                          로그아웃
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-2xs text-white/70 hover:text-white transition-colors tracking-wide"
                  >
                    로그인
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* 카테고리 바 */}
      <nav className="sticky top-11 z-40 bg-canvas border-b border-rule">
        <div className="w-full px-6 h-8 flex items-center gap-7">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={cat === "전체" ? "/" : `/?category=${encodeURIComponent(cat)}`}
              className="text-2xs tracking-[0.15em] uppercase text-ink-muted hover:text-ink transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-white/60 hover:text-white transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}
