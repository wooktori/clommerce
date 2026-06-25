"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/types/cart";

export default function CartDrawer() {
  const { items, isOpen, closeCart, remove, updateQty } = useCartStore();

  const totalPrice = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={closeCart}
          aria-hidden
        />
      )}

      {/* 드로어 */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-canvas z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="장바구니"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-rule shrink-0">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-bold text-heading tracking-tight">
              장바구니
            </h2>
            {items.length > 0 && (
              <span className="text-2xs text-ink-muted tabular-nums">
                {items.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="닫기"
            className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 상품 목록 */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <CartEmptyIcon />
            <p className="text-xs text-ink-muted">장바구니가 비어있습니다.</p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-rule">
            {items.map((item) => (
              <CartRow
                key={item.productId}
                item={item}
                onRemove={() => remove(item.productId)}
                onUpdateQty={(qty) => updateQty(item.productId, qty)}
              />
            ))}
          </ul>
        )}

        {/* 푸터 */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-rule px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xs tracking-[0.12em] uppercase text-ink-muted">
                합계
              </span>
              <span className="text-base font-bold text-heading tabular-nums">
                ₩ {totalPrice.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              className="w-full h-11 bg-brand text-white text-xs font-semibold tracking-[0.08em] hover:opacity-85 transition-opacity"
            >
              구매하기
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CartRow({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  return (
    <li className="flex gap-3 px-6 py-4">
      {/* 썸네일 */}
      <div className="relative w-16 h-16 bg-fill shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xs text-ink-subtle">
            없음
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-ink line-clamp-2 leading-snug">
            {item.name}
          </p>
          <button
            type="button"
            onClick={onRemove}
            aria-label="삭제"
            className="shrink-0 text-ink-subtle hover:text-danger transition-colors mt-0.5"
          >
            <RemoveIcon />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* 수량 조절 */}
          <div className="inline-flex items-center border border-rule">
            <button
              type="button"
              onClick={() => onUpdateQty(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-ink hover:bg-fill transition-colors disabled:opacity-40 text-sm"
            >
              −
            </button>
            <span className="w-8 h-7 flex items-center justify-center text-2xs font-medium text-heading tabular-nums border-x border-rule">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
              className="w-7 h-7 flex items-center justify-center text-ink hover:bg-fill transition-colors disabled:opacity-40 text-sm"
            >
              +
            </button>
          </div>

          {/* 소계 */}
          <p className="text-xs font-bold text-heading tabular-nums">
            ₩ {(item.price * item.quantity).toLocaleString()}
          </p>
        </div>
      </div>
    </li>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

function CartEmptyIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className="text-ink-subtle"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M2 2l10 10M12 2L2 12" />
    </svg>
  );
}
