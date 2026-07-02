import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  cancelOrder,
  updateOrderStatus,
} from "@/services/order";
import { restoreStock } from "@/services/product";
import { Order, OrderStatus } from "@/types/order";

export function useBuyerOrders(buyerId: string | undefined) {
  return useQuery({
    queryKey: ["orders", "buyer", buyerId],
    queryFn: () => getBuyerOrders(buyerId!),
    enabled: !!buyerId,
  });
}

export function useSellerOrders(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["orders", "seller", sellerId],
    queryFn: () => getSellerOrders(sellerId!),
    enabled: !!sellerId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Order, "id" | "createdAt" | "updatedAt">) =>
      createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      productId,
      quantity,
    }: {
      orderId: string;
      productId: string;
      quantity: number;
    }) => {
      await cancelOrder(orderId);
      await restoreStock(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
