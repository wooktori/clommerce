export const ORDER_STATUS = {
  ORDER_COMPLETE:   "order_complete",
  PENDING_SHIPMENT: "pending_shipment",
  SHIPPING:         "shipping",
  CANCELLED:        "cancelled",
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

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
