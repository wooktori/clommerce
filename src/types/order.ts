export type OrderStatus = "pending" | "shipping" | "delivered" | "cancelled";

export interface Order {
  id: string;
  buyerId: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
