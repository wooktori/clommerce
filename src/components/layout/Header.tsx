"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/services/auth";

const CATEGORIES = ["전체", "상의", "하의", "아우터", "신발", "악세서리"];

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
    <header className="sticky top-0 z-50 bg-black text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="text-lg font-bold tracking-widest shrink-0">
          CLOMMERCE
        </Link>

        {/* 카테고리 */}
        <nav className="hidden md:flex items-center gap-7">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={cat === "전체" ? "/" : `/?category=${encodeURIComponent(cat)}`}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* 우측 영역 */}
        <div className="flex items-center gap-5">
          {loading ? (
            <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
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
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {profile?.nickname ?? user.email}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-36 bg-white text-black rounded shadow-xl py-1 text-sm">
                      {isSeller ? (
                        <Link
                          href="/seller/products"
                          className="block px-4 py-2 hover:bg-gray-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          상품 관리
                        </Link>
                      ) : (
                        <Link
                          href="/buyer/orders"
                          className="block px-4 py-2 hover:bg-gray-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          구매 내역
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={async () => {
                          setMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  로그인
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-400 hover:text-white transition-colors"
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
