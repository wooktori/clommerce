"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useBuyerOrders, useCancelOrder } from "@/hooks/useOrders";
import { Order, OrderStatus, ORDER_STATUS, ORDER_STATUS_LABEL } from "@/types/order";
import { formatDate } from "@/lib/date";

function StatusBadge({ status }: { status: OrderStatus }) {
  const label = ORDER_STATUS_LABEL[status];

  if (status === ORDER_STATUS.SHIPPING) {
    return (
      <span className="inline-block px-3 py-1.5 rounded text-xs font-medium bg-heading text-white whitespace-nowrap">
        {label}
      </span>
    );
  }
  if (status === ORDER_STATUS.CANCELLED) {
    return (
      <span className="inline-block px-3 py-1.5 rounded text-xs font-medium border border-rule text-ink-subtle whitespace-nowrap">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-block px-3 py-1.5 rounded text-xs font-medium border border-rule text-ink whitespace-nowrap">
      {label}
    </span>
  );
}

function OrderRow({ order }: { order: Order }) {
  const { mutate: cancel, isPending } = useCancelOrder();

  const date = formatDate(order.createdAt);

  const canCancel = order.status === ORDER_STATUS.ORDER_COMPLETE;

  return (
    <li className="flex items-center gap-4 py-5">
      {/* 썸네일 */}
      <div className="relative w-14 h-14 bg-fill shrink-0">
        {order.productImage ? (
          <Image
            src={order.productImage}
            alt={order.productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center text-2xs text-ink-subtle">
            이미지
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-muted mb-0.5">{date} · {order.sellerName}</p>
        <Link
          href={`/products/${order.productId}`}
          className="text-sm font-medium text-brand hover:underline block truncate"
        >
          {order.productName}
        </Link>
        <p className="text-sm font-bold text-heading mt-0.5">
          ₩ {order.totalPrice.toLocaleString()}
        </p>
      </div>

      {/* 상태 / 취소 버튼 */}
      <div className="shrink-0">
        {canCancel ? (
          <button
            type="button"
            onClick={() => cancel({ orderId: order.id, productId: order.productId, quantity: order.quantity })}
            disabled={isPending}
            className="inline-block px-3 py-1.5 rounded text-xs font-medium border border-rule text-ink hover:bg-fill transition-colors disabled:opacity-50"
          >
            주문 취소
          </button>
        ) : (
          <StatusBadge status={order.status} />
        )}
      </div>
    </li>
  );
}

export default function BuyerOrderList() {
  const { user } = useAuth();
  const { data: orders, isLoading, isError } = useBuyerOrders(user?.uid);

  return (
    <div className="bg-white border border-rule rounded-lg px-6 py-5">
      <h1 className="text-lg font-bold text-heading mb-0.5">구매 이력</h1>
      <p className="text-xs text-ink-muted mb-5">최근 주문부터 표시</p>

      {isLoading ? (
        <ul className="divide-y divide-rule">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 py-5 animate-pulse">
              <div className="w-14 h-14 bg-fill shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-fill rounded w-16" />
                <div className="h-4 bg-fill rounded w-2/3" />
                <div className="h-4 bg-fill rounded w-24" />
              </div>
              <div className="w-16 h-7 bg-fill rounded shrink-0" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p className="text-sm text-danger py-8 text-center">주문 내역을 불러오지 못했습니다.</p>
      ) : !orders?.length ? (
        <p className="text-sm text-ink-muted py-12 text-center">구매 내역이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-rule">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}
