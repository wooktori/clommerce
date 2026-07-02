"use client";

import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { useSellerOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { Order, OrderStatus, ORDER_STATUS, ORDER_STATUS_LABEL } from "@/types/order";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  [ORDER_STATUS.ORDER_COMPLETE]:   ORDER_STATUS.PENDING_SHIPMENT,
  [ORDER_STATUS.PENDING_SHIPMENT]: ORDER_STATUS.SHIPPING,
};

function OrderRow({ order }: { order: Order }) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const date = order.createdAt
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");

  const nextStatus = NEXT_STATUS[order.status];
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;

  return (
    <li className="flex items-center gap-4 py-5">
      <div className="relative w-14 h-14 bg-fill shrink-0">
        {order.productImage ? (
          <Image src={order.productImage} alt={order.productName} fill className="object-cover" />
        ) : (
          <div className="flex w-full h-full items-center justify-center text-2xs text-ink-subtle">
            이미지
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-muted mb-0.5">{date} · {order.buyerName}</p>
        <p className="text-xs font-medium text-ink truncate">{order.productName}</p>
        <p className="text-2xs text-ink-muted mt-0.5">
          수량 {order.quantity} · ₩ {order.totalPrice.toLocaleString()}
        </p>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2">
        <span
          className={`text-2xs font-medium px-2.5 py-1 rounded-sm ${
            isCancelled
              ? "bg-fill text-ink-muted"
              : order.status === ORDER_STATUS.SHIPPING
              ? "bg-brand text-white"
              : "bg-fill text-ink"
          }`}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>

        {nextStatus && !isCancelled && (
          <button
            type="button"
            onClick={() => updateStatus({ orderId: order.id, status: nextStatus })}
            disabled={isPending}
            className="text-2xs text-brand underline underline-offset-2 hover:no-underline disabled:opacity-50 transition-all"
          >
            {STATUS_LABEL[nextStatus]}으로 변경
          </button>
        )}
      </div>
    </li>
  );
}

export default function SellerOrderList() {
  const { user } = useAuth();
  const { data: orders, isLoading, isError } = useSellerOrders(user?.uid);

  return (
    <div className="bg-white border border-rule px-6 py-5">
      <h1 className="text-lg font-bold text-heading mb-0.5">주문 관리</h1>
      <p className="text-xs text-ink-muted mb-5">최근 주문부터 표시</p>

      {isLoading ? (
        <ul className="divide-y divide-rule">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 py-5 animate-pulse">
              <div className="w-14 h-14 bg-fill shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-fill rounded w-16" />
                <div className="h-4 bg-fill rounded w-2/3" />
                <div className="h-3 bg-fill rounded w-24" />
              </div>
              <div className="w-20 h-7 bg-fill rounded shrink-0" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p className="text-sm text-danger py-8 text-center">주문 내역을 불러오지 못했습니다.</p>
      ) : !orders?.length ? (
        <p className="text-sm text-ink-muted py-12 text-center">주문 내역이 없습니다.</p>
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
