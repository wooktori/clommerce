"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/services/auth";
import { useCartStore } from "@/store/cartStore";

const CATEGORIES = ["전체", "의류", "리빙", "가전"];

export default function Header() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const totalCount = useCartStore((s) => s.items.length);
  const openCart = useCartStore((s) => s.openCart);

  function handleCartClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    openCart();
  }

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
        <div className="w-full px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-white text-sm font-bold tracking-[0.25em] uppercase hover:opacity-80 transition-opacity"
          >
            CLOMMERCE
          </Link>

          <div className="flex items-center gap-5">
            {loading ? (
              <div className="h-2 w-14 bg-white/20 rounded-xs animate-pulse" />
            ) : (
              <>
                {!isSeller && (
                  <button
                    type="button"
                    onClick={handleCartClick}
                    aria-label={`장바구니${totalCount > 0 ? ` (${totalCount}개)` : ""}`}
                    className="relative"
                  >
                    <CartIcon />
                    {totalCount > 0 && (
                      <span
                        suppressHydrationWarning
                        className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 px-0.75 rounded-full bg-white text-brand text-[9px] font-bold leading-3.5 text-center tabular-nums"
                      >
                        {totalCount > 99 ? "99+" : totalCount}
                      </span>
                    )}
                  </button>
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
                          <>
                            <Link
                              href="/seller/products"
                              className="block px-4 py-2.5 hover:bg-fill transition-colors tracking-wide"
                              onClick={() => setMenuOpen(false)}
                            >
                              상품 관리
                            </Link>
                            <Link
                              href="/seller/orders"
                              className="block px-4 py-2.5 hover:bg-fill transition-colors tracking-wide"
                              onClick={() => setMenuOpen(false)}
                            >
                              주문 관리
                            </Link>
                          </>
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
      <nav className="sticky top-14 z-40 bg-canvas border-b border-rule">
        <div className="w-full px-8 h-11 flex items-center gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={cat === "전체" ? "/" : `/?category=${encodeURIComponent(cat)}`}
              className="text-xs tracking-[0.15em] uppercase text-ink-muted hover:text-ink transition-colors"
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
      className="h-5 w-5 text-white/60 hover:text-white transition-colors"
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
