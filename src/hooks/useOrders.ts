import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBuyerOrders, cancelOrder } from "@/services/order";

export function useBuyerOrders(buyerId: string | undefined) {
  return useQuery({
    queryKey: ["orders", "buyer", buyerId],
    queryFn: () => getBuyerOrders(buyerId!),
    enabled: !!buyerId,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
