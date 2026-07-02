export const ORDER_STATUS = {
  ORDER_COMPLETE:   "order_complete",
  PENDING_SHIPMENT: "pending_shipment",
  SHIPPING:         "shipping",
  CANCELLED:        "cancelled",
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [ORDER_STATUS.ORDER_COMPLETE]:   "주문 완료",
  [ORDER_STATUS.PENDING_SHIPMENT]: "발송 대기",
  [ORDER_STATUS.SHIPPING]:         "발송 시작",
  [ORDER_STATUS.CANCELLED]:        "주문 취소",
};

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
}
